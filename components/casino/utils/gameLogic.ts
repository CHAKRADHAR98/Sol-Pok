// components/casino/utils/gameLogic.ts - Put this in a separate file
import { Suit, Rank, Card, Hand } from '../types';

// Blackjack Logic
export const createDeck = (): Card[] => {
  const suits = Object.values(Suit);
  const ranks = Object.values(Rank);
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
};

const getRankValue = (rank: Rank): number => {
  if (rank === Rank.Ace) return 11;
  if ([Rank.Jack, Rank.Queen, Rank.King].includes(rank)) return 10;
  return parseInt(rank, 10);
};

export const calculateHandValue = (hand: Hand): number => {
  let value = 0;
  let aceCount = 0;

  for (const card of hand) {
    value += getRankValue(card.rank);
    if (card.rank === Rank.Ace) {
      aceCount++;
    }
  }

  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }

  return value;
};

// Mines Logic
const HOUSE_EDGE = 0.01;
const TOTAL_TILES = 25;

// Memoize factorial calculations for performance
const factorial = (() => {
    const cache: { [key: number]: number } = {};
    const calculate = (n: number): number => {
        if (n === 0 || n === 1) return 1;
        if (cache[n]) return cache[n];
        cache[n] = n * calculate(n - 1);
        return cache[n];
    };
    return calculate;
})();

// Combination function: C(n, k) = n! / (k! * (n-k)!)
const combinations = (n: number, k: number): number => {
    if (k < 0 || k > n) {
        return 0;
    }
    return factorial(n) / (factorial(k) * factorial(n - k));
};

export const generateMines = (mineCount: number): number[] => {
    const mines = new Set<number>();
    while (mines.size < mineCount) {
        const randomIndex = Math.floor(Math.random() * TOTAL_TILES);
        mines.add(randomIndex);
    }
    return Array.from(mines);
};

export const calculateMultiplier = (picksCount: number, minesCount: number): number => {
    if (picksCount === 0) {
        return 1;
    }
    const safeTilesCount = TOTAL_TILES - minesCount;
    if (picksCount > safeTilesCount) {
        return 0; // Should not happen in normal gameplay
    }
    
    const prob = combinations(safeTilesCount, picksCount) / combinations(TOTAL_TILES, picksCount);
    
    if (prob === 0) return 0;
    
    const multiplier = (1 - HOUSE_EDGE) / prob;
    
    return parseFloat(multiplier.toFixed(2));
};