import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface CasinoLobbyProps {
  onGoBack: () => void;
  onSelectGame: (game: 'blackjack' | 'mines' | 'roulette') => void;
}

const GameCard = ({ 
  title, 
  emoji, 
  description, 
  comingSoon, 
  onPress 
}: { 
  title: string; 
  emoji: string; 
  description: string; 
  comingSoon?: boolean; 
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={comingSoon}
    style={[
      styles.gameCard,
      comingSoon ? styles.disabledCard : styles.activeCard
    ]}
  >
    {comingSoon && (
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonText}>Coming Soon</Text>
      </View>
    )}
    <Text style={styles.gameEmoji}>{emoji}</Text>
    <Text style={[styles.gameTitle, comingSoon && styles.disabledText]}>{title}</Text>
    <Text style={[styles.gameDescription, comingSoon && styles.disabledText]}>
      {description}
    </Text>
  </TouchableOpacity>
);

const CasinoLobby: React.FC<CasinoLobbyProps> = ({ onGoBack, onSelectGame }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Casino Lobby</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.welcomeTitle}>🎲 Welcome to the Casino</Text>
          <Text style={styles.welcomeSubtitle}>Choose your game and test your luck!</Text>

          <View style={styles.gamesGrid}>
            <GameCard
              title="Blackjack"
              emoji="🃏"
              description="Classic 21 card game with perfect strategy"
              onPress={() => onSelectGame('blackjack')}
            />
            
            <GameCard
              title="Mines"
              emoji="💎"
              description="Risk vs reward - find gems, avoid mines"
              onPress={() => onSelectGame('mines')}
            />
            
            <GameCard
              title="Roulette"
              emoji="🎰"
              description="Spin the wheel and bet on your lucky number"
              comingSoon
            />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🎯 How to Play</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Start with 1,000 free casino coins</Text>
              <Text style={styles.infoItem}>• Each game has different rules and strategies</Text>
              <Text style={styles.infoItem}>• Manage your bankroll wisely</Text>
              <Text style={styles.infoItem}>• Have fun and play responsibly!</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>🏆 Game Statistics</Text>
            <Text style={styles.statsSubtitle}>Track your progress across all casino games</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Games Played</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Total Winnings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  placeholder: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  gamesGrid: {
    gap: 16,
    marginBottom: 24,
  },
  gameCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  disabledCard: {
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gameEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  disabledText: {
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#d1fae5',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#c4b5fd',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#c4b5fd',
    textAlign: 'center',
  },
});

export default CasinoLobby;