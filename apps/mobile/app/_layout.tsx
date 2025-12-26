import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { StyleSheet, LogBox } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimatedSplashScreen from '@/components/splash/AnimatedSplashScreen';

// Ignore known Expo SDK 52 DevLoadingView warning (development only)
LogBox.ignoreLogs([
  'View config getter callback for component `style`',
]);

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
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
      <GestureHandlerRootView style={styles.container}>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#fff' },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="venue/[id]"
              options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="deal/[id]"
              options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="scan"
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen
              name="venues/index"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
