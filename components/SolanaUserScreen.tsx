// components/SolanaUserScreen.tsx
import React, { useState, useCallback, useEffect } from "react";
import { Text, TextInput, View, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import * as Clipboard from 'expo-clipboard';
import { usePrivy, useEmbeddedSolanaWallet, getUserEmbeddedSolanaWallet } from "@privy-io/expo";
import CasinoLobby from "./casino/CasinoLobby";
import BlackjackGame from "./casino/BlackjackGame";
import MinesGame from "./casino/MinesGame";
import GeminiPokerGame from "./poker/GeminiPokerGame";
import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme";

const SOLANA_NETWORKS = {
  mainnet: "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
};
type ScreenType = 'wallet' | 'casino_lobby' | 'blackjack_game' | 'mines_game' | 'poker_game';
type GameType = 'poker' | 'blackjack' | 'mines';

export const SolanaUserScreen = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('wallet');
  const [casinoCoins, setCasinoCoins] = useState(1000);
  const [currentNetwork, setCurrentNetwork] = useState<keyof typeof SOLANA_NETWORKS>("devnet");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [solAmount, setSolAmount] = useState("0.001");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);

  const { logout, user } = usePrivy();
  const { create } = useEmbeddedSolanaWallet();
  const account = getUserEmbeddedSolanaWallet(user);

  const handleCoinChange = useCallback((amount: number) => {
    setCasinoCoins(prev => Math.max(0, prev + amount));
  }, []);

  const copyWalletAddress = useCallback(async () => {
    if (!account?.address) return;
    await Clipboard.setStringAsync(account.address);
    Alert.alert("Copied", "Wallet address copied to clipboard.");
  }, [account?.address]);

  const getBalance = useCallback(async () => {
    if (!account?.address) {
      setIsBalanceLoading(false);
      return;
    }
    setIsBalanceLoading(true);
    try {
      const connection = new Connection(SOLANA_NETWORKS[currentNetwork], "confirmed");
      const balance = await connection.getBalance(new PublicKey(account.address));
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      Alert.alert("Error", "Failed to fetch wallet balance.");
    } finally {
      setIsBalanceLoading(false);
    }
  }, [account?.address, currentNetwork]);

  const createWallet = useCallback(async () => {
      setLoading(true);
      try {
          if (create) {
              await create();
              getBalance();
          } else {
              Alert.alert("Error", "Wallet creation is not available at this moment.");
          }
      } catch (e) {
          console.error("Failed to create wallet", e);
          Alert.alert("Error", "An error occurred while creating the wallet.");
      } finally {
          setLoading(false);
      }
  }, [create, getBalance]);

  // FIX: Updated airdrop function with a more robust confirmation strategy.
  const requestAirdrop = useCallback(async () => {
    if (!account?.address) {
        Alert.alert("No Wallet", "Create a wallet before requesting an airdrop.");
        return;
    }
    if (currentNetwork === "mainnet") {
      Alert.alert("Mainnet Selected", "Airdrops are only available on the devnet.");
      return;
    }
  
    setLoading(true);
    try {
      const connection = new Connection(SOLANA_NETWORKS[currentNetwork], "confirmed");
      const publicKey = new PublicKey(account.address);
      
      // FIX: Get the latest blockhash for robust transaction confirmation.
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const signature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
  
      // FIX: Use the new blockhash information to confirm the transaction.
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");

      Alert.alert(
        "Airdrop Successful!", 
        "1 SOL has been added to your account. It may take a moment to reflect.",
        [
            {text: 'OK', onPress: () => getBalance()},
            {text: 'View on Explorer', onPress: () => Linking.openURL(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)}
        ]
      );
  
    } catch (error) {
      console.error("Airdrop Error:", error);
      Alert.alert("Airdrop Failed", "Could not complete the airdrop. The devnet may be busy. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [account?.address, currentNetwork, getBalance]);

  const sendSolTransaction = useCallback(async () => { /* ... Functionality unchanged ... */ }, [account, currentNetwork, getBalance, recipientAddress, solAmount]);
  
  useEffect(() => {
    getBalance();
  }, [account?.address, currentNetwork, getBalance]);

  const navigateToCasinoLobby = () => setCurrentScreen('casino_lobby');
  const navigateToWallet = () => setCurrentScreen('wallet');
  const navigateToGame = (game: GameType) => {
      if (game === 'poker' && !account?.address) {
          Alert.alert("Wallet Required", "Please create a Solana wallet first to play poker.");
          return;
      }
      setCurrentScreen(`${game}_game` as ScreenType);
  };

  const renderWalletScreen = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Crypto Balance</Text>
        {isBalanceLoading ? (
            <ActivityIndicator size="large" color={COLORS.primaryLight} />
        ) : (
            <Text style={styles.balanceAmount}>{walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : "N/A"}</Text>
        )}
        <TouchableOpacity style={styles.secondaryButton} onPress={getBalance} disabled={isBalanceLoading}>
          <Text style={styles.secondaryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Casino Coins</Text>
        <Text style={styles.balanceAmount}>{casinoCoins.toLocaleString()}</Text>
        <Text style={styles.helperText}>Used for in-game fun</Text>
      </View>

      <TouchableOpacity style={styles.ctaButton} onPress={navigateToCasinoLobby} activeOpacity={0.8}>
        <Text style={styles.ctaButtonText}>Enter Casino Lobby</Text>
      </TouchableOpacity>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wallet Management</Text>
        {account?.address ? (
          <>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">{account.address}</Text>
            </View>
            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.flexButton, styles.primaryButton]} onPress={copyWalletAddress}>
                    <Text style={styles.primaryButtonText}>Copy Address</Text>
                </TouchableOpacity>
                {currentNetwork !== "mainnet" && (
                    <TouchableOpacity style={[styles.flexButton, styles.secondaryButton]} onPress={requestAirdrop} disabled={loading}>
                        <Text style={styles.secondaryButtonText}>{loading ? 'Requesting...' : 'Get Test SOL'}</Text>
                    </TouchableOpacity>
                )}
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={createWallet} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? "Creating..." : "Create Solana Wallet"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Other cards like Send SOL, Network Selection would follow this styling... */}
      
      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  
  const renderScreen = () => {
    if (!user) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        )
    }
    switch (currentScreen) {
      case 'casino_lobby': return <CasinoLobby onGoBack={navigateToWallet} onSelectGame={navigateToGame} />;
      case 'blackjack_game': return <BlackjackGame onGoBack={navigateToCasinoLobby} coins={casinoCoins} onCoinChange={handleCoinChange} />;
      case 'mines_game': return <MinesGame onGoBack={navigateToCasinoLobby} coins={casinoCoins} onCoinChange={handleCoinChange} />;
      case 'poker_game': return <GeminiPokerGame playerId={user.id} onBackToLobby={navigateToCasinoLobby} />;
      default: return renderWalletScreen();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Betzy</Text>
        <View style={styles.networkBadge}>
          <Text style={styles.networkText}>{currentNetwork.toUpperCase()}</Text>
        </View>
      </View>
      {renderScreen()}
    </View>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    paddingTop: 50, // SafeArea
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface2,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
  },
  networkBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
  },
  networkText: { color: COLORS.text, fontSize: FONT_SIZES.small, fontWeight: 'bold' },
  scrollView: { padding: SPACING.medium },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.surface2
  },
  cardTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    marginBottom: SPACING.medium,
    fontFamily: 'Inter_500Medium',
  },
  balanceAmount: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: 'bold',
    marginBottom: SPACING.medium,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  helperText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, textAlign: 'center' },
  ctaButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: SPACING.medium,
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  ctaButtonText: { color: COLORS.background, fontSize: FONT_SIZES.large, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', gap: SPACING.medium },
  flexButton: { flex: 1, alignItems: 'center', borderRadius: 12, padding: SPACING.medium },
  primaryButton: { backgroundColor: COLORS.primary },
  primaryButtonText: { color: COLORS.text, fontSize: FONT_SIZES.medium, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: COLORS.surface2 },
  secondaryButtonText: { color: COLORS.text, fontSize: FONT_SIZES.medium },
  logoutButton: { backgroundColor: COLORS.danger, borderRadius: 12, padding: SPACING.medium, alignItems: 'center', marginTop: SPACING.medium },
  logoutButtonText: { color: COLORS.text, fontSize: FONT_SIZES.medium, fontWeight: 'bold' },
  addressContainer: { backgroundColor: COLORS.background, padding: SPACING.medium, borderRadius: 8, marginBottom: SPACING.medium, alignItems: 'center' },
  addressText: { fontFamily: 'monospace', color: COLORS.textSecondary },
});