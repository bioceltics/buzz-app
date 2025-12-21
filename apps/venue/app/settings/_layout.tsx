import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="hours" />
      <Stack.Screen name="media" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="billing" />
    </Stack>
  );
}
