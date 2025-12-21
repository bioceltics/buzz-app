import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export interface Conversation {
  id: string;
  user_id: string;
  venue_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'venue';
  content: string;
  image_url?: string;
  read_at?: string;
  created_at: string;
}

// Demo data for preview mode
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'demo-conv-1',
    user_id: 'demo-user-1',
    venue_id: 'demo-venue-id',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 300000).toISOString(),
    user: {
      id: 'demo-user-1',
      email: 'sarah@example.com',
      full_name: 'Sarah Johnson',
    },
    last_message: 'Looking forward to the happy hour deal!',
    last_message_at: new Date(Date.now() - 300000).toISOString(),
    unread_count: 2,
  },
  {
    id: 'demo-conv-2',
    user_id: 'demo-user-2',
    venue_id: 'demo-venue-id',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    user: {
      id: 'demo-user-2',
      email: 'mike@example.com',
      full_name: 'Mike Chen',
    },
    last_message: 'Thanks for the info!',
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
    unread_count: 0,
  },
  {
    id: 'demo-conv-3',
    user_id: 'demo-user-3',
    venue_id: 'demo-venue-id',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    user: {
      id: 'demo-user-3',
      email: 'emma@example.com',
      full_name: 'Emma Wilson',
    },
    last_message: 'Is the event still on for Saturday?',
    last_message_at: new Date(Date.now() - 86400000).toISOString(),
    unread_count: 1,
  },
];

const DEMO_MESSAGES: Record<string, Message[]> = {
  'demo-conv-1': [
    {
      id: 'msg-1',
      conversation_id: 'demo-conv-1',
      sender_id: 'demo-user-1',
      sender_type: 'user',
      content: 'Hi! I saw your 2-for-1 happy hour deal. Is it still available?',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg-2',
      conversation_id: 'demo-conv-1',
      sender_id: 'demo-venue-id',
      sender_type: 'venue',
      content: 'Yes, absolutely! The happy hour runs from 4-7 PM every weekday. Come on by!',
      created_at: new Date(Date.now() - 3500000).toISOString(),
      read_at: new Date(Date.now() - 3400000).toISOString(),
    },
    {
      id: 'msg-3',
      conversation_id: 'demo-conv-1',
      sender_id: 'demo-user-1',
      sender_type: 'user',
      content: 'Perfect! Can I bring a group of 6 people?',
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'msg-4',
      conversation_id: 'demo-conv-1',
      sender_id: 'demo-user-1',
      sender_type: 'user',
      content: 'Looking forward to the happy hour deal!',
      created_at: new Date(Date.now() - 300000).toISOString(),
    },
  ],
  'demo-conv-2': [
    {
      id: 'msg-5',
      conversation_id: 'demo-conv-2',
      sender_id: 'demo-user-2',
      sender_type: 'user',
      content: 'Do you have vegetarian options?',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'msg-6',
      conversation_id: 'demo-conv-2',
      sender_id: 'demo-venue-id',
      sender_type: 'venue',
      content: 'Yes! We have a great selection of vegetarian dishes. Check out our menu section for details.',
      created_at: new Date(Date.now() - 82800000).toISOString(),
      read_at: new Date(Date.now() - 82000000).toISOString(),
    },
    {
      id: 'msg-7',
      conversation_id: 'demo-conv-2',
      sender_id: 'demo-user-2',
      sender_type: 'user',
      content: 'Thanks for the info!',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      read_at: new Date(Date.now() - 7000000).toISOString(),
    },
  ],
  'demo-conv-3': [
    {
      id: 'msg-8',
      conversation_id: 'demo-conv-3',
      sender_id: 'demo-user-3',
      sender_type: 'user',
      content: 'Is the event still on for Saturday?',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};

export function useConversations() {
  const { venue, isDemoMode } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (isDemoMode) {
      setConversations(DEMO_CONVERSATIONS);
      setIsLoading(false);
      return;
    }

    if (!venue?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user:users!conversations_user_id_fkey(id, email, full_name, avatar_url),
          messages(content, created_at, sender_type, read_at)
        `)
        .eq('venue_id', venue.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process conversations to add last_message and unread_count
      const processedConversations = (data || []).map((conv: any) => {
        const messages = conv.messages || [];
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(
          (m: any) => m.sender_type === 'user' && !m.read_at
        ).length;

        return {
          ...conv,
          last_message: lastMessage?.content,
          last_message_at: lastMessage?.created_at,
          unread_count: unreadCount,
        };
      });

      setConversations(processedConversations);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [venue?.id, isDemoMode]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, isLoading, error, refetch: fetchConversations };
}

export function useMessages(conversationId: string | null) {
  const { venue, isDemoMode } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    if (isDemoMode) {
      setMessages(DEMO_MESSAGES[conversationId] || []);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      // Mark messages as read
      if (venue?.id) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .eq('sender_type', 'user')
          .is('read_at', null);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, venue?.id, isDemoMode]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!conversationId || isDemoMode || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, isDemoMode]);

  return { messages, isLoading, error, refetch: fetchMessages };
}

export function useSendMessage() {
  const { venue, isDemoMode } = useAuth();
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (conversationId: string, content: string) => {
    if (isDemoMode) {
      toast.success('Message sent! (Demo mode)');
      return true;
    }

    if (!venue?.id || !content.trim()) {
      return false;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: venue.id,
        sender_type: 'venue',
        content: content.trim(),
      });

      if (error) throw error;

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error(err.message || 'Failed to send message');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { sendMessage, isSending };
}
