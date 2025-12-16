import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  venue: any | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
    venue: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));

      if (session?.user) {
        fetchUserData(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));

      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setState((prev) => ({
          ...prev,
          isAdmin: false,
          venue: null,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      const isAdmin = userData?.role === 'admin';

      // Fetch venue if user owns one
      const { data: venueData } = await supabase
        .from('venues')
        .select('*')
        .eq('owner_id', userId)
        .single();

      setState((prev) => ({
        ...prev,
        isAdmin,
        venue: venueData,
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUserData: () =>
      state.user ? fetchUserData(state.user.id) : Promise.resolve(),
  };
}
