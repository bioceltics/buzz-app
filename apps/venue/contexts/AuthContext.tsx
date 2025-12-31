import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

// Helper function to add timeout to promises
const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), ms)
    ),
  ]);
};

interface Venue {
  id: string;
  name: string;
  type: string;
  address: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  venue: Venue | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, venueName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshVenue: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVenue = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('venues')
        .select('id, name, type, address, logo_url, cover_image_url')
        .eq('owner_id', userId)
        .maybeSingle();
      setVenue(data);
    } catch (error) {
      console.error('Error fetching venue:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log('Auth session check timed out, proceeding without session');
        setIsLoading(false);
      }
    }, 5000);

    // Get initial session with error handling
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchVenue(session.user.id);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchVenue(session.user.id);
          } else {
            setVenue(null);
          }
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        10000,
        'Login timed out. Please check your internet connection and try again.'
      );
      if (result.error) throw result.error;
    } catch (error: any) {
      console.error('SignIn error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, venueName: string, venueType: string = 'bar') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'venue_owner',
          venue_name: venueName,
        },
      },
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('Failed to create account. Please try again.');
    }

    // CREATE VENUE RECORD after successful signup
    const slug = venueName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    const { error: venueError } = await supabase
      .from('venues')
      .insert({
        owner_id: data.user.id,
        name: venueName,
        slug: slug,
        type: venueType as any,
        address: 'TBD',
        city: 'TBD',
        province: 'TBD',
        postal_code: 'TBD',
        location: `POINT(0 0)`,
      });

    if (venueError) {
      console.error('Error creating venue:', venueError);
    } else {
      // Fetch the newly created venue to populate context
      await fetchVenue(data.user.id);
    }
  };

  const signOut = async () => {
    // Clear local state FIRST, before calling Supabase
    // This ensures user is signed out locally even if server call fails
    setUser(null);
    setVenue(null);
    setSession(null);

    // Then try to sign out from Supabase (don't throw on error)
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase signOut error:', error);
      // Don't throw - user is already signed out locally
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: Platform.OS === 'web'
          ? window.location.origin
          : 'buzzee-venue://auth/callback',
      },
    });
    if (error) throw error;
  };

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: Platform.OS === 'web'
          ? window.location.origin
          : 'buzzee-venue://auth/callback',
      },
    });
    if (error) throw error;
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: Platform.OS === 'web'
          ? window.location.origin
          : 'buzzee-venue://auth/callback',
      },
    });
    if (error) throw error;
  };

  const refreshVenue = async () => {
    if (user) {
      await fetchVenue(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        venue,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshVenue,
        signInWithGoogle,
        signInWithFacebook,
        signInWithApple,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
