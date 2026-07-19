import '../global.css';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Provider } from 'react-redux';
import { store } from './_store/store';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';

import { colors } from '@/constants/theme';
import { AlertHost } from '@/components/ui/AlertHost';
import { SyncStatusBanner } from '@/components/SyncStatusBanner';
import { PowerSyncProvider } from './_powersync/PowerSyncProvider';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

const PUBLIC_AUTH_ROUTES = ['sign-in', 'sign-up', 'verify-2fa'];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isPublicAuthRoute = inAuthGroup && PUBLIC_AUTH_ROUTES.includes(segments[1] ?? '');

    if (!isSignedIn && !isPublicAuthRoute) {
      router.replace('/sign-in');
    } else if (isSignedIn && isPublicAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, segments, router]);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PowerSyncProvider>
        <Provider store={store}>
          <SafeAreaProvider>
            <SyncStatusBanner />
            <AuthGate>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="chat" options={{ headerShown: false }} />
                <Stack.Screen name="chatHistory" options={{ headerShown: false }} />
                <Stack.Screen name="addRecipes" options={{ headerShown: false }} />
                <Stack.Screen name="history" options={{ headerShown: false }} />
              </Stack>
            </AuthGate>
            <AlertHost />
          </SafeAreaProvider>
        </Provider>
      </PowerSyncProvider>
    </ClerkProvider>
  );
}
