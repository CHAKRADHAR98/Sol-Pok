import { SafeAreaView, Text, View } from "react-native";
import Constants from "expo-constants";
import LoginScreen from "@/components/LoginScreen";
import { usePrivy } from "@privy-io/expo";
import { SolanaUserScreen } from "@/components/SolanaUserScreen";

export default function Index() {
  const { user } = usePrivy();
  
  // Validate Privy App ID
  if ((Constants.expoConfig?.extra?.privyAppId as string).length !== 25) {
    return (
      <SafeAreaView>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>You have not set a valid `privyAppId` in app.json</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Validate Privy Client ID
  if (
    !(Constants.expoConfig?.extra?.privyClientId as string).startsWith(
      "client-"
    )
  ) {
    return (
      <SafeAreaView>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>You have not set a valid `privyClientId` in app.json</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Route to LoginScreen or SolanaUserScreen based on authentication
  return !user ? <LoginScreen /> : <SolanaUserScreen />;
}