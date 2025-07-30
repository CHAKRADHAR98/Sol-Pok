// constants/poker.ts
import { Suit, Rank, Card } from '../types/poker';

export const SUITS: Suit[] = [Suit.Spades, Suit.Hearts, Suit.Diamonds, Suit.Clubs];
export const RANKS: Rank[] = [
    Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, 
    Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace
];

export const DECK: Card[] = SUITS.flatMap(suit => 
    RANKS.map(rank => `${rank}${suit}`)
);

export const STARTING_STACK = 1000;
export const SMALL_BLIND = 10;
export const BIG_BLIND = 20;
export const MAX_PLAYERS = 4;

// Export all constants as a single object as well for easier importing
export const POKER_CONSTANTS = {
    STARTING_STACK,
    SMALL_BLIND,
    BIG_BLIND,
    MAX_PLAYERS,
    SUITS,
    RANKS,
    DECK
};