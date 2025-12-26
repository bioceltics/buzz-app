// URL polyfill is imported in index.js - don't duplicate here
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

// Check if we're in a browser environment (not SSR)
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// Custom storage adapter for Expo - use AsyncStorage on native for simplicity
// SecureStore has issues in simulator, so we use AsyncStorage as primary storage
const ExpoStorageAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (!isBrowser) return null;
      return window.localStorage.getItem(key);
    }
    // Use AsyncStorage for native platforms (more reliable in simulator)
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (!isBrowser) return;
      window.localStorage.setItem(key, value);
      return;
    }
    // Use AsyncStorage for native platforms
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (!isBrowser) return;
      window.localStorage.removeItem(key);
      return;
    }
    // Use AsyncStorage for native platforms
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
