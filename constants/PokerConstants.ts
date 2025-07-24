// constants/PokerConstants.ts

export const POKER_CONSTANTS = {
  // Game settings
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  DEFAULT_STARTING_CHIPS: 1000,
  
  // Blind levels
  BLIND_LEVELS: [
    { small: 5, big: 10 },
    { small: 10, big: 20 },
    { small: 25, big: 50 },
    { small: 50, big: 100 },
  ],
  
  // Timing
  ACTION_TIMEOUT: 30000, // 30 seconds
  BOT_DECISION_DELAY: { min: 1000, max: 3000 }, // 1-3 seconds
  
  // UI
  CARD_ANIMATION_DURATION: 500,
  POT_ANIMATION_DURATION: 300,
};

export const CARD_SUITS = {
  SPADES: '♠',
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
} as const;

export const CARD_VALUES = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
  'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A'
} as const;

export type CardSuit = keyof typeof CARD_SUITS;
export type CardValue = keyof typeof CARD_VALUES;

export const BOT_PERSONALITIES = {
  TIGHT: { foldRate: 0.7, raiseRate: 0.1 },
  LOOSE: { foldRate: 0.3, raiseRate: 0.4 },
  AGGRESSIVE: { foldRate: 0.4, raiseRate: 0.5 },
  PASSIVE: { foldRate: 0.5, raiseRate: 0.1 },
} as const;