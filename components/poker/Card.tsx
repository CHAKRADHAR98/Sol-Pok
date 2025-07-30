// components/poker/Card.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card as CardType, Suit, Rank } from '../../types/poker';

interface CardProps {
    card: CardType;
    faceUp?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const SuitSymbol: React.FC<{ suit: Suit }> = ({ suit }) => {
    const suitMap = {
        [Suit.Spades]: { symbol: '♠', color: '#1f2937' },
        [Suit.Hearts]: { symbol: '♥', color: '#dc2626' },
        [Suit.Diamonds]: { symbol: '♦', color: '#dc2626' },
        [Suit.Clubs]: { symbol: '♣', color: '#1f2937' },
    };
    const { symbol, color } = suitMap[suit];
    return <Text style={[styles.suitSymbol, { color }]}>{symbol}</Text>;
};

const Card: React.FC<CardProps> = ({ card, faceUp = false, size = 'medium' }) => {
    const cardSizes = {
        small: { width: 48, height: 72 },
        medium: { width: 64, height: 96 },
        large: { width: 80, height: 120 },
    };

    const fontSizes = {
        small: { rank: 12, suit: 10, center: 20 },
        medium: { rank: 16, suit: 14, center: 28 },
        large: { rank: 20, suit: 18, center: 36 },
    };

    const cardSize = cardSizes[size];
    const fontSize = fontSizes[size];

    if (!faceUp) {
        return (
            <View style={[styles.card, styles.cardBack, cardSize]}>
                <View style={styles.cardBackInner}>
                    <View style={styles.cardBackPattern}>
                        <View style={styles.backCircle1} />
                        <View style={styles.backCircle2} />
                        <View style={styles.backCircle3} />
                    </View>
                    <Text style={[styles.cardBackText, { fontSize: fontSize.center }]}>🂠</Text>
                </View>
            </View>
        );
    }

    const rank = card.slice(0, -1) as Rank;
    const suit = card.slice(-1) as Suit;
    const isRed = suit === Suit.Hearts || suit === Suit.Diamonds;

    return (
        <View style={[styles.card, styles.cardFront, cardSize]}>
            {/* Top left corner */}
            <View style={styles.topLeft}>
                <Text style={[styles.rankText, { fontSize: fontSize.rank, color: isRed ? '#dc2626' : '#1f2937' }]}>
                    {rank}
                </Text>
                <Text style={[styles.suitText, { fontSize: fontSize.suit, color: isRed ? '#dc2626' : '#1f2937' }]}>
                    <SuitSymbol suit={suit} />
                </Text>
            </View>

            {/* Center suit symbol */}
            {size !== 'small' && (
                <View style={styles.center}>
                    <Text style={[styles.centerSuit, { fontSize: fontSize.center, color: isRed ? '#dc2626' : '#1f2937' }]}>
                        <SuitSymbol suit={suit} />
                    </Text>
                </View>
            )}

            {/* Bottom right corner (rotated) */}
            <View style={styles.bottomRight}>
                <Text style={[styles.suitText, styles.rotated, { fontSize: fontSize.suit, color: isRed ? '#dc2626' : '#1f2937' }]}>
                    <SuitSymbol suit={suit} />
                </Text>
                <Text style={[styles.rankText, styles.rotated, { fontSize: fontSize.rank, color: isRed ? '#dc2626' : '#1f2937' }]}>
                    {rank}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        borderWidth: 1,
        margin: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    cardFront: {
        backgroundColor: 'white',
        borderColor: '#e5e7eb',
        position: 'relative',
    },
    cardBack: {
        backgroundColor: '#1e3a8a',
        borderColor: '#1e40af',
    },
    cardBackInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    cardBackPattern: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    backCircle1: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        top: 6,
        left: 6,
    },
    backCircle2: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        bottom: 6,
        right: 6,
    },
    backCircle3: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        top: '50%',
        left: '50%',
        marginTop: -10,
        marginLeft: -10,
    },
    cardBackText: {
        color: '#3b82f6',
        fontWeight: 'bold',
        zIndex: 2,
    },
    topLeft: {
        position: 'absolute',
        top: 4,
        left: 4,
        alignItems: 'center',
    },
    bottomRight: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        alignItems: 'center',
    },
    center: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -14 }, { translateY: -18 }],
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    suitText: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: -2,
    },
    suitSymbol: {
        fontWeight: 'bold',
    },
    centerSuit: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    rotated: {
        transform: [{ rotate: '180deg' }],
    },
});

export default Card;