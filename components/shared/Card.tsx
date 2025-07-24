// components/shared/Card.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card as DeckCard } from '@creativenull/deckjs';

interface CardProps {
  card?: DeckCard;
  isHidden?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isHidden = false, 
  size = 'medium',
  style
}) => {
  const getSuitColor = (suitValue: string): string => {
    return suitValue === 'hearts' || suitValue === 'diamonds' ? '#e53e3e' : '#2d3748';
  };

  const getSuitSymbol = (suitValue: string): string => {
    switch (suitValue) {
      case 'spades': return '♠';
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      default: return '';
    }
  };

  const cardSizes = {
    small: { width: 40, height: 56 },
    medium: { width: 60, height: 84 },
    large: { width: 80, height: 112 },
  };

  const fontSizes = {
    small: { value: 12, suit: 10 },
    medium: { value: 16, suit: 14 },
    large: { value: 20, suit: 18 },
  };

  if (isHidden || !card) {
    return (
      <View 
        style={[
          styles.card, 
          styles.hiddenCard, 
          cardSizes[size],
          style
        ]}
      >
        <View style={styles.cardBack}>
          <Text style={styles.cardBackText}>🂠</Text>
        </View>
      </View>
    );
  }

  const suitColor = getSuitColor(card.suit.value);
  const suitSymbol = getSuitSymbol(card.suit.value);

  return (
    <View 
      style={[
        styles.card, 
        cardSizes[size],
        style
      ]}
    >
      <View style={styles.cardFront}>
        {/* Top left value and suit */}
        <View style={styles.topLeft}>
          <Text style={[styles.cardValue, { color: suitColor, fontSize: fontSizes[size].value }]}>
            {card.value}
          </Text>
          <Text style={[styles.cardSuit, { color: suitColor, fontSize: fontSizes[size].suit }]}>
            {suitSymbol}
          </Text>
        </View>
        
        {/* Center suit (for medium and large cards) */}
        {size !== 'small' && (
          <View style={styles.center}>
            <Text style={[styles.centerSuit, { color: suitColor }]}>
              {suitSymbol}
            </Text>
          </View>
        )}
        
        {/* Bottom right value and suit (rotated) */}
        <View style={styles.bottomRight}>
          <Text style={[styles.cardSuit, { color: suitColor, fontSize: fontSizes[size].suit }]}>
            {suitSymbol}
          </Text>
          <Text style={[styles.cardValue, { color: suitColor, fontSize: fontSizes[size].value }]}>
            {card.value}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    margin: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hiddenCard: {
    backgroundColor: '#2d3748',
  },
  cardBack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a202c',
    borderRadius: 7,
  },
  cardBackText: {
    fontSize: 24,
    color: '#4299e1',
  },
  cardFront: {
    flex: 1,
    position: 'relative',
  },
  topLeft: {
    position: 'absolute',
    top: 4,
    left: 4,
    alignItems: 'center',
  },
  bottomRight: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  cardValue: {
    fontWeight: 'bold',
  },
  cardSuit: {
    fontWeight: 'bold',
  },
  centerSuit: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});