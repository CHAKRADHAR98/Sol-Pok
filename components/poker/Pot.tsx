// components/poker/Pot.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PotProps {
    amount: number;
}

const Pot: React.FC<PotProps> = ({ amount }) => {
    return (
        <View style={styles.container}>
            <View style={styles.potContainer}>
                <Text style={styles.potLabel}>POT</Text>
                <Text style={styles.potAmount}>${amount}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 8,
    },
    potContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        borderColor: '#fbbf24',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    potLabel: {
        color: '#fbbf24',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    potAmount: {
        color: '#fbbf24',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
});

export default Pot;