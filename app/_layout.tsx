import '../global.css';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
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
import { useIsOnline } from './_hooks/useIsOnline';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

const PUBLIC_AUTH_ROUTES = ['sign-in', 'sign-up', 'verify-2fa'];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const isOnline = useIsOnline();

  // Clerk can load its locally cached token instantly (isLoaded: true) even
  // offline, but it needs a network round-trip to *confirm* that cached
  // session is still valid — until then isSignedIn reads false, even for a
  // device that really is signed in. Redirecting to sign-in on that
  // unconfirmed signal is wrong twice over: it dumps the user on a login
  // form they can't use offline anyway, and once connectivity returns,
  // Clerk reconciles the real session and throws a "session already exists"
  // error on that same screen. So: while offline and not yet confirmed
  // signed in, just wait — don't treat "unconfirmed" as "signed out".
  const authUnresolved = !isOnline && !isSignedIn;

  useEffect(() => {
    if (!isLoaded || authUnresolved) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isPublicAuthRoute = inAuthGroup && PUBLIC_AUTH_ROUTES.includes(segments[1] ?? '');

    if (!isSignedIn && !isPublicAuthRoute) {
      router.replace('/sign-in');
    } else if (isSignedIn && isPublicAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, authUnresolved, segments, router]);

  if (!isLoaded || authUnresolved) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-neutral">
        <ActivityIndicator size="large" color={colors.primary} />
        {authUnresolved ? (
          <Text className="font-urbanist text-sm text-muted">
            Waiting for a connection to sign you in…
          </Text>
        ) : null}
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
