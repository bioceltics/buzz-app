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
          venue:venues(id, name, logo_url),
          messages(content, created_at, sender_type, read_at)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Process conversations to derive last_message and unread_count from messages
      const processedConversations = (data || []).map((conv: any) => {
        const messages = conv.messages || [];
        const sortedMessages = [...messages].sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const lastMessage = sortedMessages[0];
        const unreadCount = messages.filter(
          (m: any) => m.sender_type === 'venue' && !m.read_at
        ).length;

        return {
          ...conv,
          last_message: lastMessage?.content,
          last_message_at: lastMessage?.created_at || conv.updated_at,
          user_unread_count: unreadCount,
        };
      });

      setConversations(processedConversations);
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
      // Mark all venue messages as read in the messages table
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'venue')
        .is('read_at', null);

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
