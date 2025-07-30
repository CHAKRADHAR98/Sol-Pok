// components/poker/CommunityCards.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card as CardType, GameStage } from '../../types/poker';
import Card from './Card';

interface CommunityCardsProps {
    cards: CardType[];
    stage: GameStage;
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards, stage }) => {
    if (stage === GameStage.PRE_DEAL || stage === GameStage.PRE_FLOP) {
        return (
            <View style={styles.container}>
                <Text style={styles.stageText}>
                    {stage === GameStage.PRE_DEAL ? 'Waiting for cards...' : 'Pre-flop betting'}
                </Text>
            </View>
        );
    }

    const getStageDescription = () => {
        switch (stage) {
            case GameStage.FLOP:
                return 'The Flop';
            case GameStage.TURN:
                return 'The Turn';
            case GameStage.RIVER:
                return 'The River';
            case GameStage.SHOWDOWN:
                return 'Showdown';
            default:
                return 'Community Cards';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.stageLabel}>{getStageDescription()}</Text>
            <View style={styles.cardsContainer}>
                {Array.from({ length: 5 }, (_, index) => {
                    const card = cards[index];
                    if (card) {
                        return (
                            <Card 
                                key={index} 
                                card={card} 
                                faceUp={true}
                                size="medium"
                            />
                        );
                    } else {
                        return (
                            <View key={index} style={styles.placeholderCard}>
                                <Text style={styles.placeholderText}>?</Text>
                            </View>
                        );
                    }
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 12,
        marginVertical: 8,
    },
    stageLabel: {
        color: '#fbbf24',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    stageText: {
        color: '#9ca3af',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 20,
    },
    cardsContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderCard: {
        width: 64,
        height: 96,
        backgroundColor: 'rgba(75, 85, 99, 0.5)',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#6b7280',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 2,
    },
    placeholderText: {
        color: '#9ca3af',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default CommunityCards;