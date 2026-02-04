import "../global.css";
import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { SafeAreaProvider } from "react-native-safe-area-context";
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { StatusBar } from "react-native";


export default function Layout() {
  return (
    <SafeAreaProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <StatusBar barStyle="dark-content" />
        <Slot />
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
