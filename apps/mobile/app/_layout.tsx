import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#fff' },
          }}
        >
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
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
