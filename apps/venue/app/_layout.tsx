import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { COLORS } from '@/constants/colors';
import AnimatedSplashScreen from '@/components/splash/AnimatedSplashScreen';

// Use View instead of GestureHandlerRootView on web
let GestureHandlerRootView: any;
if (Platform.OS !== 'web') {
  try {
    GestureHandlerRootView = require('react-native-gesture-handler').GestureHandlerRootView;
  } catch {
    GestureHandlerRootView = View;
  }
} else {
  GestureHandlerRootView = View;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Immediately hide native splash to show our animated one
    const prepare = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Ignore errors
      }
      // Mark app as ready after a small delay for resources to load
      setTimeout(() => setAppReady(true), 100);
    };
    prepare();
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return (
      <AnimatedSplashScreen
        onAnimationComplete={handleSplashComplete}
        isReady={appReady}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="create-deal" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="edit-deal" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="create-event" options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
          </GestureHandlerRootView>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
