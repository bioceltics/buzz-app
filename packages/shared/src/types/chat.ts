export interface Conversation {
  id: string;
  user_id: string;
  venue_id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithDetails extends Conversation {
  venue?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  last_message?: Message;
  unread_count: number;
}

export type SenderType = 'user' | 'venue';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: SenderType;
  content: string;
  image_url?: string;
  read_at?: string;
  created_at: string;
}
