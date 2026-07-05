import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Stack } from 'expo-router';
import { goBack } from 'expo-router/build/global-state/router';
import { clerkClient } from '@clerk/nextjs/server';
import { navigateDeprecated } from 'expo-router/build/react-navigation/routers/CommonActions';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

export default function Layout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Provider store={store}>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
      </Provider>
    </ClerkProvider>
  );
}


