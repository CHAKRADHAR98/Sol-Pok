// services/geminiService.ts
import Constants from 'expo-constants';
import { GameState, PlayerAction, PlayerActionType } from '../types/poker';
import { BIG_BLIND, STARTING_STACK } from '../constants/poker';

// For React Native/Expo, get API key from app config
const API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("GEMINI_API_KEY is not set. AI will use fallback logic.");
}

// Simple hand evaluation fallback when pokersolver isn't available
const evaluateHandStrength = (cards: string[]): number => {
    if (cards.length < 2) return 0;
    
    // Basic hand strength evaluation (0-100)
    const ranks = cards.map(card => card.slice(0, -1));
    const suits = cards.map(card => card.slice(-1));
    
    // Check for pairs
    const rankCounts: { [key: string]: number } = {};
    ranks.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    const counts = Object.values(rankCounts);
    const maxCount = Math.max(...counts);
    
    // High cards value
    const highCardValue = ranks.reduce((sum, rank) => {
        const value = rank === 'A' ? 14 : rank === 'K' ? 13 : rank === 'Q' ? 12 : 
                     rank === 'J' ? 11 : rank === 'T' ? 10 : parseInt(rank);
        return sum + value;
    }, 0);
    
    // Basic strength calculation
    if (maxCount >= 3) return 80 + highCardValue; // Three of a kind or better
    if (maxCount === 2) return 40 + highCardValue; // Pair
    
    // Check for potential straights and flushes
    const isFlush = suits.length > 1 && suits.every(suit => suit === suits[0]);
    if (isFlush) return 60 + highCardValue;
    
    return highCardValue; // High card
};

const makeAIDecision = (gameState: GameState): PlayerAction => {
    const aiPlayer = gameState.players.find(p => p.id === 'ai');
    if (!aiPlayer) return { type: PlayerActionType.FOLD };
    
    const amountToCall = gameState.currentBet - aiPlayer.currentBet;
    const canCheck = amountToCall === 0;
    
    // Simple AI logic based on hand strength
    const handStrength = evaluateHandStrength([...aiPlayer.hand, ...gameState.communityCards]);
    const potOdds = amountToCall / (gameState.pot + amountToCall);
    const stackRatio = aiPlayer.stack / STARTING_STACK;
    
    // Decision thresholds
    const random = Math.random();
    
    // Strong hand (>70 strength)
    if (handStrength > 70) {
        if (random < 0.7 && aiPlayer.stack > gameState.minRaise) {
            const raiseAmount = Math.min(
                gameState.minRaise + Math.floor(Math.random() * gameState.minRaise),
                aiPlayer.stack
            );
            return { 
                type: canCheck ? PlayerActionType.BET : PlayerActionType.RAISE, 
                amount: raiseAmount 
            };
        }
        return canCheck ? { type: PlayerActionType.CHECK } : { type: PlayerActionType.CALL };
    }
    
    // Medium hand (40-70 strength)
    if (handStrength > 40) {
        if (amountToCall > aiPlayer.stack * 0.2) {
            return { type: PlayerActionType.FOLD };
        }
        return canCheck ? { type: PlayerActionType.CHECK } : { type: PlayerActionType.CALL };
    }
    
    // Weak hand (<40 strength)
    if (amountToCall === 0) {
        return { type: PlayerActionType.CHECK };
    }
    
    // Fold if bet is too large relative to stack
    if (amountToCall > aiPlayer.stack * 0.15) {
        return { type: PlayerActionType.FOLD };
    }
    
    // Sometimes call with weak hands (bluff catcher)
    if (random < 0.3) {
        return { type: PlayerActionType.CALL };
    }
    
    return { type: PlayerActionType.FOLD };
};

export const getAIAction = async (gameState: GameState): Promise<PlayerAction> => {
    // If no API key, use simple AI logic
    if (!API_KEY) {
        console.log("No API key found, using fallback AI logic");
        // Add realistic delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        return makeAIDecision(gameState);
    }

    const aiPlayer = gameState.players.find(p => p.id === 'ai');
    if (!aiPlayer) throw new Error("AI player not found in game state.");
    
    const amountToCall = gameState.currentBet - aiPlayer.currentBet;
    const canCheck = amountToCall === 0;

    // For React Native, we'll use fetch with the correct Gemini API endpoint
    try {
        console.log("Attempting Gemini API call...");
        
        const prompt = `You are a professional Texas Hold'em poker player. Analyze this game state and make the optimal decision.

Your hand: ${aiPlayer.hand.join(', ')}
Community cards: ${gameState.communityCards.join(', ')}
Game stage: ${gameState.stage}
Pot size: ${gameState.pot}
Current bet: ${gameState.currentBet}
Your current bet: ${aiPlayer.currentBet}
Amount to call: ${amountToCall}
Your stack: ${aiPlayer.stack}
Can check: ${canCheck}

Players:
${gameState.players.map((p, i) => 
    `${p.name}: Stack=${p.stack}, Bet=${p.currentBet}, ${p.isFolded ? 'FOLDED' : 'ACTIVE'}`
).join('\n')}

Respond with JSON in this format:
{
    "action": "FOLD|CHECK|CALL|BET|RAISE",
    "amount": number,
    "reasoning": "brief explanation"
}

For BET/RAISE, amount should be the total bet amount or additional raise amount.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 256,
                }
            })
        });

        if (!response.ok) {
            console.error(`Gemini API error: ${response.status}`);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        console.log("Gemini response:", text);
        
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const action = parsed.action as PlayerActionType;
            const amount = parsed.amount || 0;
            
            console.log("Parsed action:", { action, amount });
            
            // Validate action
            if (action === PlayerActionType.CHECK && amountToCall > 0) {
                return { type: PlayerActionType.FOLD };
            }
            if (action === PlayerActionType.CALL && amountToCall === 0) {
                return { type: PlayerActionType.CHECK };
            }
            if ((action === PlayerActionType.BET || action === PlayerActionType.RAISE) && amount > aiPlayer.stack) {
                return { type: action, amount: aiPlayer.stack };
            }
            
            return { type: action, amount };
        }
        
        // Fallback if parsing fails
        console.log("Failed to parse Gemini response, using fallback");
        return makeAIDecision(gameState);
        
    } catch (error) {
        console.error("Gemini API Error:", error);
        return makeAIDecision(gameState);
    }
};