// components/poker/GeminiPokerGame.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { usePokerGame } from '../../hooks/usePokerGame';
import { GameStage } from '../../types/poker';
import Player from './Player';
import CommunityCards from './CommunityCards';
import ActionBar from './ActionBar';
import Pot from './Pot';

interface GeminiPokerGameProps {
  playerId: string;
  onBackToLobby: () => void;
}

const GameLobby: React.FC<{ onGameStart: (settings: any) => void }> = ({ onGameStart }) => {
    const [mode, setMode] = useState<'ai' | 'multiplayer'>('ai');
    const [numPlayers, setNumPlayers] = useState(2);
    const [playerNames, setPlayerNames] = useState(['You', 'Gemini AI']);

    useEffect(() => {
        if (mode === 'ai') {
            const names = ['You', 'Gemini AI'];
            setNumPlayers(2);
            setPlayerNames(names);
        } else {
            const names = Array.from({ length: numPlayers }, (_, i) => `Player ${i + 1}`);
            setPlayerNames(names);
        }
    }, [mode, numPlayers]);

    const handleNameChange = (index: number, name: string) => {
        const newNames = [...playerNames];
        newNames[index] = name;
        setPlayerNames(newNames);
    };

    const handleStart = () => {
        onGameStart({
            mode,
            numPlayers: mode === 'ai' ? 2 : numPlayers,
            playerNames: mode === 'ai' ? ['You', 'Gemini AI'] : playerNames,
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.lobbyContainer}>
            <View style={styles.lobbyCard}>
                <Text style={styles.lobbyTitle}>🎰 Texas Hold'em</Text>
                <Text style={styles.lobbySubtitle}>Choose your poker experience</Text>
                
                <View style={styles.modeSection}>
                    <Text style={styles.sectionTitle}>Game Mode</Text>
                    <View style={styles.modeButtons}>
                        <TouchableOpacity 
                            style={[styles.modeButton, mode === 'ai' && styles.activeModeButton]}
                            onPress={() => setMode('ai')}
                        >
                            <Text style={[styles.modeButtonText, mode === 'ai' && styles.activeModeButtonText]}>
                                🤖 vs. AI
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.modeButton, mode === 'multiplayer' && styles.activeModeButton]}
                            onPress={() => setMode('multiplayer')}
                        >
                            <Text style={[styles.modeButtonText, mode === 'multiplayer' && styles.activeModeButtonText]}>
                                👥 Multiplayer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {mode === 'multiplayer' && (
                    <View style={styles.playersSection}>
                        <Text style={styles.sectionTitle}>Players ({numPlayers})</Text>
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>2</Text>
                            <View style={styles.sliderTrack}>
                                {[2, 3, 4].map(num => (
                                    <TouchableOpacity
                                        key={num}
                                        style={[styles.sliderDot, numPlayers === num && styles.activeSliderDot]}
                                        onPress={() => setNumPlayers(num)}
                                    />
                                ))}
                            </View>
                            <Text style={styles.sliderLabel}>4</Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                    <Text style={styles.startButtonText}>🚀 Start Game</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const GeminiPokerGame: React.FC<GeminiPokerGameProps> = ({ playerId, onBackToLobby }) => {
    const [gameSettings, setGameSettings] = useState<{ mode: 'ai' | 'multiplayer'; numPlayers: number; playerNames: string[] } | null>(null);
    const [showInterstitial, setShowInterstitial] = useState(false);
    const prevPlayerIndexRef = useRef<number | null>(null);
    
    const {
        gameState,
        startGame,
        playerAction,
    } = usePokerGame(gameSettings);

    const { players, communityCards, pot, stage, currentBet, gameMessage, handOver, dealerIndex, currentPlayerIndex, minRaise } = gameState;

    useEffect(() => {
        if (!gameSettings || !gameState.isHandInProgress) return;

        const prevPlayer = prevPlayerIndexRef.current !== null ? players[prevPlayerIndexRef.current] : null;
        const currentPlayer = players[currentPlayerIndex];
        
        if (gameSettings.mode === 'multiplayer' && prevPlayer?.isHuman && currentPlayer?.isHuman && prevPlayer.id !== currentPlayer.id) {
            setShowInterstitial(true);
        }
        prevPlayerIndexRef.current = currentPlayerIndex;

    }, [currentPlayerIndex, gameSettings, players, gameState.isHandInProgress]);

    if (!gameSettings) {
        return <GameLobby onGameStart={setGameSettings} />;
    }
    
    const currentPlayer = players[currentPlayerIndex];
    const isPlayerTurn = currentPlayer?.isHuman && stage !== GameStage.PRE_DEAL && !handOver;
    const humanPlayer = players.find(p => p.isHuman);

    const getHandDescription = (cards: string[]) => {
        if (cards.length < 2) return '';
        // Simple hand description - you could enhance this
        return 'Your Hand';
    };
    
    const getPlayerPosition = (index: number, total: number, isCurrentPlayer: boolean) => {
        const { width } = Dimensions.get('window');
        const isWide = width > 600;
        
        if (isCurrentPlayer && humanPlayer?.isHuman) {
            return styles.bottomPlayer;
        }
        
        // Position other players around the table
        switch (total) {
            case 2:
                return styles.topPlayer;
            case 3:
                if (index === 1) return styles.leftPlayer;
                return styles.rightPlayer;
            case 4:
                if (index === 1) return styles.topPlayer;
                if (index === 2) return styles.leftPlayer;
                return styles.rightPlayer;
            default:
                return styles.topPlayer;
        }
    };

    return (
        <View style={styles.container}>
            {showInterstitial && (
                <View style={styles.interstitial}>
                    <View style={styles.interstitialContent}>
                        <Text style={styles.interstitialTitle}>Next Player</Text>
                        <Text style={styles.interstitialSubtitle}>
                            It's {players[currentPlayerIndex]?.name}'s turn.
                        </Text>
                        <TouchableOpacity 
                            style={styles.readyButton}
                            onPress={() => setShowInterstitial(false)}
                        >
                            <Text style={styles.readyButtonText}>I'm Ready</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.gameTable}>
                {/* Header with back button */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBackToLobby}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.gameTitle}>Texas Hold'em</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Table Center: Pot and Community Cards */}
                <View style={styles.tableCenter}>
                    {stage !== GameStage.PRE_DEAL && <Pot amount={pot} />}
                    <CommunityCards cards={communityCards} stage={stage} />
                    
                    {handOver && handOver.winners.length > 0 && (
                        <View style={styles.handOverContainer}>
                            <Text style={styles.winnerText}>
                                🎉 {handOver.winners.map(w => w.name).join(', ')} wins ${handOver.pot}!
                            </Text>
                            <Text style={styles.handNameText}>
                                with a {handOver.winners[0].hand.name}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Players positioned around table */}
                <View style={styles.playersContainer}>
                    {players.map((p, i) => (
                        <View 
                            key={p.id} 
                            style={[
                                styles.playerPosition,
                                getPlayerPosition(i, players.length, p.id === currentPlayer.id && currentPlayer.isHuman)
                            ]}
                        >
                            <Player 
                                player={p} 
                                isTurn={p.id === currentPlayer.id && !handOver} 
                                handOver={handOver}
                                isDealer={dealerIndex === i}
                                showCards={p.isHuman}
                            />
                        </View>
                    ))}
                </View>

                {/* Game Message */}
                <View style={styles.messageContainer}>
                    {stage === GameStage.PRE_DEAL && !handOver ? (
                        <TouchableOpacity style={styles.startGameButton} onPress={startGame}>
                            <Text style={styles.startGameButtonText}>🎲 Deal Cards</Text>
                        </TouchableOpacity>
                    ) : handOver ? (
                        <TouchableOpacity style={styles.nextHandButton} onPress={startGame}>
                            <Text style={styles.nextHandButtonText}>➡️ Next Hand</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.gameMessage}>{gameMessage}</Text>
                    )}
                </View>

                {/* Action Bar */}
                {isPlayerTurn && !showInterstitial && (
                    <View style={styles.actionBarContainer}>
                        <ActionBar
                            player={currentPlayer}
                            currentBet={currentBet}
                            minRaise={minRaise}
                            onAction={playerAction}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d2818',
    },
    lobbyContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    lobbyCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 20,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    lobbyTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fbbf24',
        textAlign: 'center',
        marginBottom: 8,
    },
    lobbySubtitle: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 32,
    },
    modeSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    modeButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modeButton: {
        flex: 1,
        backgroundColor: '#374151',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    activeModeButton: {
        backgroundColor: '#fbbf24',
    },
    modeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    activeModeButtonText: {
        color: '#000',
    },
    playersSection: {
        marginBottom: 24,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    sliderTrack: {
        flexDirection: 'row',
        gap: 20,
    },
    sliderDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#6b7280',
    },
    activeSliderDot: {
        backgroundColor: '#fbbf24',
    },
    sliderLabel: {
        color: '#9ca3af',
        fontSize: 14,
    },
    startButton: {
        backgroundColor: '#059669',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    interstitial: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    interstitialContent: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 32,
        borderRadius: 20,
        alignItems: 'center',
        maxWidth: 300,
    },
    interstitialTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },
    interstitialSubtitle: {
        fontSize: 18,
        color: '#fbbf24',
        textAlign: 'center',
        marginBottom: 24,
    },
    readyButton: {
        backgroundColor: '#fbbf24',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    readyButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    gameTable: {
        flex: 1,
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    },
    backButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    gameTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fbbf24',
    },
    placeholder: {
        width: 80,
    },
    tableCenter: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -150 }, { translateY: -100 }],
        width: 300,
        alignItems: 'center',
        zIndex: 1,
    },
    handOverContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        maxWidth: 280,
    },
    winnerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fbbf24',
        textAlign: 'center',
        marginBottom: 4,
    },
    handNameText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },
    playersContainer: {
        flex: 1,
        position: 'relative',
    },
    playerPosition: {
        position: 'absolute',
    },
    bottomPlayer: {
        bottom: 120,
        left: '50%',
        transform: [{ translateX: -80 }],
    },
    topPlayer: {
        top: 120,
        left: '50%',
        transform: [{ translateX: -80 }],
    },
    leftPlayer: {
        left: 20,
        top: '40%',
        transform: [{ translateY: -80 }],
    },
    rightPlayer: {
        right: 20,
        top: '40%',
        transform: [{ translateY: -80 }],
    },
    messageContainer: {
        position: 'absolute',
        bottom: 200,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 2,
    },
    startGameButton: {
        backgroundColor: '#fbbf24',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    startGameButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    nextHandButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    nextHandButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    gameMessage: {
        fontSize: 16,
        color: '#d1d5db',
        fontStyle: 'italic',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        textAlign: 'center',
    },
    actionBarContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        zIndex: 10,
    },
});

export default GeminiPokerGame;