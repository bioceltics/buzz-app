import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { router } from 'expo-router';

interface AuthContextType {
  user: any | null;
  session: Session | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to fetch user profile from users table
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('fetchUserProfile error:', error);
      return null;
    }
    return data;
  };

  // Function to refresh user data from database
  const refreshUser = async () => {
    const userId = user?.id || session?.user?.id;
    if (!userId) {
      console.log('refreshUser: No user ID available');
      return;
    }

    const userData = await fetchUserProfile(userId);
    if (userData) {
      setUser(userData);
    } else {
      console.log('refreshUser: fetchUserProfile returned null');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initialize auth - await getSession before setting up listener
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          console.warn('Auth init error:', error.message);
        }

        setSession(session);

        // Fetch user profile from users table
        if (session?.user?.id) {
          let userData = await fetchUserProfile(session.user.id);

          // If no user record exists, create one
          if (!userData && session.user) {
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || '',
              }, { onConflict: 'id' })
              .select()
              .single();

            if (!createError && newUser) {
              userData = newUser;
            } else if (createError) {
              console.error('Error creating user record:', createError);
            }
          }

          if (mounted) {
            setUser(userData || session.user);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Auth init failed:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Start initialization
    initAuth();

    // Listen for auth changes AFTER initial load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);

        // Fetch user profile from users table
        if (newSession?.user?.id) {
          let userData = await fetchUserProfile(newSession.user.id);

          // If no user record exists, create one
          if (!userData && newSession.user) {
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .upsert({
                id: newSession.user.id,
                email: newSession.user.email,
                full_name: newSession.user.user_metadata?.full_name || '',
              }, { onConflict: 'id' })
              .select()
              .single();

            if (!createError && newUser) {
              userData = newUser;
            } else if (createError) {
              console.error('Error creating user record:', createError);
            }
          }

          if (mounted) {
            setUser(userData || newSession.user);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;

      // Create user record in public.users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
          }, { onConflict: 'id' });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPhone = async (phone: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw error;
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        refreshUser,
        signUp,
        signIn,
        signInWithPhone,
        verifyOtp,
        signInWithGoogle,
        signInWithApple,
        signInWithFacebook,
        signOut,
        resetPassword,
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
