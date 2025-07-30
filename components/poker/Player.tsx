// components/poker/Player.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player as PlayerType } from '../../types/poker';
import Card from './Card';

interface PlayerProps {
    player: PlayerType;
    isTurn: boolean;
    handOver: any;
    isDealer: boolean;
    showCards?: boolean;
}

const Player: React.FC<PlayerProps> = ({ 
    player, 
    isTurn, 
    handOver, 
    isDealer, 
    showCards = false 
}) => {
    const shouldShowCards = showCards || (player.isHuman && isTurn) || !!handOver || (!player.isHuman && !!handOver);

    return (
        <View style={[
            styles.container,
            isTurn && styles.activeTurn,
            player.isFolded && styles.folded
        ]}>
            {/* Player Info */}
            <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={[
                    styles.playerStack,
                    player.stack > 0 ? styles.positiveStack : styles.zeroStack
                ]}>
                    ${player.stack}
                </Text>
            </View>

            {/* Cards */}
            <View style={styles.cardsContainer}>
                {player.hand.length > 0 ? (
                    player.hand.map((card, index) => (
                        <Card 
                            key={index} 
                            card={card} 
                            faceUp={shouldShowCards}
                            size="medium"
                        />
                    ))
                ) : (
                    <View style={styles.waitingContainer}>
                        <Text style={styles.waitingText}>Waiting...</Text>
                    </View>
                )}
            </View>

            {/* Folded Overlay */}
            {player.isFolded && (
                <View style={styles.foldedOverlay}>
                    <Text style={styles.foldedText}>FOLDED</Text>
                </View>
            )}

            {/* Current Bet */}
            {player.currentBet > 0 && (
                <View style={styles.currentBet}>
                    <Text style={styles.currentBetText}>Bet: ${player.currentBet}</Text>
                </View>
            )}

            {/* Dealer Button */}
            {isDealer && (
                <View style={styles.dealerButton}>
                    <Text style={styles.dealerButtonText}>D</Text>
                </View>
            )}

            {/* Last Action */}
            {player.lastAction && !isTurn && (
                <View style={styles.lastAction}>
                    <Text style={styles.lastActionText}>{player.lastAction}</Text>
                </View>
            )}

            {/* All-in Indicator */}
            {player.isAllIn && (
                <View style={styles.allInIndicator}>
                    <Text style={styles.allInText}>ALL-IN</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        minWidth: 160,
        position: 'relative',
    },
    activeTurn: {
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderWidth: 2,
        borderColor: '#ffc107',
    },
    folded: {
        opacity: 0.5,
    },
    playerInfo: {
        alignItems: 'center',
        marginBottom: 8,
    },
    playerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    playerStack: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        textAlign: 'center',
    },
    positiveStack: {
        color: '#10b981',
    },
    zeroStack: {
        color: '#ef4444',
    },
    cardsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        marginBottom: 8,
    },
    waitingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    waitingText: {
        color: '#9ca3af',
        fontSize: 14,
        fontStyle: 'italic',
    },
    foldedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    foldedText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: '#dc2626',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    currentBet: {
        position: 'absolute',
        bottom: -16,
        backgroundColor: '#374151',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#6b7280',
    },
    currentBetText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dealerButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#6b7280',
    },
    dealerButtonText: {
        color: '#374151',
        fontSize: 12,
        fontWeight: 'bold',
    },
    lastAction: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 8,
    },
    lastActionText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    allInIndicator: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#7c3aed',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    allInText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default Player;