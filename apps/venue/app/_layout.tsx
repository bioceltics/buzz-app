import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { COLORS } from '@/constants/colors';

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

export default function RootLayout() {
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
