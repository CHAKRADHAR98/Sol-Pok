import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Tile as TileType, GameState } from './types';

interface MinesTileProps {
  tile: TileType;
  gameState: GameState;
  onPress: () => void;
}

const GemIcon = ({ size = 24 }: { size?: number }) => (
  <Text style={[styles.icon, { fontSize: size }]}>💎</Text>
);

const MineIcon = ({ size = 24 }: { size?: number }) => (
  <Text style={[styles.icon, { fontSize: size }]}>💣</Text>
);

const MinesTile: React.FC<MinesTileProps> = ({ tile, gameState, onPress }) => {
  const { isRevealed, isMine } = tile;
  const isDisabled = isRevealed || gameState === GameState.LOST || gameState === GameState.WON;
  const isGameActive = gameState === GameState.PLAYING;

  let content: React.ReactNode = null;
  let tileStyles: ViewStyle[] = [styles.tile];

  if (isRevealed) {
    if (isMine) {
      tileStyles.push(styles.mineTile);
      content = <MineIcon size={20} />;
    } else {
      tileStyles.push(styles.gemTile);
      content = <GemIcon size={20} />;
    }
  } else if (gameState === GameState.LOST || gameState === GameState.WON) {
    if (isMine) {
      tileStyles.push(styles.revealedMineTile);
      content = <MineIcon size={16} />;
    } else {
      tileStyles.push(styles.hiddenTile);
    }
  } else {
    // Default hidden state - make sure it's visible
    tileStyles.push(styles.hiddenTile);
  }

  if (isDisabled) {
    tileStyles.push(styles.disabledTile);
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled || !isGameActive}
      style={tileStyles}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  hiddenTile: {
    backgroundColor: '#64748b',
    borderWidth: 1,
    borderColor: '#94a3b8',
  },
  gemTile: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  mineTile: {
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  revealedMineTile: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
    opacity: 0.8,
  },
  disabledTile: {
    opacity: 0.7,
  },
  icon: {
    textAlign: 'center',
  },
});

export default MinesTile;