import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/constants/colors';
import { useEffect, useState } from 'react';

export default function Index() {
  const { user, venue, isLoading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  // Timeout after 3 seconds to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setTimedOut(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // If timed out or not loading and no user, go to login
  if (timedOut || (!isLoading && !user)) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <Redirect href="/(tabs)" />;
}
