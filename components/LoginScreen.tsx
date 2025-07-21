import { TouchableOpacity, Text, View, StyleSheet, Linking } from "react-native";
import { LoginWithOAuthInput, useLoginWithOAuth } from "@privy-io/expo";
import { useLogin } from "@privy-io/expo/ui";
import Constants from "expo-constants";
import { useState } from "react";
import * as Application from "expo-application";

export default function LoginScreen() {
  const [error, setError] = useState("");
  
  const { login } = useLogin();
  
  // OAuth for Google only
  const oauth = useLoginWithOAuth({
    onError: (err) => {
      console.log(err);
      setError(JSON.stringify(err.message));
    },
  });

  return (
    <View style={styles.container}>
      {/* Header with gradient-like background */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>💰 Solana Wallet</Text>
        <Text style={styles.subtitle}>Your Gateway to Web3</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>🚀 Welcome!</Text>
          <Text style={styles.welcomeText}>
            Create your secure Solana wallet and start your crypto journey
          </Text>
        </View>

        {/* Login Options */}
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Choose your login method</Text>
          
          {/* Email Login */}
          <TouchableOpacity
            style={styles.emailButton}
            onPress={() => {
              login({ loginMethods: ["email"] })
                .then((session) => {
                  console.log("User logged in", session.user);
                  setError("");
                })
                .catch((err) => {
                  setError(JSON.stringify(err.error) as string);
                });
            }}
          >
            <Text style={styles.emailButtonIcon}>📧</Text>
            <Text style={styles.emailButtonText}>Continue with Email</Text>
          </TouchableOpacity>

          {/* Google Login */}
          <TouchableOpacity
            style={[styles.googleButton, oauth.state.status === "loading" && styles.disabledButton]}
            disabled={oauth.state.status === "loading"}
            onPress={() => oauth.login({ provider: "google" } as LoginWithOAuthInput)}
          >
            <Text style={styles.googleButtonIcon}>🔍</Text>
            <Text style={styles.googleButtonText}>
              {oauth.state.status === "loading" ? "Authenticating..." : "Continue with Google"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>✨ What you can do:</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔐</Text>
              <Text style={styles.featureText}>Secure wallet creation</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💸</Text>
              <Text style={styles.featureText}>Send & receive SOL</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Track transactions</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌐</Text>
              <Text style={styles.featureText}>Multi-network support</Text>
            </View>
          </View>
        </View>

        {/* Configuration Info */}
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>📱 App Configuration</Text>
          <Text style={styles.configText}>
            App ID: {Application.applicationId}
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `https://dashboard.privy.io/apps/${Constants.expoConfig?.extra?.privyAppId}/settings?setting=clients`
              )
            }
          >
            <Text style={styles.configLink}>🔧 Configure Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Loading State */}
        {oauth.state.status === "loading" && (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>🔄 Authenticating with Google...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
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
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  emailButton: {
    backgroundColor: '#4299e1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  emailButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  googleButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a0aec0',
  },
  featuresCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#4a5568',
    flex: 1,
  },
  configCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  configText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  configLink: {
    fontSize: 14,
    color: '#4299e1',
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#fed7d7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  errorText: {
    color: '#c53030',
    fontSize: 14,
    flex: 1,
  },
  loadingCard: {
    backgroundColor: '#bee3f8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#2b6cb0',
    fontSize: 16,
    fontWeight: '600',
  },
});