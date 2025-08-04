// components/casino/CasinoLobby.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';

// FIX: Define a type for the GameCard's props to eliminate implicit 'any' errors.
type GameCardProps = {
  title: string;
  emoji: string;
  description: string;
  comingSoon?: boolean; // '?' makes the prop optional
  onPress?: () => void;   // '?' makes the prop optional
};

const GameCard: React.FC<GameCardProps> = ({ title, emoji, description, comingSoon, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={comingSoon || !onPress}
    style={[styles.gameCard, comingSoon && styles.disabledCard]}
    activeOpacity={0.7}
  >
    {comingSoon && (
      <View style={styles.comingSoonBadge}><Text style={styles.comingSoonText}>Coming Soon</Text></View>
    )}
    <Text style={styles.gameEmoji}>{emoji}</Text>
    <View>
        <Text style={styles.gameTitle}>{title}</Text>
        <Text style={styles.gameDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

// FIX: Define a more specific type for the games to resolve the error in SolanaUserScreen.
type GameType = 'poker' | 'blackjack' | 'mines';

interface CasinoLobbyProps {
  onGoBack: () => void;
  onSelectGame: (game: GameType) => void;
}

const CasinoLobby: React.FC<CasinoLobbyProps> = ({ onGoBack, onSelectGame }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
        <Text style={styles.backButtonText}>{"<"} Dashboard</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{paddingTop: 80}} showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeTitle}>Casino Lobby</Text>
        <Text style={styles.welcomeSubtitle}>Choose your game and test your luck</Text>
        <GameCard title="Texas Hold'em" emoji="🃏" description="Challenge our AI in the ultimate game of skill." onPress={() => onSelectGame('poker')} />
        <GameCard title="Blackjack" emoji="♠️" description="Get as close to 21 as you can without going over." onPress={() => onSelectGame('blackjack')} />
        <GameCard title="Mines" emoji="💎" description="Uncover gems and avoid the mines for big multipliers." onPress={() => onSelectGame('mines')} />
        <GameCard title="Roulette" emoji="🎰" description="Spin the wheel and bet on your lucky number." comingSoon />
      </ScrollView>
    </View>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.medium },
  backButton: { position: 'absolute', top: 50, left: SPACING.medium, zIndex: 1, padding: SPACING.small },
  backButtonText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.medium, fontFamily: 'Inter_500Medium' },
  welcomeTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.small,
    fontFamily: 'Inter_600SemiBold',
  },
  welcomeSubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZES.medium, textAlign: 'center', marginBottom: SPACING.large, fontFamily: 'Inter_400Regular'},
  gameCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.large,
    marginBottom: SPACING.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface2,
    flexDirection: 'row',
    gap: SPACING.medium,
  },
  disabledCard: { opacity: 0.5 },
  comingSoonBadge: {
    position: 'absolute',
    top: SPACING.medium,
    right: SPACING.medium,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: { color: COLORS.background, fontSize: FONT_SIZES.small, fontWeight: 'bold' },
  gameEmoji: { fontSize: 48 },
  gameTitle: { color: COLORS.text, fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', marginBottom: SPACING.small, fontFamily: 'Inter_600SemiBold' },
  gameDescription: { color: COLORS.textSecondary, fontSize: FONT_SIZES.medium, fontFamily: 'Inter_400Regular' },
});

export default CasinoLobby;