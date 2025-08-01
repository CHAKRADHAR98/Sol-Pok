// components/casino/BlackjackControls.tsx
import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { GamePhase } from './types';

interface BlackjackControlsProps {
  gamePhase: GamePhase;
  betAmount: number;
  coins: number;
  setBetAmount: (amount: number) => void;
  onBet: () => void;
  onHit: () => void;
  onStand: () => void;
  onPlayAgain: () => void;
  onGoBack: () => void;
}

const BlackjackControls: React.FC<BlackjackControlsProps> = ({ 
  gamePhase, 
  betAmount, 
  coins, 
  setBetAmount, 
  onBet, 
  onHit, 
  onStand, 
  onPlayAgain, 
  onGoBack 
}) => {
  const hasEnoughCoins = betAmount <= coins;

  switch (gamePhase) {
    case GamePhase.BETTING:
      return (
        <View style={styles.container}>
          <View style={styles.bettingControls}>
            <Text style={styles.inputLabel}>Bet Amount</Text>
            <TextInput
              value={betAmount.toString()}
              onChangeText={(text) => setBetAmount(Math.max(1, parseInt(text) || 1))}
              style={styles.textInput}
              keyboardType="numeric"
              placeholder="Enter bet amount"
              placeholderTextColor="#6b7280"
            />
            <TouchableOpacity 
              onPress={onBet} 
              disabled={betAmount <= 0 || !hasEnoughCoins} 
              style={[styles.primaryButton, (!hasEnoughCoins || betAmount <= 0) && styles.disabledButton]}
            >
              <Text style={styles.primaryButtonText}>
                {hasEnoughCoins ? 'Place Bet' : 'Not Enough Coins'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
      
    case GamePhase.PLAYER_TURN:
      return (
        <View style={styles.container}>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={onHit} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Hit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onStand} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Stand</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
      
    case GamePhase.FINISHED:
      return <View style={styles.spacer} />; // Placeholder to prevent layout shift
      
    default:
      return <View style={styles.spacer} />; // Placeholder to prevent layout shift
  }
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
  bettingControls: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
    borderRadius: 12,
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 100, // Maintain consistent layout height
  },
});

export default BlackjackControls;