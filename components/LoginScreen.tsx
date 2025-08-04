// components/LoginScreen.tsx
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { useLogin } from "@privy-io/expo/ui";
import { useState } from "react";
import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";

export default function LoginScreen() {
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useLogin();
  
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const handleLogin = () => {
    setIsLoggingIn(true);
    login({ loginMethods: ["email"] })
      .then(() => {
        setError("");
      })
      .catch((err) => {
        setError(err.message || "An unknown error occurred.");
      })
      .finally(() => {
        setIsLoggingIn(false);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Betzy</Text>
        
        {/* The subtitle has been removed as requested */}

        <TouchableOpacity
          style={[styles.button, isLoggingIn && styles.disabledButton]}
          disabled={isLoggingIn}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isLoggingIn ? "Authenticating..." : "Continue with Email"}
          </Text>
        </TouchableOpacity>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxlarge + 10,
    fontWeight: 'bold',
    color: COLORS.primaryLight,
    marginBottom: SPACING.large * 2, // Increased margin to compensate for subtitle removal
    fontFamily: 'Inter_600SemiBold',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    fontFamily: 'Inter_500Medium',
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  errorCard: {
    marginTop: SPACING.large,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: SPACING.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
    width: '100%',
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
});