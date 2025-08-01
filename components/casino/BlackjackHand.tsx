// components/casino/BlackjackHand.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Hand as HandType, GamePhase } from './types';
import BlackjackCard from './BlackjackCard';

interface BlackjackHandProps {
  title: string;
  hand: HandType;
  score: number;
  isDealer?: boolean;
  gamePhase?: GamePhase;
}

const BlackjackHand: React.FC<BlackjackHandProps> = ({ 
  title, 
  hand, 
  score, 
  isDealer = false, 
  gamePhase 
}) => {
  const showScore = gamePhase === GamePhase.FINISHED || 
                   (isDealer && gamePhase === GamePhase.DEALER_TURN) || 
                   !isDealer;
                   
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title} - <Text style={styles.score}>
          {showScore && score > 0 ? score : ''}
        </Text>
      </Text>
      <View style={styles.cardsContainer}>
        {hand.length === 0 && (
          <View style={styles.emptyHand}>
            <Text style={styles.emptyText}>Waiting for cards...</Text>
          </View>
        )}
        {hand.map((card, index) => (
          <BlackjackCard 
            key={index} 
            card={card} 
            isFaceDown={isDealer && index === 0 && 
                       gamePhase !== GamePhase.DEALER_TURN && 
                       gamePhase !== GamePhase.FINISHED}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    minHeight: 140,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  score: {
    color: '#06b6d4',
  },
  cardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginLeft: -20,  // Offset for overlapping cards
  },
  emptyHand: {
    width: 72,
    height: 100,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default BlackjackHand;