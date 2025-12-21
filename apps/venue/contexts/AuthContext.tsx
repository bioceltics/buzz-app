import React, { createContext, useContext, useEffect, useState } from 'react';
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
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  venue: Venue | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, venueName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshVenue: () => Promise<void>;
  enterDemoMode: () => void;
}

// Demo data for preview mode
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@buzzee.com',
  app_metadata: {},
  user_metadata: { role: 'venue_owner' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

const DEMO_VENUE: Venue = {
  id: 'demo-venue-id',
  name: 'Demo Lounge & Bar',
  type: 'bar',
  address: '123 Demo Street, San Francisco, CA',
  logo_url: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const enterDemoMode = () => {
    console.log('Entering demo mode');
    setUser(DEMO_USER);
    setVenue(DEMO_VENUE);
    setIsDemoMode(true);
    setIsLoading(false);
  };

  const fetchVenue = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('venues')
        .select('id, name, type, address, logo_url')
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

  const signUp = async (email: string, password: string, venueName: string) => {
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
  };

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null);
      setVenue(null);
      setIsDemoMode(false);
      return;
    }
    const { error } = await supabase.auth.signOut();
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
        isDemoMode,
        signIn,
        signUp,
        signOut,
        refreshVenue,
        enterDemoMode,
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
