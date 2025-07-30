// hooks/usePokerGame.ts
import { useReducer, useEffect, useCallback, useState } from 'react';
import { GameState, Player, GameStage, PlayerAction, Card, PlayerActionType, Hand } from '../types/poker';
import { STARTING_STACK, SMALL_BLIND, BIG_BLIND, DECK } from '../constants/poker';
import { getAIAction } from '../services/geminiService';

// Simple pokersolver replacement for React Native
const evaluateHand = (cards: string[]): { name: string; rank: number } => {
    if (cards.length < 5) {
        return { name: 'High Card', rank: 0 };
    }
    
    // Basic hand evaluation - you could enhance this or use a proper library
    const ranks = cards.map(card => card.slice(0, -1));
    const suits = cards.map(card => card.slice(-1));
    
    // Count ranks
    const rankCounts: { [key: string]: number } = {};
    ranks.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const isFlush = suits.every(suit => suit === suits[0]);
    
    // Check for straight (simplified)
    const rankValues: { [key: string]: number } = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    const sortedValues = ranks.map(r => rankValues[r]).sort((a, b) => a - b);
    const isStraight = sortedValues.every((val, i) => i === 0 || val === sortedValues[i - 1] + 1);
    
    if (isStraight && isFlush) return { name: 'Straight Flush', rank: 8 };
    if (counts[0] === 4) return { name: 'Four of a Kind', rank: 7 };
    if (counts[0] === 3 && counts[1] === 2) return { name: 'Full House', rank: 6 };
    if (isFlush) return { name: 'Flush', rank: 5 };
    if (isStraight) return { name: 'Straight', rank: 4 };
    if (counts[0] === 3) return { name: 'Three of a Kind', rank: 3 };
    if (counts[0] === 2 && counts[1] === 2) return { name: 'Two Pair', rank: 2 };
    if (counts[0] === 2) return { name: 'Pair', rank: 1 };
    
    return { name: 'High Card', rank: 0 };
};

type GameSettings = { 
    mode: 'ai' | 'multiplayer'; 
    numPlayers: number; 
    playerNames: string[] 
} | null;

type Action =
    | { type: 'START_GAME'; payload: { settings: GameSettings; dealerIndex: number } }
    | { type: 'PLAYER_ACTION'; payload: PlayerAction }
    | { type: 'AI_ACTION'; payload: PlayerAction }
    | { type: 'ADVANCE_ROUND' }
    | { type: 'SHOWDOWN' }
    | { type: 'AWARD_POT'; payload: Player[] }
    | { type: 'SET_MESSAGE'; payload: string };

const shuffleDeck = (deck: Card[]): Card[] => {
    return [...deck].sort(() => Math.random() - 0.5);
};

const getInitialState = (settings: GameSettings, dealerIndex = -1): GameState => {
    const numPlayers = settings?.numPlayers || 2;
    const players: Player[] = settings ? Array.from({ length: numPlayers }, (_, i) => ({
        id: settings.mode === 'ai' && i === 1 ? 'ai' : `player-${i + 1}`,
        name: settings.playerNames[i],
        isHuman: !(settings.mode === 'ai' && i === 1),
        stack: STARTING_STACK,
        hand: [],
        currentBet: 0,
        isAllIn: false,
        hasActed: false,
        isFolded: false,
        lastAction: null,
    })) : [];

    return {
        players,
        deck: shuffleDeck(DECK),
        communityCards: [],
        pot: 0,
        stage: GameStage.PRE_DEAL,
        currentPlayerIndex: dealerIndex,
        dealerIndex,
        smallBlindIndex: -1,
        bigBlindIndex: -1,
        currentBet: 0,
        minRaise: BIG_BLIND,
        lastRaiserIndex: null,
        gameMessage: 'Select game settings to begin.',
        handOver: null,
        isHandInProgress: false,
    };
};

const getNextActivePlayerIndex = (startIndex: number, players: Player[]): number => {
    let currentIndex = startIndex;
    for (let i = 0; i < players.length; i++) {
        currentIndex = (startIndex + i) % players.length;
        const player = players[currentIndex];
        if (!player.isFolded && !player.isAllIn) {
            return currentIndex;
        }
    }
    return -1;
};

const pokerReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'START_GAME': {
            const { settings, dealerIndex } = action.payload;
            const baseState = getInitialState(settings, dealerIndex);
            
            baseState.players.forEach(p => {
                if(p.stack < BIG_BLIND) p.isFolded = true;
            });
            const activePlayers = baseState.players.filter(p=>!p.isFolded);
            if(activePlayers.length < 2) {
                 return { ...baseState, gameMessage: "Not enough players with stacks to play."};
            }

            const sbIndex = getNextActivePlayerIndex((dealerIndex + 1) % baseState.players.length, baseState.players);
            const bbIndex = getNextActivePlayerIndex((sbIndex + 1) % baseState.players.length, baseState.players);

            const smallBlindPlayer = baseState.players[sbIndex];
            const bigBlindPlayer = baseState.players[bbIndex];

            const sbAmount = Math.min(SMALL_BLIND, smallBlindPlayer.stack);
            smallBlindPlayer.stack -= sbAmount;
            smallBlindPlayer.currentBet = sbAmount;
            smallBlindPlayer.isAllIn = smallBlindPlayer.stack === 0;

            const bbAmount = Math.min(BIG_BLIND, bigBlindPlayer.stack);
            bigBlindPlayer.stack -= bbAmount;
            bigBlindPlayer.currentBet = bbAmount;
            bigBlindPlayer.isAllIn = bigBlindPlayer.stack === 0;

            baseState.pot = sbAmount + bbAmount;
            baseState.currentBet = bbAmount;
            baseState.minRaise = BIG_BLIND;
            baseState.smallBlindIndex = sbIndex;
            baseState.bigBlindIndex = bbIndex;

            baseState.players.forEach(p => {
                if (!p.isFolded) {
                    p.hand = [baseState.deck.pop()!, baseState.deck.pop()!];
                }
            });

            baseState.stage = GameStage.PRE_FLOP;
            baseState.currentPlayerIndex = getNextActivePlayerIndex((bbIndex + 1) % baseState.players.length, baseState.players);
            baseState.lastRaiserIndex = bbIndex;
            baseState.gameMessage = `Blinds posted. ${baseState.players[baseState.currentPlayerIndex].name}'s turn.`;
            baseState.handOver = null;
            baseState.isHandInProgress = true;
            return baseState;
        }

        case 'PLAYER_ACTION':
        case 'AI_ACTION': {
            let newState = { ...state, players: state.players.map(p => ({ ...p })) };
            const playerIndex = newState.currentPlayerIndex;
            const player = newState.players[playerIndex];
            const { type, amount = 0 } = action.payload;

            player.hasActed = true;
            player.lastAction = type;

            switch (type) {
                case PlayerActionType.FOLD:
                    player.isFolded = true;
                    break;
                case PlayerActionType.CHECK:
                    break;
                case PlayerActionType.CALL:
                    const callAmount = Math.min(newState.currentBet - player.currentBet, player.stack);
                    player.stack -= callAmount;
                    player.currentBet += callAmount;
                    newState.pot += callAmount;
                    if (player.stack === 0) player.isAllIn = true;
                    break;
                case PlayerActionType.BET:
                    const betAmount = Math.min(amount, player.stack);
                    player.stack -= betAmount;
                    player.currentBet += betAmount;
                    newState.pot += betAmount;
                    newState.currentBet = player.currentBet;
                    newState.minRaise = betAmount;
                    newState.lastRaiserIndex = playerIndex;
                    if (player.stack === 0) player.isAllIn = true;
                    break;
                case PlayerActionType.RAISE:
                    const totalBet = newState.currentBet - player.currentBet + amount;
                    const raiseAmount = Math.min(totalBet, player.stack);
                    player.stack -= raiseAmount;
                    player.currentBet += raiseAmount;
                    newState.pot += raiseAmount;
                    newState.minRaise = player.currentBet - newState.currentBet;
                    newState.currentBet = player.currentBet;
                    newState.lastRaiserIndex = playerIndex;
                    if (player.stack === 0) player.isAllIn = true;
                    break;
            }

            const remainingPlayers = newState.players.filter(p => !p.isFolded);
            if (remainingPlayers.length === 1) {
                return pokerReducer(newState, { type: 'AWARD_POT', payload: remainingPlayers });
            }

            const nextPlayerIndex = getNextActivePlayerIndex((playerIndex + 1) % newState.players.length, newState.players);
            const activePlayers = newState.players.filter(p => !p.isFolded && !p.isAllIn);
            const highestBet = Math.max(...activePlayers.map(p => p.currentBet));
            const allActivePlayersHaveBet = activePlayers.every(p => (p.currentBet === highestBet || p.isAllIn) && p.hasActed);
            const actionComesToRaiser = nextPlayerIndex === newState.lastRaiserIndex;
            const everyoneChecked = activePlayers.every(p => p.hasActed && p.lastAction === PlayerActionType.CHECK);
            
            if (actionComesToRaiser || allActivePlayersHaveBet || everyoneChecked) {
                 return pokerReducer(newState, { type: 'ADVANCE_ROUND' });
            }

            newState.currentPlayerIndex = nextPlayerIndex;
            newState.gameMessage = `${newState.players[nextPlayerIndex].name}'s turn.`;
            return newState;
        }

        case 'ADVANCE_ROUND': {
             let newState = { ...state, players: state.players.map(p => ({ ...p })) };
            
            if (newState.stage === GameStage.RIVER) {
                return pokerReducer(newState, { type: 'SHOWDOWN' });
            }

            newState.pot += newState.players.reduce((sum, p) => sum + p.currentBet, 0);
            newState.players.forEach(p => {
                p.currentBet = 0;
                p.hasActed = false;
                p.lastAction = null;
            });
            newState.currentBet = 0;
            newState.minRaise = BIG_BLIND;
            newState.currentPlayerIndex = getNextActivePlayerIndex((newState.dealerIndex + 1) % newState.players.length, newState.players);
            newState.lastRaiserIndex = newState.currentPlayerIndex;
            
            let newCommunityCards = [...newState.communityCards];
            let newStage: GameStage = newState.stage;
            
            switch (newState.stage) {
                case GameStage.PRE_FLOP:
                    newStage = GameStage.FLOP;
                    newCommunityCards = [newState.deck.pop()!, newState.deck.pop()!, newState.deck.pop()!];
                    break;
                case GameStage.FLOP:
                    newStage = GameStage.TURN;
                    newCommunityCards.push(newState.deck.pop()!);
                    break;
                case GameStage.TURN:
                    newStage = GameStage.RIVER;
                    newCommunityCards.push(newState.deck.pop()!);
                    break;
            }
            newState.stage = newStage;
            newState.communityCards = newCommunityCards;
            newState.gameMessage = `${newStage}. ${newState.players[newState.currentPlayerIndex].name}'s turn.`;
            return newState;
        }

        case 'SHOWDOWN': {
            let finalState = { ...state, stage: GameStage.SHOWDOWN };
            finalState.pot += finalState.players.reduce((sum, p) => sum + p.currentBet, 0);
            finalState.players.forEach(p => p.currentBet = 0);

            const activePlayers = finalState.players.filter(p => !p.isFolded);
            if(activePlayers.length === 1) {
                 return pokerReducer(finalState, { type: 'AWARD_POT', payload: activePlayers });
            }

            const hands = activePlayers.map(p => {
                const hand = evaluateHand([...p.hand, ...finalState.communityCards]);
                return {
                    player: p,
                    hand: hand,
                    rank: hand.rank
                };
            });

            const maxRank = Math.max(...hands.map(h => h.rank));
            const winners = hands.filter(h => h.rank === maxRank);
            const winningHands = winners.map(w => ({
                name: w.player.name,
                hand: w.hand
            }));

            const pot = finalState.pot;
            finalState.players.forEach(p=> {
                if(winningHands.some(wh => wh.name === p.name)) {
                    p.stack += Math.floor(pot / winningHands.length);
                }
            });

            return {
                ...finalState,
                handOver: { winners: winningHands, pot: pot },
                isHandInProgress: false,
            };
        }

        case 'AWARD_POT': {
            let finalState = { ...state };
            finalState.pot += finalState.players.reduce((sum, p) => sum + p.currentBet, 0);
            finalState.players.forEach(p => p.currentBet = 0);
            
            const winner = action.payload[0];
            const winningPlayer = finalState.players.find(p => p.id === winner.id)!;
            winningPlayer.stack += finalState.pot;
            
            const hand = winner.hand.length > 0 ? evaluateHand([...winner.hand, ...finalState.communityCards]) : { name: 'High Card', rank: 0 };
            
            return {
                ...finalState,
                handOver: { winners: [{ name: winner.name, hand: hand }], pot: finalState.pot },
                isHandInProgress: false
            };
        }

        case 'SET_MESSAGE':
            return { ...state, gameMessage: action.payload };

        default:
            return state;
    }
};

export const usePokerGame = (settings: GameSettings) => {
    const [dealer, setDealer] = useState(-1);
    const [state, dispatch] = useReducer(pokerReducer, getInitialState(settings, dealer));
    const [isProcessing, setIsProcessing] = useState(false);

    const isAITurn = !state.handOver && state.isHandInProgress && state.players[state.currentPlayerIndex]?.id === 'ai' && !isProcessing;

    useEffect(() => {
        if(isAITurn) {
            const handleAITurn = async () => {
                setIsProcessing(true);
                dispatch({ type: 'SET_MESSAGE', payload: 'AI is thinking...' });
                try {
                    const aiAction = await getAIAction(state);
                    dispatch({ type: 'AI_ACTION', payload: aiAction });
                } catch (error) {
                    console.error("Error getting AI action:", error);
                    dispatch({ type: 'AI_ACTION', payload: { type: PlayerActionType.FOLD } });
                } finally {
                    setIsProcessing(false);
                }
            };
            const timeoutId = setTimeout(handleAITurn, 1500);
            return () => clearTimeout(timeoutId);
        }
    }, [isAITurn, state]);

    const startGame = useCallback(() => {
        const nextDealerIndex = getNextActivePlayerIndex((dealer + 1) % (settings?.numPlayers || 2), state.players);
        setDealer(nextDealerIndex);
        dispatch({ type: 'START_GAME', payload: { settings, dealerIndex: nextDealerIndex } });
    }, [dealer, settings, state.players]);

    const playerAction = (action: PlayerAction) => {
        const player = state.players[state.currentPlayerIndex];
        if(player?.isHuman && !state.handOver && state.isHandInProgress) {
            dispatch({ type: 'PLAYER_ACTION', payload: action });
        }
    };
    
    return { gameState: state, startGame, playerAction };
};