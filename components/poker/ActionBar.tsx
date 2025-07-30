// components/poker/ActionBar.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Player, PlayerAction, PlayerActionType } from '../../types/poker';
import { BIG_BLIND } from '../../constants/poker';

interface ActionBarProps {
    player: Player;
    currentBet: number;
    minRaise: number;
    onAction: (action: PlayerAction) => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ 
    player, 
    currentBet, 
    minRaise,
    onAction 
}) => {
    const amountToCall = currentBet - player.currentBet;
    const [betAmount, setBetAmount] = useState(BIG_BLIND);

    const minBet = Math.max(minRaise, BIG_BLIND);
    const maxBet = player.stack;
    const canCheck = amountToCall === 0;

    useEffect(() => {
        setBetAmount(Math.max(minBet, BIG_BLIND));
    }, [currentBet, minBet]);

    const handleFold = () => onAction({ type: PlayerActionType.FOLD });
    const handleCheck = () => onAction({ type: PlayerActionType.CHECK });
    const handleCall = () => onAction({ type: PlayerActionType.CALL });
    const handleBet = () => onAction({ type: PlayerActionType.BET, amount: betAmount });
    const handleRaise = () => {
        const raiseAmount = betAmount - player.currentBet;
        onAction({ type: PlayerActionType.RAISE, amount: raiseAmount });
    };

    if (player.stack === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.allInText}>You are All-In</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Main Action Buttons */}
            <View style={styles.actionButtonsRow}>
                <TouchableOpacity 
                    style={styles.foldButton} 
                    onPress={handleFold}
                >
                    <Text style={styles.actionButtonText}>Fold</Text>
                </TouchableOpacity>
                
                {canCheck ? (
                    <TouchableOpacity 
                        style={styles.checkButton} 
                        onPress={handleCheck}
                    >
                        <Text style={styles.actionButtonText}>Check</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={[
                            styles.callButton,
                            player.stack < amountToCall && styles.disabledButton
                        ]} 
                        onPress={handleCall}
                        disabled={player.stack < amountToCall}
                    >
                        <Text style={styles.actionButtonText}>
                            Call ${Math.min(amountToCall, player.stack)}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Betting Controls */}
            <View style={styles.bettingControls}>
                <View style={styles.sliderContainer}>
                    <Text style={styles.betAmountText}>${betAmount}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={minBet}
                        maximumValue={maxBet}
                        step={BIG_BLIND}
                        value={betAmount}
                        onValueChange={setBetAmount}
                        minimumTrackTintColor="#10b981"
                        maximumTrackTintColor="#6b7280"
                        thumbTintColor="#10b981"
                        disabled={player.stack === 0}
                    />
                    <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>${minBet}</Text>
                        <Text style={styles.sliderLabel}>${maxBet}</Text>
                    </View>
                </View>
                
                <TouchableOpacity
                    style={[
                        styles.betRaiseButton,
                        (player.stack < betAmount || betAmount < minBet) && styles.disabledButton
                    ]}
                    onPress={currentBet > 0 ? handleRaise : handleBet}
                    disabled={player.stack < betAmount || betAmount < minBet}
                >
                    <Text style={styles.actionButtonText}>
                        {currentBet > 0 ? 'Raise to' : 'Bet'} ${betAmount}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        margin: 8,
    },
    allInText: {
        color: '#fbbf24',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 16,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    foldButton: {
        backgroundColor: '#dc2626',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    checkButton: {
        backgroundColor: '#6b7280',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    callButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    betRaiseButton: {
        backgroundColor: '#059669',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledButton: {
        backgroundColor: '#374151',
        opacity: 0.6,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    bettingControls: {
        alignItems: 'center',
    },
    sliderContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 8,
    },
    betAmountText: {
        color: '#10b981',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 8,
    },
    sliderLabel: {
        color: '#9ca3af',
        fontSize: 12,
    },
});

export default ActionBar;