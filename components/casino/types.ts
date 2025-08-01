// Blackjack Types
export enum Suit {
  Hearts = '♥',
  Diamonds = '♦',
  Clubs = '♣',
  Spades = '♠',
}

export enum Rank {
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
  Ace = 'A',
}

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type Hand = Card[];

export enum GamePhase {
  BETTING = 'BETTING',
  PLAYER_TURN = 'PLAYER_TURN',
  DEALER_TURN = 'DEALER_TURN',
  FINISHED = 'FINISHED',
}

export enum GameResult {
  PLAYER_WINS = 'PLAYER_WINS',
  DEALER_WINS = 'DEALER_WINS',
  BLACKJACK = 'BLACKJACK',
  BUST = 'BUST',
  PUSH = 'PUSH',
  NONE = 'NONE',
}

// Mines Types
export enum GameState {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  LOST = 'LOST',
  WON = 'WON',
}

export interface Tile {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
}