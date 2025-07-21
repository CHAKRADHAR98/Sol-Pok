import React, { useState, useCallback, useEffect } from "react";
import { Text, TextInput, View, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import { 
  Connection, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  Transaction,
  SystemProgram
} from "@solana/web3.js";
import * as Clipboard from 'expo-clipboard';

import {
  usePrivy,
  useEmbeddedSolanaWallet,
  getUserEmbeddedSolanaWallet,
  useLinkWithOAuth,
} from "@privy-io/expo";
import Constants from "expo-constants";
import { PrivyUser } from "@privy-io/public-api";

// Helper function to get main identifier from linked accounts
const toMainIdentifier = (x: PrivyUser["linked_accounts"][number]) => {
  if (x.type === "phone") {
    return x.phoneNumber;
  }
  if (x.type === "email" || x.type === "wallet") {
    return x.address;
  }
  if (x.type === "twitter_oauth" || x.type === "tiktok_oauth") {
    return x.username;
  }
  if (x.type === "custom_auth") {
    return x.custom_user_id;
  }
  return x.type;
};

// Solana network configuration
const SOLANA_NETWORKS = {
  mainnet: "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  testnet: "https://api.testnet.solana.com",
};

export const SolanaUserScreen = () => {
  // State for managing network, transactions, and UI
  const [currentNetwork, setCurrentNetwork] = useState<keyof typeof SOLANA_NETWORKS>("devnet");
  const [signedMessages, setSignedMessages] = useState<string[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<string[]>([]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [solAmount, setSolAmount] = useState("0.001");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Privy hooks for authentication and wallet management
  const { logout, user } = usePrivy();
  const oauth = useLinkWithOAuth();
  const { wallets, create } = useEmbeddedSolanaWallet();
  
  // Get the user's Solana wallet
  const account = getUserEmbeddedSolanaWallet(user);

  // Copy wallet address to clipboard
  const copyWalletAddress = useCallback(async () => {
    if (!account?.address) return;
    
    try {
      await Clipboard.setStringAsync(account.address);
      Alert.alert("🎉 Copied!", "Wallet address copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("❌ Error", "Failed to copy address");
    }
  }, [account?.address]);

  // Get wallet balance
  const getBalance = useCallback(async () => {
    if (!account?.address) return;
    
    try {
      const connection = new Connection(SOLANA_NETWORKS[currentNetwork], "confirmed");
      const publicKey = new PublicKey(account.address);
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      Alert.alert("❌ Error", "Failed to fetch wallet balance");
    }
  }, [account?.address, currentNetwork]);

  // Request airdrop for testing
  const requestAirdrop = useCallback(async () => {
    if (!account?.address || currentNetwork === "mainnet") {
      Alert.alert("ℹ️ Info", "Airdrop only available on devnet/testnet");
      return;
    }
    
    setLoading(true);
    try {
      const connection = new Connection(SOLANA_NETWORKS[currentNetwork], "confirmed");
      const publicKey = new PublicKey(account.address);
      
      const signature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature);
      
      Alert.alert("🪂 Success!", "1 SOL airdropped to your wallet!");
      
      setTimeout(async () => {
        await getBalance();
      }, 2000);
      
    } catch (error) {
      console.error("Error requesting airdrop:", error);
      Alert.alert("❌ Error", "Failed to request airdrop. Try again later.");
    } finally {
      setLoading(false);
    }
  }, [account?.address, currentNetwork, getBalance]);

  // Sign a message
  const signMessage = useCallback(async () => {
    if (!wallets || wallets.length === 0 || !account?.address) {
      Alert.alert("❌ Error", "No wallet found. Please create a wallet first.");
      return;
    }
    
    setLoading(true);
    try {
      const provider = await wallets[0].getProvider();
      const message = `Hello Solana! Signed at ${new Date().toISOString()}`;
      
      const result = await provider.request({
        method: "signMessage",
        params: { message },
      });
      
      if (result.signature) {
        const newSignedMessage = `${message} | ${result.signature.slice(0, 20)}...`;
        setSignedMessages((prev) => [newSignedMessage, ...prev]);
        Alert.alert("✅ Success!", "Message signed successfully!");
      }
    } catch (error) {
      console.error("Error signing message:", error);
      Alert.alert("❌ Error", "Failed to sign message.");
    } finally {
      setLoading(false);
    }
  }, [wallets, account?.address]);

  // Validate Solana address
  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  // Send SOL transaction
  const sendSolTransaction = useCallback(async () => {
    if (!wallets || wallets.length === 0 || !account?.address || !recipientAddress || !solAmount) {
      Alert.alert("❌ Error", "Please fill all fields and ensure wallet is created");
      return;
    }

    if (!isValidSolanaAddress(recipientAddress)) {
      Alert.alert("❌ Error", "Invalid recipient address format");
      return;
    }

    if (parseFloat(solAmount) <= 0) {
      Alert.alert("❌ Error", "Amount must be greater than 0");
      return;
    }
    
    setLoading(true);
    try {
      const provider = await wallets[0].getProvider();
      const connection = new Connection(SOLANA_NETWORKS[currentNetwork], "confirmed");
      
      const fromPubkey = new PublicKey(account.address);
      const toPubkey = new PublicKey(recipientAddress);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubkey,
          toPubkey: toPubkey,
          lamports: Math.floor(parseFloat(solAmount) * LAMPORTS_PER_SOL),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const result = await provider.request({
        method: "signAndSendTransaction",
        params: {
          transaction: transaction,
          connection: connection
        },
      });
      
      if (result && result.signature) {
        const newTransaction = `Sent ${solAmount} SOL to ${recipientAddress.slice(0, 8)}... | ${result.signature.slice(0, 20)}...`;
        setTransactionHistory((prev) => [newTransaction, ...prev]);
        
        setRecipientAddress("");
        setSolAmount("0.001");
        
        setTimeout(async () => {
          await getBalance();
        }, 3000);
        
        Alert.alert(
          "🚀 Transaction Sent!", 
          `Successfully sent ${solAmount} SOL\n\nSignature: ${result.signature.slice(0, 20)}...`
        );
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      
      let errorMessage = "Failed to send transaction";
      if (error instanceof Error) {
        if (error.message.includes("insufficient")) {
          errorMessage = "💸 Insufficient balance for transaction";
        } else if (error.message.includes("blockhash")) {
          errorMessage = "🌐 Network error. Please try again";
        } else {
          errorMessage = `❌ Transaction failed: ${error.message}`;
        }
      }
      
      Alert.alert("Transaction Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [wallets, account?.address, recipientAddress, solAmount, currentNetwork, getBalance]);

  // Switch networks
  const switchNetwork = useCallback(async (network: keyof typeof SOLANA_NETWORKS) => {
    setCurrentNetwork(network);
    setWalletBalance(null);
    
    if (account?.address) {
      setTimeout(() => {
        getBalance();
      }, 1000);
    }
  }, [account?.address, getBalance]);

  // Create wallet
  const createWallet = useCallback(async () => {
    if (!create) {
      Alert.alert("❌ Error", "Wallet creation not available");
      return;
    }
    
    setLoading(true);
    try {
      await create();
      setTimeout(() => {
        getBalance();
      }, 2000);
    } catch (error) {
      console.error("Error creating wallet:", error);
      Alert.alert("❌ Error", "Failed to create wallet");
    } finally {
      setLoading(false);
    }
  }, [create, getBalance]);

  // Auto-fetch balance
  useEffect(() => {
    if (account?.address) {
      getBalance();
    }
  }, [account?.address, currentNetwork, getBalance]);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header with gradient background */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Solana Wallet</Text>
        <View style={styles.networkBadge}>
          <Text style={styles.networkText}>🌐 {currentNetwork.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>
            {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : "Loading..."}
          </Text>
          {account?.address && (
            <TouchableOpacity style={styles.refreshButton} onPress={getBalance}>
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Wallet Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔐 Wallet Management</Text>
          {account?.address ? (
            <View>
              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={2}>
                  {account.address}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.primaryButton} onPress={copyWalletAddress}>
                <Text style={styles.primaryButtonText}>📋 Copy Address</Text>
              </TouchableOpacity>

              {currentNetwork !== "mainnet" && (
                <TouchableOpacity 
                  style={[styles.secondaryButton, loading && styles.disabledButton]} 
                  onPress={requestAirdrop}
                  disabled={loading}
                >
                  <Text style={styles.secondaryButtonText}>
                    {loading ? "🕒 Getting SOL..." : "🪂 Get Test SOL"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={createWallet}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "🕒 Creating..." : "✨ Create Wallet"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Network Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐 Network Selection</Text>
          <View style={styles.networkButtons}>
            {Object.keys(SOLANA_NETWORKS).map((network) => (
              <TouchableOpacity
                key={network}
                style={[
                  styles.networkButton,
                  currentNetwork === network && styles.activeNetworkButton
                ]}
                onPress={() => switchNetwork(network as keyof typeof SOLANA_NETWORKS)}
                disabled={currentNetwork === network}
              >
                <Text style={[
                  styles.networkButtonText,
                  currentNetwork === network && styles.activeNetworkButtonText
                ]}>
                  {network} {currentNetwork === network ? "✓" : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Send SOL Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💸 Send SOL</Text>
          <TextInput
            value={recipientAddress}
            onChangeText={setRecipientAddress}
            placeholder="Recipient address (e.g., 9WzDXw...)"
            style={styles.textInput}
            placeholderTextColor="#999"
          />
          <TextInput
            value={solAmount}
            onChangeText={setSolAmount}
            placeholder="Amount in SOL"
            keyboardType="numeric"
            style={styles.textInput}
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!recipientAddress || !account?.address || loading) && styles.disabledButton
            ]}
            onPress={sendSolTransaction}
            disabled={!recipientAddress || !account?.address || loading}
          >
            <Text style={styles.sendButtonText}>
              {loading ? "🕒 Sending..." : "🚀 Send SOL"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        {transactionHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📜 Recent Transactions</Text>
            {transactionHistory.slice(0, 5).map((tx, index) => (
              <View key={index} style={styles.transactionItem}>
                <Text style={styles.transactionText} numberOfLines={2}>
                  {tx}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  networkBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  networkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#4a5568',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  addressContainer: {
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addressText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#4a5568',
  },
  primaryButton: {
    backgroundColor: '#4299e1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#38b2ac',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  networkButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  networkButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  activeNetworkButton: {
    backgroundColor: '#4299e1',
  },
  networkButtonText: {
    color: '#4a5568',
    fontWeight: '600',
  },
  activeNetworkButtonText: {
    color: 'white',
  },
  textInput: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#48bb78',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a0aec0',
  },
  transactionItem: {
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#4a5568',
  },
  logoutButton: {
    backgroundColor: '#e53e3e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});