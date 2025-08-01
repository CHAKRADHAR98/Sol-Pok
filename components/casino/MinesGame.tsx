import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { GameState, Tile as TileType } from './types';
import MinesTile from './MinesTile';
import { generateMines, calculateMultiplier } from './utils/gameLogic';

const TOTAL_TILES = 25;

interface MinesGameProps {
    onGoBack: () => void;
    coins: number;
    onCoinChange: (amount: number) => void;
}

const MinesGame: React.FC<MinesGameProps> = ({ onGoBack, coins, onCoinChange }) => {
    const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
    const [betAmount, setBetAmount] = useState<number>(10);
    const [minesCount, setMinesCount] = useState<number>(5);
    const [tiles, setTiles] = useState<TileType[]>([]);
    const [revealedSafeTilesCount, setRevealedSafeTilesCount] = useState<number>(0);
    
    const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
    const [nextMultiplier, setNextMultiplier] = useState<number>(1);

    const resetGame = useCallback(() => {
        setGameState(GameState.SETUP);
        setRevealedSafeTilesCount(0);
        setCurrentMultiplier(1);
        setNextMultiplier(1);
        // Initialize empty tiles for setup
        setTiles(Array.from({ length: TOTAL_TILES }, (_, i) => ({ 
            id: i, 
            isMine: false, 
            isRevealed: false 
        })));
    }, []);

    useEffect(() => {
        resetGame();
    }, [resetGame]);
    
    useEffect(() => {
        if (gameState === GameState.PLAYING && revealedSafeTilesCount >= 0) {
            const nextPicks = revealedSafeTilesCount + 1;
            const nextMult = calculateMultiplier(nextPicks, minesCount);
            setNextMultiplier(nextMult);
            
            if (revealedSafeTilesCount > 0) {
                const currentMult = calculateMultiplier(revealedSafeTilesCount, minesCount);
                setCurrentMultiplier(currentMult);
            }
        }
    }, [revealedSafeTilesCount, minesCount, gameState]);

    const handleStartGame = () => {
        if (betAmount > coins) return;
        onCoinChange(-betAmount);
        
        // Generate mine positions
        const mineLocations = generateMines(minesCount);
        console.log('Mine locations:', mineLocations); // Debug log
        
        // Create tiles with mines
        const newTiles = Array.from({ length: TOTAL_TILES }, (_, i) => ({
            id: i,
            isMine: mineLocations.includes(i),
            isRevealed: false,
        }));
        
        console.log('Tiles created:', newTiles.filter(t => t.isMine).length, 'mines'); // Debug log
        
        setTiles(newTiles);
        setRevealedSafeTilesCount(0);
        setCurrentMultiplier(1);
        const firstMultiplier = calculateMultiplier(1, minesCount);
        setNextMultiplier(firstMultiplier);
        setGameState(GameState.PLAYING);
    };

    const handleTileClick = (index: number) => {
        if (gameState !== GameState.PLAYING || tiles[index].isRevealed) return;

        const newTiles = [...tiles];
        newTiles[index] = { ...newTiles[index], isRevealed: true };
        setTiles(newTiles);

        console.log('Clicked tile:', index, 'isMine:', newTiles[index].isMine); // Debug log

        if (newTiles[index].isMine) {
            console.log('Hit mine! Game over.'); // Debug log
            setGameState(GameState.LOST);
            setCurrentMultiplier(0);
        } else {
            const newRevealedCount = revealedSafeTilesCount + 1;
            console.log('Found gem! Revealed count:', newRevealedCount); // Debug log
            setRevealedSafeTilesCount(newRevealedCount);
            
            const newMultiplier = calculateMultiplier(newRevealedCount, minesCount);
            setCurrentMultiplier(newMultiplier);

            const safeTilesLeft = TOTAL_TILES - minesCount - newRevealedCount;
            if (safeTilesLeft === 0) {
                console.log('All safe tiles found! You win!'); // Debug log
                setGameState(GameState.WON);
                onCoinChange(betAmount * newMultiplier);
            }
        }
    };

    const handleCashOut = () => {
        if (gameState !== GameState.PLAYING || revealedSafeTilesCount === 0) return;
        const payout = betAmount * currentMultiplier;
        console.log('Cashing out:', payout, 'coins'); // Debug log
        onCoinChange(payout);
        setGameState(GameState.WON);
    };

    const renderGameResult = () => {
        if (gameState !== GameState.LOST && gameState !== GameState.WON) return null;
        const isWin = gameState === GameState.WON;
        const payout = betAmount * currentMultiplier;
        const message = isWin ? `You won! Cashed out at ${currentMultiplier.toFixed(2)}x` : 'You hit a mine!';
        
        return (
            <View style={styles.gameResultOverlay}>
                <View style={[styles.gameResultCard, { backgroundColor: isWin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                    <Text style={[styles.gameResultMessage, { color: isWin ? '#10b981' : '#ef4444' }]}>
                        {message}
                    </Text>
                    {isWin && (
                        <Text style={styles.payoutText}>
                            Payout: <Text style={styles.payoutAmount}>{payout.toFixed(2)}</Text> coins
                        </Text>
                    )}
                    <View style={styles.gameResultButtons}>
                        <TouchableOpacity
                            onPress={resetGame}
                            style={styles.playAgainButton}
                        >
                            <Text style={styles.playAgainButtonText}>Play Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onGoBack}
                            style={styles.backToLobbyButton}
                        >
                            <Text style={styles.backToLobbyButtonText}>Back to Lobby</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderSetup = () => (
        <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>🎯 Game Setup</Text>
            
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bet Amount</Text>
                <TextInput
                    value={betAmount.toString()}
                    onChangeText={(text) => setBetAmount(Math.max(1, parseInt(text) || 1))}
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="Enter bet amount"
                    placeholderTextColor="#6b7280"
                />
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mines ({minesCount})</Text>
                <View style={styles.quickSelectMines}>
                    {[3, 5, 7, 10].map(num => (
                        <TouchableOpacity
                            key={num}
                            style={[
                                styles.quickSelectButton,
                                minesCount === num && styles.activeQuickSelect
                            ]}
                            onPress={() => setMinesCount(num)}
                        >
                            <Text style={[
                                styles.quickSelectText,
                                minesCount === num && styles.activeQuickSelectText
                            ]}>
                                {num}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <TouchableOpacity
                onPress={handleStartGame}
                style={[
                    styles.startButton,
                    (betAmount <= 0 || betAmount > coins) && styles.disabledButton
                ]}
                disabled={betAmount <= 0 || betAmount > coins}
            >
                <Text style={styles.startButtonText}>
                    {betAmount > coins ? 'Not Enough Coins' : 'Start Game'}
                </Text>
            </TouchableOpacity>
        </View>
    );
    
    const renderGameControls = () => (
        <View style={styles.controlsCard}>
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Gems Found</Text>
                    <Text style={styles.statValue}>{revealedSafeTilesCount} 💎</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Mines</Text>
                    <Text style={styles.statValueDanger}>{minesCount} 💣</Text>
                </View>
            </View>

            <View style={styles.multiplierCard}>
                 <Text style={styles.multiplierLabel}>Current Multiplier</Text>
                 <Text style={styles.multiplierValue}>{currentMultiplier.toFixed(2)}x</Text>
            </View>
            
            <View style={styles.nextMultiplierContainer}>
                 <Text style={styles.nextMultiplierLabel}>Next Tile Multiplier</Text>
                 <Text style={styles.nextMultiplierValue}>{nextMultiplier.toFixed(2)}x</Text>
            </View>

            <TouchableOpacity
                onPress={handleCashOut}
                disabled={gameState !== GameState.PLAYING || revealedSafeTilesCount === 0}
                style={[
                    styles.cashOutButton,
                    (gameState !== GameState.PLAYING || revealedSafeTilesCount === 0) && styles.disabledButton
                ]}
            >
                <Text style={styles.cashOutButtonText}>
                    Cash Out ({(betAmount * currentMultiplier).toFixed(2)} coins)
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mines</Text>
                <View style={styles.coinsDisplay}>
                    <Text style={styles.coinsText}>{coins.toLocaleString()} 🪙</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.gameArea}>
                    {/* Controls */}
                    {gameState === GameState.SETUP ? renderSetup() : renderGameControls()}

                    {/* Game Grid - Always show tiles */}
                    <View style={styles.gameGridContainer}>
                        <Text style={styles.gridTitle}>
                            {gameState === GameState.SETUP ? 'Click Start Game to Begin' : 'Find the Gems! 💎'}
                        </Text>
                        <View style={styles.gameGrid}>
                            {tiles.map((tile, i) => (
                                <MinesTile 
                                    key={i} 
                                    tile={tile} 
                                    gameState={gameState} 
                                    onPress={() => handleTileClick(i)} 
                                />
                            ))}
                        </View>
                        {renderGameResult()}
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fbbf24',
    },
    coinsDisplay: {
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    coinsText: {
        color: '#fbbf24',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    gameArea: {
        padding: 20,
        paddingBottom: 40,
    },
    gameGridContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    gridTitle: {
        color: '#9ca3af',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    gameGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.5)',
        width: 350,
        height: 350,
        justifyContent: 'space-between',
        alignContent: 'space-between',
    },
    setupCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.5)',
    },
    setupTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
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
        borderRadius: 12,
        padding: 16,
        color: 'white',
        fontSize: 16,
    },
    quickSelectMines: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    quickSelectButton: {
        backgroundColor: 'rgba(55, 65, 81, 0.8)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    activeQuickSelect: {
        backgroundColor: '#fbbf24',
    },
    quickSelectText: {
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '600',
    },
    activeQuickSelectText: {
        color: '#000',
    },
    startButton: {
        backgroundColor: '#10b981',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    startButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#374151',
        opacity: 0.6,
    },
    controlsCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.5)',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        color: '#10b981',
        fontWeight: 'bold',
    },
    statValueDanger: {
        fontSize: 18,
        color: '#ef4444',
        fontWeight: 'bold',
    },
    multiplierCard: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#374151',
    },
    multiplierLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    multiplierValue: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
    },
    nextMultiplierContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    nextMultiplierLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    nextMultiplierValue: {
        fontSize: 18,
        color: '#06b6d4',
        fontWeight: 'bold',
    },
    cashOutButton: {
        backgroundColor: '#10b981',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    cashOutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    gameResultOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    gameResultCard: {
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        maxWidth: 320,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    gameResultMessage: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    payoutText: {
        fontSize: 16,
        color: '#9ca3af',
        marginBottom: 24,
    },
    payoutAmount: {
        color: '#fbbf24',
        fontWeight: 'bold',
    },
    gameResultButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    playAgainButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    playAgainButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backToLobbyButton: {
        backgroundColor: '#6b7280',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backToLobbyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MinesGame;