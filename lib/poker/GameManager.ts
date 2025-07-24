// lib/poker/GameManager.ts
import { TexasHoldemEngine, HoldemPlayer, GameState, PlayerAction, HandResult } from './TexasHoldem';
import { Deck, Card } from '@creativenull/deckjs';

export type LocalGameConfig = {
  playerId: string;
  playerName: string;
  buyIn: number;
  blinds: { small: number; big: number };
  botCount: number;
};

export type GameEvent = {
  type: 'player_action' | 'cards_dealt' | 'stage_change' | 'game_end' | 'error';
  data: any;
  timestamp: number;
};

/**
 * Local Game Manager for Single-Player Poker
 * Manages a local game with AI bots for testing and offline play
 */
export class LocalPokerGameManager {
  private engine: TexasHoldemEngine;
  private gameId: string;
  private playerId: string;
  private listeners: ((event: GameEvent) => void)[] = [];
  private botDecisionTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(config: LocalGameConfig) {
    this.gameId = `local_${Date.now()}`;
    this.playerId = config.playerId;
    
    // Create players array with human player + bots
    const players = [
      config.playerId, 
      ...Array.from({ length: config.botCount }, (_, i) => `bot_${i + 1}`)
    ];
    
    this.engine = new TexasHoldemEngine(this.gameId, players, config.blinds);
    
    // Initialize bot players with names and basic AI settings
    this.initializeBots();
  }

  /**
   * Start a new hand
   */
  startNewHand(): GameState {
    const gameState = this.engine.startNewHand();
    
    this.emitEvent({
      type: 'cards_dealt',
      data: { gameState: this.getPlayerGameState() },
      timestamp: Date.now()
    });
    
    // If it's a bot's turn, schedule bot action
    this.scheduleBotActionIfNeeded();
    
    return gameState;
  }

  /**
   * Process human player action
   */
  processPlayerAction(action: Omit<PlayerAction, 'playerId'>): GameState | null {
    try {
      const fullAction: PlayerAction = {
        ...action,
        playerId: this.playerId
      };
      
      const gameState = this.engine.processAction(fullAction);
      
      this.emitEvent({
        type: 'player_action',
        data: { 
          action: fullAction, 
          gameState: this.getPlayerGameState() 
        },
        timestamp: Date.now()
      });
      
      // Schedule next bot action if needed
      this.scheduleBotActionIfNeeded();
      
      return gameState;
      
    } catch (error) {
      this.emitEvent({
        type: 'error',
        data: { message: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: Date.now()
      });
      return null;
    }
  }

  /**
   * Get game state visible to human player (hides bot cards)
   */
  getPlayerGameState(): Partial<GameState> {
    return this.engine.getPublicGameState(this.playerId);
  }

  /**
   * Get valid actions for human player
   */
  getValidActions(): PlayerAction['action'][] {
    const gameState = this.engine.getGameState();
    const player = gameState.players.find((p: HoldemPlayer) => p.id === this.playerId);
    
    if (!player || player.isFolded || !player.isActive) {
      return [];
    }
    
    const actions: PlayerAction['action'][] = [];
    
    // Can always fold (unless already folded)
    actions.push('fold');
    
    // Can check if no bet to call
    if (player.currentBet === gameState.currentBet) {
      actions.push('check');
    } else {
      // Must call or raise if there's a bet
      actions.push('call');
    }
    
    // Can raise if has chips
    if (player.chips > 0) {
      actions.push('raise');
    }
    
    // Can go all-in if has chips
    if (player.chips > 0) {
      actions.push('all-in');
    }
    
    return actions;
  }

  /**
   * Initialize bot players with simple AI
   */
  private initializeBots(): void {
    const gameState = this.engine.getGameState();
    gameState.players.forEach((player: HoldemPlayer, index: number) => {
      if (player.id !== this.playerId) {
        player.name = `Bot ${index}`;
      }
    });
  }

  /**
   * Schedule bot action if it's a bot's turn
   */
  private scheduleBotActionIfNeeded(): void {
    const gameState = this.engine.getGameState();
    const currentPlayer = this.getCurrentPlayer();
    
    if (currentPlayer && currentPlayer.id !== this.playerId && !currentPlayer.isFolded) {
      // Clear existing timeout
      if (this.botDecisionTimeout) {
        clearTimeout(this.botDecisionTimeout);
      }
      
      // Schedule bot action after realistic delay (1-3 seconds)
      const delay = Math.random() * 2000 + 1000;
      this.botDecisionTimeout = setTimeout(() => {
        this.processBotAction(currentPlayer.id);
      }, delay);
    }
  }

  /**
   * Get current player whose turn it is
   */
  private getCurrentPlayer(): HoldemPlayer | null {
    const gameState = this.engine.getGameState();
    const activePlayers = gameState.players.filter((p: HoldemPlayer) => p.isActive && !p.isFolded);
    
    if (activePlayers.length === 0) return null;
    
    return activePlayers[gameState.currentPlayerIndex % activePlayers.length] || null;
  }

  /**
   * Process bot action using simple AI
   */
  private processBotAction(botId: string): void {
    const gameState = this.engine.getGameState();
    const bot = gameState.players.find((p: HoldemPlayer) => p.id === botId);
    
    if (!bot || bot.isFolded || !bot.isActive) return;
    
    // Simple bot AI logic
    const action = this.getBotAction(bot, gameState);
    
    try {
      const newGameState = this.engine.processAction(action);
      
      this.emitEvent({
        type: 'player_action',
        data: { 
          action, 
          gameState: this.getPlayerGameState() 
        },
        timestamp: Date.now()
      });
      
      // Continue with next bot if needed
      this.scheduleBotActionIfNeeded();
      
    } catch (error) {
      console.error('Bot action error:', error);
    }
  }

  /**
   * Simple bot AI decision making
   */
  private getBotAction(bot: HoldemPlayer, gameState: GameState): PlayerAction {
    // Very basic AI - can be enhanced later
    const callAmount = gameState.currentBet - bot.currentBet;
    const potOdds = callAmount / (gameState.pot + callAmount);
    
    // Random factor for unpredictability
    const randomFactor = Math.random();
    
    // Simple decision tree
    if (randomFactor < 0.15) {
      // 15% chance to fold
      return { playerId: bot.id, action: 'fold' };
    } else if (randomFactor < 0.7) {
      // 55% chance to call/check
      if (bot.currentBet === gameState.currentBet) {
        return { playerId: bot.id, action: 'check' };
      } else {
        return { playerId: bot.id, action: 'call' };
      }
    } else if (randomFactor < 0.9 && bot.chips > callAmount * 2) {
      // 20% chance to raise (if has enough chips)
      const raiseAmount = gameState.currentBet + Math.floor(gameState.blinds.big * (1 + Math.random() * 3));
      return { 
        playerId: bot.id, 
        action: 'raise', 
        amount: Math.min(raiseAmount, bot.chips + bot.currentBet) 
      };
    } else {
      // Default to call/check
      if (bot.currentBet === gameState.currentBet) {
        return { playerId: bot.id, action: 'check' };
      } else {
        return { playerId: bot.id, action: 'call' };
      }
    }
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: GameEvent) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: GameEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: GameEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.botDecisionTimeout) {
      clearTimeout(this.botDecisionTimeout);
    }
    this.listeners = [];
  }
}