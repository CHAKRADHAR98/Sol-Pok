// types/poker.ts
export type Hand = {
    name: string;
    [key: string]: any;
};

export enum Suit {
    Spades = 's',
    Hearts = 'h',
    Diamonds = 'd',
    Clubs = 'c'
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
    Ten = 'T',
    Jack = 'J',
    Queen = 'Q',
    King = 'K',
    Ace = 'A'
}

export type Card = string; // e.g., 'As' for Ace of Spades, 'Th' for Ten of Hearts

export interface Player {
    id: string;
    name: string;
    isHuman: boolean;
    stack: number;
    hand: Card[];
    currentBet: number;
    isAllIn: boolean;
    hasActed: boolean;
    lastAction: PlayerActionType | null;
    isFolded: boolean;
}

export enum GameStage {
    PRE_DEAL = 'PRE_DEAL',
    PRE_FLOP = 'PRE_FLOP',
    FLOP = 'FLOP',
    TURN = 'TURN',
    RIVER = 'RIVER',
    SHOWDOWN = 'SHOWDOWN'
}

export enum PlayerActionType {
    FOLD = 'FOLD',
    CHECK = 'CHECK',
    CALL = 'CALL',
    BET = 'BET',
    RAISE = 'RAISE',
}

export interface PlayerAction {
    type: PlayerActionType;
    amount?: number;
}

export interface HandResult {
    winners: { player: Player; hand: Hand }[];
    pot: number;
}

export interface GameState {
    players: Player[];
    deck: Card[];
    communityCards: Card[];
    pot: number;
    stage: GameStage;
    currentPlayerIndex: number;
    dealerIndex: number;
    smallBlindIndex: number;
    bigBlindIndex: number;
    currentBet: number;
    minRaise: number;
    lastRaiserIndex: number | null;
    gameMessage: string;
    handOver: { winners: {name: string, hand: Hand}[], pot: number } | null;
    isHandInProgress: boolean;
}