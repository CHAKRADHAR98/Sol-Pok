import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { GamePhase, GameResult, Card as CardType, Hand as HandType } from './types';
import { createDeck, shuffleDeck, calculateHandValue } from './utils/gameLogic';
import BlackjackHand from './BlackjackHand';
import BlackjackControls from './BlackjackControls';

interface BlackjackGameProps {
    onGoBack: () => void;
    coins: number;
    onCoinChange: (amount: number) => void;
}

const BlackjackGame: React.FC<BlackjackGameProps> = ({ onGoBack, coins, onCoinChange }) => {
    const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.BETTING);
    const [gameResult, setGameResult] = useState<GameResult>(GameResult.NONE);
    const [deck, setDeck] = useState<CardType[]>([]);
    const [playerHand, setPlayerHand] = useState<HandType>([]);
    const [dealerHand, setDealerHand] = useState<HandType>([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [betAmount, setBetAmount] = useState(10);

    const resetGame = useCallback(() => {
        setGamePhase(GamePhase.BETTING);
        setGameResult(GameResult.NONE);
        setPlayerHand([]);
        setDealerHand([]);
    }, []);

    const handleWin = useCallback((multiplier: number) => {
        onCoinChange(betAmount * multiplier);
    }, [betAmount, onCoinChange]);

    const determineWinner = useCallback((finalPlayerScore: number, finalDealerScore: number) => {
        if (finalDealerScore > 21 || finalPlayerScore > finalDealerScore) {
            setGameResult(GameResult.PLAYER_WINS);
            handleWin(1); // Standard win pays 1x the bet (winnings)
        } else if (finalDealerScore > finalPlayerScore) {
            setGameResult(GameResult.DEALER_WINS);
        } else {
            setGameResult(GameResult.PUSH);
            onCoinChange(betAmount); // Push returns the original bet
        }
        setGamePhase(GamePhase.FINISHED);
    }, [handleWin, betAmount, onCoinChange]);

    const handleBet = () => {
        if (betAmount > coins) return;
        onCoinChange(-betAmount);

        const newDeck = shuffleDeck(createDeck());
        const pHand = [newDeck.pop()!, newDeck.pop()!];
        const dHand = [newDeck.pop()!, newDeck.pop()!];

        setPlayerHand(pHand);
        setDealerHand(dHand);
        setDeck(newDeck);
        setGameResult(GameResult.NONE);
        
        const pScore = calculateHandValue(pHand);
        if (pScore === 21) {
            setGameResult(GameResult.BLACKJACK);
            onCoinChange(betAmount * 2.5); // Blackjack pays 2.5x the bet
            setGamePhase(GamePhase.FINISHED);
        } else {
            setGamePhase(GamePhase.PLAYER_TURN);
        }
    };
    
    const handleHit = () => {
        if(deck.length === 0) return;
        const newDeck = [...deck];
        const nextCard = newDeck.pop()!;
        const newPlayerHand = [...playerHand, nextCard];
        setPlayerHand(newPlayerHand);
        setDeck(newDeck);
        
        if (calculateHandValue(newPlayerHand) > 21) {
            setGameResult(GameResult.BUST);
            setGamePhase(GamePhase.FINISHED);
        }
    };

    const handleStand = () => {
        setGamePhase(GamePhase.DEALER_TURN);
    };

    useEffect(() => {
        setPlayerScore(calculateHandValue(playerHand));
        setDealerScore(calculateHandValue(dealerHand));
    }, [playerHand, dealerHand]);

    useEffect(() => {
        if (gamePhase === GamePhase.DEALER_TURN) {
            const dealerLogic = async () => {
                let currentDealerHand = [...dealerHand];
                let currentDeck = [...deck];
                let currentScore = calculateHandValue(currentDealerHand);
                
                while(currentScore < 17) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    if(currentDeck.length > 0) {
                        const nextCard = currentDeck.pop()!;
                        currentDealerHand = [...currentDealerHand, nextCard];
                        setDealerHand(currentDealerHand);
                        currentScore = calculateHandValue(currentDealerHand);
                    } else {
                        break;
                    }
                }
                setDeck(currentDeck);
                determineWinner(playerScore, currentScore);
            };
            dealerLogic();
        }
    }, [gamePhase, dealerHand, deck, playerScore, determineWinner]);

    const renderGameResult = () => {
        if (gamePhase !== GamePhase.FINISHED) return null;
        let message = '';
        let messageColor = 'white';
        let backgroundColor = 'rgba(0, 0, 0, 0.8)';
        
        switch (gameResult) {
            case GameResult.PLAYER_WINS:
                message = `You win! +${(betAmount).toLocaleString()} Coins`;
                messageColor = '#10b981';
                backgroundColor = 'rgba(16, 185, 129, 0.1)';
                break;
            case GameResult.DEALER_WINS:
                message = `Dealer wins.`;
                messageColor = '#ef4444';
                backgroundColor = 'rgba(239, 68, 68, 0.1)';
                break;
            case GameResult.BUST:
                message = `Bust! You lost.`;
                messageColor = '#ef4444';
                backgroundColor = 'rgba(239, 68, 68, 0.1)';
                break;
            case GameResult.BLACKJACK:
                message = `Blackjack! +${(betAmount * 1.5).toLocaleString()} Coins`;
                messageColor = '#fbbf24';
                backgroundColor = 'rgba(251, 191, 36, 0.1)';
                break;
            case GameResult.PUSH:
                message = "Push. It's a tie.";
                messageColor = '#6b7280';
                backgroundColor = 'rgba(107, 114, 128, 0.1)';
                break;
        }

        return (
            <View style={[styles.gameResultOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
                <View style={[styles.gameResultCard, { backgroundColor }]}>
                    <Text style={[styles.gameResultMessage, { color: messageColor }]}>{message}</Text>
                    <View style={styles.gameResultButtons}>
                        <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
                            <Text style={styles.playAgainButtonText}>Play Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backToLobbyButton} onPress={onGoBack}>
                            <Text style={styles.backToLobbyButtonText}>Back to Lobby</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Blackjack</Text>
                <View style={styles.coinsDisplay}>
                    <Text style={styles.coinsText}>{coins.toLocaleString()} 🪙</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.gameArea}>
                    {renderGameResult()}

                    {/* Dealer's Area */}
                    <BlackjackHand 
                        title="Dealer's Hand" 
                        hand={dealerHand} 
                        score={dealerScore} 
                        isDealer={true} 
                        gamePhase={gamePhase} 
                    />

                    {/* Player's Area */}
                    <BlackjackHand 
                        title="Your Hand" 
                        hand={playerHand} 
                        score={playerScore} 
                        gamePhase={gamePhase} 
                    />

                    {/* Controls Area */}
                    <BlackjackControls 
                        gamePhase={gamePhase}
                        betAmount={betAmount}
                        setBetAmount={setBetAmount}
                        onBet={handleBet}
                        onHit={handleHit}
                        onStand={handleStand}
                        onPlayAgain={resetGame}
                        onGoBack={onGoBack}
                        coins={coins}
                    />
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
        flex: 1,
        padding: 20,
        paddingBottom: 40,
    },
    gameResultOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    gameResultButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    playAgainButton: {
        backgroundColor: '#10b981',
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

export default BlackjackGame;