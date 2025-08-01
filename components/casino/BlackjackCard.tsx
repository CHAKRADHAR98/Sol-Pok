// components/casino/BlackjackCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card as CardType, Suit } from './types';

interface BlackjackCardProps {
  card?: CardType;
  isFaceDown?: boolean;
}

const BlackjackCard: React.FC<BlackjackCardProps> = ({ card, isFaceDown = false }) => {
  if (isFaceDown || !card) {
    return (
      <View style={styles.cardBack}>
        <View style={styles.cardBackInner}>
          <Text style={styles.cardBackPattern}>🂠</Text>
        </View>
      </View>
    );
  }

  const { suit, rank } = card;
  const isRed = suit === Suit.Hearts || suit === Suit.Diamonds;

  return (
    <View style={styles.card}>
      {/* Top left corner */}
      <View style={styles.topLeft}>
        <Text style={[styles.rankText, { color: isRed ? '#dc2626' : '#1f2937' }]}>{rank}</Text>
        <Text style={[styles.suitText, { color: isRed ? '#dc2626' : '#1f2937' }]}>{suit}</Text>
      </View>
      
      {/* Center suit */}
      <View style={styles.center}>
        <Text style={[styles.centerSuit, { color: isRed ? '#dc2626' : '#1f2937' }]}>{suit}</Text>
      </View>
      
      {/* Bottom right corner (rotated) */}
      <View style={styles.bottomRight}>
        <Text style={[styles.suitText, styles.rotated, { color: isRed ? '#dc2626' : '#1f2937' }]}>{suit}</Text>
        <Text style={[styles.rankText, styles.rotated, { color: isRed ? '#dc2626' : '#1f2937' }]}>{rank}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 72,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardBack: {
    width: 72,
    height: 100,
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1e40af',
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackInner: {
    width: 60,
    height: 88,
    backgroundColor: '#1e40af',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackPattern: {
    color: '#3b82f6',
    fontSize: 24,
    fontWeight: 'bold',
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
  },
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -16 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  suitText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -2,
  },
  centerSuit: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rotated: {
    transform: [{ rotate: '180deg' }],
  },
});

export default BlackjackCard;