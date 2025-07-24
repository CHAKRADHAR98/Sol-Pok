// lib/poker/TexasHoldem.ts
import { Deck, type Card } from "@creativenull/deckjs";
import { Poker, type Player, type PlayerResult } from "./Poker";

// Texas Hold'em specific types
export type HoldemPlayer = {
  id: string;
  name: string;
  holeCards: Card[]; // 2 private cards
  chips: number;
  currentBet: number;
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  position: number;
};

export type GameState = {
  id: string;
  players: HoldemPlayer[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  dealerPosition: number;
  currentPlayerIndex: number;
  stage: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  blinds: { small: number; big: number };
};

export type PlayerAction = {
  playerId: string;
  action: 'fold' | 'call' | 'raise' | 'check' | 'all-in';
  amount?: number;
};

export type HandResult = {
  playerId: string;
  bestHand: Card[];
  handRank: number;
  handName: string;
  winnings: number;
};

/**
 * Texas Hold'em Poker Engine
 * Extends the base Poker class to handle Hold'em specific logic
 */
export class TexasHoldemEngine extends Poker {
  private gameState: GameState;
  private currentDeck: Deck;
  
  constructor(gameId: string, players: string[], blinds: { small: number; big: number }) {
    super(false); // Don't pre-shuffle, we'll manage our own deck
    
    // Create our own deck instance for better control
    this.currentDeck = new Deck(true);
    
    this.gameState = {
      id: gameId,
      players: players.map((id, index) => ({
        id,
        name: `Player ${index + 1}`,
        holeCards: [],
        chips: 1000, // Starting chips
        currentBet: 0,
        isActive: true,
        isFolded: false,
        isAllIn: false,
        position: index
      })),
      communityCards: [],
      pot: 0,
      currentBet: 0,
      dealerPosition: 0,
      currentPlayerIndex: 0,
      stage: 'preflop',
      blinds
    };
  }

  /**
   * Reset and reshuffle the deck
   */
  private resetDeck(): void {
    // Create a fresh deck and shuffle it
    this.currentDeck = new Deck(true);
  }

  /**
   * Get cards from current deck
   */
  private getDeckCards(count: number): Card[] {
    return this.currentDeck.getCards(count);
  }

  /**
   * Start a new hand
   */
  startNewHand(): GameState {
    // Reset deck and shuffle
    this.resetDeck();
    
    // Reset players for new hand
    this.gameState.players.forEach(player => {
      player.holeCards = [];
      player.currentBet = 0;
      player.isFolded = false;
      player.isAllIn = false;
      player.isActive = player.chips > 0;
    });
    
    // Reset game state
    this.gameState.communityCards = [];
    this.gameState.pot = 0;
    this.gameState.currentBet = 0;
    this.gameState.stage = 'preflop';
    
    // Deal hole cards (2 cards per player)
    this.gameState.players.forEach(player => {
      if (player.isActive) {
        player.holeCards = this.getDeckCards(2);
      }
    });
    
    // Post blinds
    this.postBlinds();
    
    return this.gameState;
  }

  /**
   * Post small and big blinds
   */
  private postBlinds(): void {
    const activePlayers = this.gameState.players.filter(p => p.isActive);
    if (activePlayers.length < 2) return;
    
    // Small blind
    const smallBlindPlayer = activePlayers[(this.gameState.dealerPosition + 1) % activePlayers.length];
    this.makeBet(smallBlindPlayer.id, this.gameState.blinds.small);
    
    // Big blind
    const bigBlindPlayer = activePlayers[(this.gameState.dealerPosition + 2) % activePlayers.length];
    this.makeBet(bigBlindPlayer.id, this.gameState.blinds.big);
    
    this.gameState.currentBet = this.gameState.blinds.big;
  }

  /**
   * Process a player action
   */
  processAction(action: PlayerAction): GameState {
    const player = this.gameState.players.find(p => p.id === action.playerId);
    if (!player || !player.isActive || player.isFolded) {
      throw new Error('Invalid player or action');
    }

    switch (action.action) {
      case 'fold':
        player.isFolded = true;
        break;
        
      case 'call':
        const callAmount = this.gameState.currentBet - player.currentBet;
        this.makeBet(player.id, callAmount);
        break;
        
      case 'raise':
        if (!action.amount || action.amount <= this.gameState.currentBet) {
          throw new Error('Invalid raise amount');
        }
        const raiseAmount = action.amount - player.currentBet;
        this.makeBet(player.id, raiseAmount);
        this.gameState.currentBet = action.amount;
        break;
        
      case 'check':
        if (player.currentBet !== this.gameState.currentBet) {
          throw new Error('Cannot check - must call or raise');
        }
        break;
        
      case 'all-in':
        this.makeBet(player.id, player.chips);
        player.isAllIn = true;
        break;
    }
    
    // Check if betting round is complete
    if (this.isBettingRoundComplete()) {
      this.advanceToNextStage();
    }
    
    return this.gameState;
  }

  /**
   * Make a bet for a player
   */
  private makeBet(playerId: string, amount: number): void {
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return;
    
    const betAmount = Math.min(amount, player.chips);
    player.chips -= betAmount;
    player.currentBet += betAmount;
    this.gameState.pot += betAmount;
    
    if (player.chips === 0) {
      player.isAllIn = true;
    }
  }

  /**
   * Check if betting round is complete
   */
  private isBettingRoundComplete(): boolean {
    const activePlayers = this.gameState.players.filter(p => p.isActive && !p.isFolded);
    
    // Only one player left
    if (activePlayers.length <= 1) {
      return true;
    }
    
    // All players have either folded, called, or are all-in
    return activePlayers.every(player => 
      player.isFolded || 
      player.isAllIn || 
      player.currentBet === this.gameState.currentBet
    );
  }

  /**
   * Advance to next stage of the game
   */
  private advanceToNextStage(): void {
    // Reset current bets for next round
    this.gameState.players.forEach(player => {
      player.currentBet = 0;
    });
    this.gameState.currentBet = 0;
    
    switch (this.gameState.stage) {
      case 'preflop':
        // Deal flop (3 community cards)
        this.gameState.communityCards = this.getDeckCards(3);
        this.gameState.stage = 'flop';
        break;
        
      case 'flop':
        // Deal turn (1 community card)
        this.gameState.communityCards.push(...this.getDeckCards(1));
        this.gameState.stage = 'turn';
        break;
        
      case 'turn':
        // Deal river (1 community card)
        this.gameState.communityCards.push(...this.getDeckCards(1));
        this.gameState.stage = 'river';
        break;
        
      case 'river':
        this.gameState.stage = 'showdown';
        this.evaluateWinners();
        break;
    }
  }

  /**
   * Evaluate winners using the best 5-card hand from 7 available cards
   */
  private evaluateWinners(): HandResult[] {
    const activePlayers = this.gameState.players.filter(p => p.isActive && !p.isFolded);
    
    const playerHands: Player[] = activePlayers.map(player => {
      // Find best 5-card hand from player's 2 hole cards + 5 community cards
      const allCards = [...player.holeCards, ...this.gameState.communityCards];
      const bestHand = this.findBestFiveCardHand(allCards);
      
      return {
        id: player.id,
        hand: bestHand
      };
    });
    
    // Use parent class winner method to evaluate hands
    const results = this.winner(playerHands);
    
    // Distribute winnings
    return this.distributeWinnings(results);
  }

  /**
   * Find the best 5-card hand from 7 available cards
   */
  private findBestFiveCardHand(cards: Card[]): Card[] {
    if (cards.length !== 7) {
      throw new Error('Must have exactly 7 cards to evaluate');
    }
    
    let bestHand: Card[] = [];
    let bestRank = -1;
    let bestTieBreaker = -1;
    
    // Generate all possible 5-card combinations from 7 cards
    const combinations = this.getCombinations(cards, 5);
    
    for (const combination of combinations) {
      const testPlayer: Player = { id: 'test', hand: combination };
      const result = this.winner([testPlayer])[0];
      
      if (result.handRank > bestRank || 
          (result.handRank === bestRank && result.tieBreakerCardRank > bestTieBreaker)) {
        bestHand = combination;
        bestRank = result.handRank;
        bestTieBreaker = result.tieBreakerCardRank;
      }
    }
    
    return bestHand;
  }

  /**
   * Generate all combinations of k elements from array
   */
  private getCombinations<T>(array: T[], k: number): T[][] {
    if (k === 1) return array.map(el => [el]);
    if (k === array.length) return [array];
    
    const combinations: T[][] = [];
    for (let i = 0; i <= array.length - k; i++) {
      const head = array[i];
      const tailCombinations = this.getCombinations(array.slice(i + 1), k - 1);
      for (const tail of tailCombinations) {
        combinations.push([head, ...tail]);
      }
    }
    return combinations;
  }

  /**
   * Distribute winnings to winners
   */
  private distributeWinnings(results: PlayerResult[]): HandResult[] {
    const winners = results.filter((result, index) => {
      return index === 0 || (
        result.handRank === results[0].handRank &&
        result.tieBreakerCardRank === results[0].tieBreakerCardRank
      );
    });
    
    const winningsPerPlayer = Math.floor(this.gameState.pot / winners.length);
    
    return winners.map(winner => {
      const player = this.gameState.players.find(p => p.id === winner.id);
      if (player) {
        player.chips += winningsPerPlayer;
      }
      
      return {
        playerId: winner.id,
        bestHand: [], // Would need to store this from evaluation
        handRank: winner.handRank,
        handName: winner.name,
        winnings: winningsPerPlayer
      };
    });
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Get public game state (hiding hole cards of other players)
   */
  getPublicGameState(playerId: string): Partial<GameState> {
    const publicState = { ...this.gameState };
    
    // Hide other players' hole cards
    publicState.players = publicState.players.map(player => ({
      ...player,
      holeCards: player.id === playerId ? player.holeCards : []
    }));
    
    return publicState;
  }
}