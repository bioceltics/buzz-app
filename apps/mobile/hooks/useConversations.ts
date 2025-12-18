import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  id: string;
  user_id: string;
  venue_id: string;
  last_message_at: string;
  user_unread_count: number;
  venue_unread_count: number;
  created_at: string;
  last_message?: string;
  venue: {
    id: string;
    name: string;
    logo_url: string;
  };
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          venue:venues(id, name, logo_url)
        `)
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (fetchError) throw fetchError;

      setConversations(data || []);
    } catch (err: any) {
      // Silently handle error for demo - just set empty conversations
      console.error('Error fetching conversations:', err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();

    // Subscribe to realtime updates
    if (user) {
      const subscription = supabase
        .channel('conversations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [fetchConversations, user]);

  const getOrCreateConversation = async (venueId: string) => {
    if (!user) return null;

    try {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('venue_id', venueId)
        .single();

      if (existing) return existing;

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          venue_id: venueId,
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchConversations();
      return newConversation;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('conversations')
        .update({ user_unread_count: 0 })
        .eq('id', conversationId);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, user_unread_count: 0 } : c
        )
      );
    } catch (err: any) {
      console.error('Error marking conversation as read:', err);
    }
  };

  return {
    conversations,
    isLoading,
    error,
    getOrCreateConversation,
    markAsRead,
    refetch: fetchConversations,
  };
}
