// components/poker/SimplePokerGame.tsx - Fixed Version
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

interface SimplePokerGameProps {
  playerId: string;
  onBackToLobby: () => void;
}

interface GameData {
  manager: any;
  gameState: any;
  validActions: string[];
}

// Move styles to the top, before the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  // Professional Poker Card Styles
  pokerCard: {
    margin: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative',
  },
  visibleCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  hiddenCard: {
    backgroundColor: '#1e3a8a',
    borderWidth: 2,
    borderColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardBackPattern: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardBackText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    zIndex: 2,
  },
  cardBackDesign: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backCircle1: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    top: 8,
    left: 8,
  },
  backCircle2: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    bottom: 8,
    right: 8,
  },
  backCircle3: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    top: '50%',
    left: '50%',
    marginTop: -12.5,
    marginLeft: -12.5,
  },
  cardCorner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  topLeft: {
    top: 4,
    left: 4,
  },
  bottomRight: {
    bottom: 4,
    right: 4,
  },
  cardCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -20 }],
    zIndex: 1,
  },
  cardValue: {
    fontWeight: 'bold',
    fontFamily: 'System',
    textAlign: 'center',
  },
  cardSuit: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -2,
  },
  centerSuit: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  faceCardPattern: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 1,
  },
  faceCardText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardBorderHighlight: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 0,
  },
  // Game Layout Styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  gameInfoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  gameInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gameInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  turnIndicator: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  turnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  communityCard: {
    backgroundColor: '#065f46',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  communityCards: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stageInfo: {
    fontSize: 12,
    color: '#d1fae5',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  playersCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  playerChips: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  playerBet: {
    fontSize: 11,
    color: '#2563eb',
    marginTop: 2,
    fontWeight: '600',
  },
  playerCards: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  playerStatus: {
    minWidth: 60,
    alignItems: 'center',
  },
  activeText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: 'bold',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  foldedText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: 'bold',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  allInText: {
    fontSize: 10,
    color: '#7c3aed',
    fontWeight: 'bold',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  handCard: {
    backgroundColor: '#1e40af',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  playerHand: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  yourBet: {
    fontSize: 12,
    color: '#dbeafe',
    fontWeight: '600',
    textAlign: 'center',
  },
  foldedIndicator: {
    backgroundColor: '#dc2626',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  foldButton: {
    backgroundColor: '#dc2626',
  },
  checkButton: {
    backgroundColor: '#6b7280',
  },
  callButton: {
    backgroundColor: '#2563eb',
  },
  raiseButton: {
    backgroundColor: '#059669',
  },
  allInButton: {
    backgroundColor: '#7c3aed',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionHint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  emptyLogText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logMessage: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
    paddingVertical: 2,
  },
  controlsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
});

// Visual Card Component with Professional Styling
const PokerCard: React.FC<{ card?: any; isHidden?: boolean; size?: 'small' | 'medium' | 'large' }> = ({ 
  card, 
  isHidden = false, 
  size = 'medium' 
}) => {
  const getSuitColor = (suitValue: string): string => {
    return suitValue === 'hearts' || suitValue === 'diamonds' ? '#dc2626' : '#1f2937';
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
    small: { width: 50, height: 70, fontSize: 11, cornerSize: 8 },
    medium: { width: 70, height: 95, fontSize: 16, cornerSize: 10 },
    large: { width: 90, height: 125, fontSize: 20, cornerSize: 12 },
  };

  const currentSize = cardSizes[size];

  if (isHidden || !card) {
    return (
      <View style={[
        styles.pokerCard, 
        styles.hiddenCard, 
        { 
          width: currentSize.width, 
          height: currentSize.height,
          borderRadius: currentSize.cornerSize
        }
      ]}>
        <View style={styles.cardBackPattern}>
          <Text style={[styles.cardBackText, { fontSize: currentSize.fontSize + 8 }]}>🂠</Text>
          <View style={styles.cardBackDesign}>
            <View style={styles.backCircle1} />
            <View style={styles.backCircle2} />
            <View style={styles.backCircle3} />
          </View>
        </View>
      </View>
    );
  }

  const suitColor = getSuitColor(card.suit.value);
  const suitSymbol = getSuitSymbol(card.suit.value);
  const isRed = suitColor === '#dc2626';

  return (
    <View style={[
      styles.pokerCard, 
      styles.visibleCard, 
      { 
        width: currentSize.width, 
        height: currentSize.height,
        borderRadius: currentSize.cornerSize
      }
    ]}>
      {/* Top-left corner */}
      <View style={[styles.cardCorner, styles.topLeft]}>
        <Text style={[
          styles.cardValue, 
          { 
            color: suitColor, 
            fontSize: currentSize.fontSize * 0.8,
            lineHeight: currentSize.fontSize * 0.9
          }
        ]}>
          {card.value}
        </Text>
        <Text style={[
          styles.cardSuit, 
          { 
            color: suitColor, 
            fontSize: currentSize.fontSize * 0.7,
            lineHeight: currentSize.fontSize * 0.7
          }
        ]}>
          {suitSymbol}
        </Text>
      </View>

      {/* Center suit symbol */}
      <View style={styles.cardCenter}>
        <Text style={[
          styles.centerSuit, 
          { 
            color: suitColor, 
            fontSize: currentSize.fontSize * 1.8,
            textShadowColor: isRed ? '#fca5a5' : '#9ca3af',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }
        ]}>
          {suitSymbol}
        </Text>
      </View>

      {/* Bottom-right corner (rotated) */}
      <View style={[styles.cardCorner, styles.bottomRight]}>
        <Text style={[
          styles.cardValue, 
          { 
            color: suitColor, 
            fontSize: currentSize.fontSize * 0.8,
            lineHeight: currentSize.fontSize * 0.9,
            transform: [{ rotate: '180deg' }]
          }
        ]}>
          {card.value}
        </Text>
        <Text style={[
          styles.cardSuit, 
          { 
            color: suitColor, 
            fontSize: currentSize.fontSize * 0.7,
            lineHeight: currentSize.fontSize * 0.7,
            transform: [{ rotate: '180deg' }]
          }
        ]}>
          {suitSymbol}
        </Text>
      </View>

      {/* Card face pattern for face cards */}
      {(card.value === 'J' || card.value === 'Q' || card.value === 'K' || card.value === 'A') && (
        <View style={styles.faceCardPattern}>
          <Text style={[
            styles.faceCardText,
            {
              color: suitColor,
              fontSize: currentSize.fontSize * 0.6
            }
          ]}>
            {card.value === 'A' ? '★' : card.value === 'K' ? '♔' : card.value === 'Q' ? '♕' : '♖'}
          </Text>
        </View>
      )}

      {/* Card border highlight */}
      <View style={[
        styles.cardBorderHighlight,
        {
          borderRadius: currentSize.cornerSize - 1
        }
      ]} />
    </View>
  );
};

export const SimplePokerGame: React.FC<SimplePokerGameProps> = ({ 
  playerId, 
  onBackToLobby 
}) => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [gameLog, setGameLog] = useState<string[]>([]);

  const addToGameLog = (message: string) => {
    setGameLog(prev => [...prev.slice(-3), message]); // Keep last 4 messages
  };

  const initializeGame = useCallback(async () => {
    try {
      const { LocalPokerGameManager } = await import('../../lib/poker/GameManager');
      
      const config = {
        playerId,
        playerName: 'You',
        buyIn: 100,
        blinds: { small: 5, big: 10 },
        botCount: 3
      };
      
      const manager = new LocalPokerGameManager(config);
      
      // Add event listener for game updates
      manager.addEventListener((event: any) => {
        console.log('Game Event:', event);
        
        switch (event.type) {
          case 'player_action':
            const { action } = event.data;
            if (action.playerId === playerId) {
              addToGameLog(`💪 You ${action.action}${action.amount ? ` $${action.amount}` : ''}`);
            } else {
              const playerName = event.data.gameState?.players?.find((p: any) => p.id === action.playerId)?.name || 'Bot';
              addToGameLog(`🤖 ${playerName} ${action.action}${action.amount ? ` $${action.amount}` : ''}`);
            }
            
            // Update game state after action
            const newGameState = manager.getPlayerGameState();
            const newValidActions = manager.getValidActions();
            
            setGameData(prev => {
              if (!prev) return prev;
              return {
                manager: prev.manager,
                gameState: newGameState,
                validActions: newValidActions
              };
            });
            break;
            
          case 'cards_dealt':
            addToGameLog('🃏 New cards dealt!');
            break;
            
          case 'stage_change':
            addToGameLog(`📋 ${event.data.stage} stage`);
            break;
            
          case 'game_end':
            const winners = event.data.winners;
            if (winners?.some((w: any) => w.playerId === playerId)) {
              addToGameLog('🎉 You won the hand!');
            } else {
              addToGameLog('😞 You lost this hand');
            }
            break;
        }
      });
      
      const gameState = manager.startNewHand();
      
      setGameData({
        manager,
        gameState: manager.getPlayerGameState(),
        validActions: manager.getValidActions()
      });
      setIsLoading(false);
      addToGameLog('🎮 Welcome to Texas Hold\'em!');
      addToGameLog('🃏 Cards dealt - good luck!');
      
    } catch (err) {
      console.error('Game init error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize game');
      setIsLoading(false);
    }
  }, [playerId]);

  const processAction = useCallback((action: string, amount?: number) => {
    if (!gameData?.manager) {
      Alert.alert('Error', 'Game not ready');
      return;
    }
    
    try {
      const actionData: any = { action };
      
      // Handle raise action with proper amount
      if (action === 'raise') {
        const currentBet = gameData.gameState?.currentBet || 0;
        const bigBlind = gameData.gameState?.blinds?.big || 10;
        const minRaise = currentBet + bigBlind;
        
        if (amount) {
          actionData.amount = amount;
        } else {
          // Default raise amount
          actionData.amount = minRaise;
        }
      }
      
      console.log('Processing action:', actionData);
      gameData.manager.processPlayerAction(actionData);
      
    } catch (err) {
      console.error('Action error:', err);
      Alert.alert('Action Failed', err instanceof Error ? err.message : 'Failed to process action');
    }
  }, [gameData]);

  const startNewHand = useCallback(() => {
    if (!gameData?.manager) return;
    
    try {
      gameData.manager.startNewHand();
      const newGameState = gameData.manager.getPlayerGameState();
      const newValidActions = gameData.manager.getValidActions();
      
      setGameData(prev => {
        if (!prev) return prev;
        return {
          manager: prev.manager,
          gameState: newGameState,
          validActions: newValidActions
        };
      });
      
      addToGameLog('🔄 New hand started!');
    } catch (err) {
      console.error('New hand error:', err);
      Alert.alert('Error', 'Failed to start new hand');
    }
  }, [gameData]);

  useEffect(() => {
    initializeGame();
    
    return () => {
      if (gameData?.manager) {
        gameData.manager.destroy();
      }
    };
  }, [initializeGame]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>🎰 Setting up poker table...</Text>
          <Text style={styles.subtitle}>Shuffling cards and seating players</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBackToLobby}>
            <Text style={styles.buttonText}>Back to Lobby</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={initializeGame}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={onBackToLobby}>
            <Text style={styles.buttonText}>Back to Lobby</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!gameData) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>No game data</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBackToLobby}>
            <Text style={styles.buttonText}>Back to Lobby</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { gameState, validActions } = gameData;
  const humanPlayer = gameState?.players?.find((p: any) => p?.id === playerId);
  const otherPlayers = gameState?.players?.filter((p: any) => p?.id !== playerId) || [];
  const isPlayerTurn = validActions && validActions.length > 0 && !humanPlayer?.isFolded;

  const callAmount = (gameState?.currentBet || 0) - (humanPlayer?.currentBet || 0);
  const minRaise = (gameState?.currentBet || 0) + (gameState?.blinds?.big || 10);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Game Info Header */}
      <View style={styles.gameInfoCard}>
        <View style={styles.gameInfoRow}>
          <Text style={styles.gameInfoText}>💰 Pot: ${gameState?.pot || 0}</Text>
          <Text style={styles.gameInfoText}>🎯 Stage: {gameState?.stage || 'loading'}</Text>
        </View>
        <View style={styles.gameInfoRow}>
          <Text style={styles.gameInfoText}>💎 Your Chips: ${humanPlayer?.chips || 0}</Text>
          <Text style={styles.gameInfoText}>💸 Current Bet: ${gameState?.currentBet || 0}</Text>
        </View>
        
        {isPlayerTurn && (
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>🎯 YOUR TURN!</Text>
          </View>
        )}
      </View>

      {/* Community Cards */}
      <View style={styles.communityCard}>
        <Text style={styles.sectionTitle}>🃏 Community Cards</Text>
        <View style={styles.communityCards}>
          {Array.from({ length: 5 }, (_, index) => (
            <PokerCard
              key={index}
              card={gameState?.communityCards?.[index]}
              isHidden={!gameState?.communityCards?.[index]}
              size="medium"
            />
          ))}
        </View>
        <Text style={styles.stageInfo}>
          {gameState?.stage === 'preflop' && '⏳ Waiting for flop...'}
          {gameState?.stage === 'flop' && '🎯 Flop revealed! Turn coming next.'}
          {gameState?.stage === 'turn' && '🎯 Turn card revealed! River coming next.'}
          {gameState?.stage === 'river' && '🎯 All cards revealed! Final betting round.'}
        </Text>
      </View>

      {/* Other Players */}
      <View style={styles.playersCard}>
        <Text style={styles.sectionTitle}>👥 Other Players</Text>
        {otherPlayers.map((player: any, index: number) => (
          <View key={player?.id || index} style={styles.playerRow}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player?.name || `Bot ${index + 1}`}</Text>
              <Text style={styles.playerChips}>💰 ${player?.chips || 0}</Text>
              {player?.currentBet > 0 && (
                <Text style={styles.playerBet}>Bet: ${player.currentBet}</Text>
              )}
            </View>
            
            <View style={styles.playerCards}>
              <PokerCard isHidden size="small" />
              <PokerCard isHidden size="small" />
            </View>
            
            <View style={styles.playerStatus}>
              {player?.isFolded ? (
                <Text style={styles.foldedText}>FOLDED</Text>
              ) : player?.isAllIn ? (
                <Text style={styles.allInText}>ALL-IN</Text>
              ) : player?.isActive ? (
                <Text style={styles.activeText}>ACTIVE</Text>
              ) : (
                <Text style={styles.inactiveText}>WAITING</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Your Hand */}
      <View style={styles.handCard}>
        <Text style={styles.sectionTitle}>🎯 Your Hand</Text>
        <View style={styles.playerHand}>
          {humanPlayer?.holeCards?.map((card: any, index: number) => (
            <PokerCard
              key={`${card.id}-${index}`}
              card={card}
              size="large"
            />
          )) || [
            <PokerCard key="hole1" isHidden size="large" />,
            <PokerCard key="hole2" isHidden size="large" />
          ]}
        </View>
        
        {humanPlayer?.currentBet > 0 && (
          <Text style={styles.yourBet}>Your Current Bet: ${humanPlayer.currentBet}</Text>
        )}
        
        {humanPlayer?.isFolded && (
          <View style={styles.foldedIndicator}>
            <Text style={styles.foldedText}>YOU FOLDED</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {isPlayerTurn && (
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>⚡ Your Actions</Text>
          <View style={styles.actionButtons}>
            {validActions.includes('fold') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.foldButton]}
                onPress={() => processAction('fold')}
              >
                <Text style={styles.actionButtonText}>Fold</Text>
              </TouchableOpacity>
            )}
            
            {validActions.includes('check') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.checkButton]}
                onPress={() => processAction('check')}
              >
                <Text style={styles.actionButtonText}>Check</Text>
              </TouchableOpacity>
            )}
            
            {validActions.includes('call') && callAmount > 0 && (
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={() => processAction('call')}
              >
                <Text style={styles.actionButtonText}>Call ${callAmount}</Text>
              </TouchableOpacity>
            )}
            
            {validActions.includes('raise') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.raiseButton]}
                onPress={() => processAction('raise', minRaise)}
              >
                <Text style={styles.actionButtonText}>Raise to ${minRaise}</Text>
              </TouchableOpacity>
            )}
            
            {validActions.includes('all-in') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.allInButton]}
                onPress={() => processAction('all-in')}
              >
                <Text style={styles.actionButtonText}>All-In (${humanPlayer?.chips || 0})</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.actionHint}>
            💡 {validActions.includes('check') ? 'You can check for free' :
                  validActions.includes('call') ? `Call ${callAmount} to stay in` :
                  'Choose your action wisely!'}
          </Text>
        </View>
      )}

      {/* Game Log */}
      <View style={styles.logCard}>
        <Text style={styles.sectionTitle}>📝 Recent Activity</Text>
        {gameLog.length === 0 ? (
          <Text style={styles.emptyLogText}>Game starting...</Text>
        ) : (
          gameLog.map((message, index) => (
            <Text key={index} style={styles.logMessage}>
              {message}
            </Text>
          ))
        )}
      </View>

      {/* Game Controls */}
      <View style={styles.controlsCard}>
        <TouchableOpacity
          style={[styles.primaryButton, isPlayerTurn && styles.disabledButton]}
          onPress={startNewHand}
          disabled={isPlayerTurn}
        >
          <Text style={styles.buttonText}>
            {isPlayerTurn ? '⏳ Hand in Progress' : '🔄 New Hand'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.backButton} onPress={onBackToLobby}>
          <Text style={styles.buttonText}>⬅️ Back to Lobby</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};