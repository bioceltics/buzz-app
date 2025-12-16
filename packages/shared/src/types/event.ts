export type EventType = 'live_music' | 'dj' | 'comedy' | 'trivia' | 'sports' | 'themed' | 'special' | 'other';

export interface Event {
  id: string;
  venue_id: string;
  title: string;
  description: string;
  type: EventType;
  image_url?: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
  cover_charge?: number;
  is_free: boolean;
  age_restriction?: number;
  dress_code?: string;
  capacity?: number;
  rsvp_count: number;
  created_at: string;
  updated_at: string;
}

export interface EventWithVenue extends Event {
  venue: {
    id: string;
    name: string;
    type: string;
    logo_url?: string;
    address: string;
  };
}

export interface EventRSVP {
  id: string;
  user_id: string;
  event_id: string;
  status: 'going' | 'interested' | 'not_going';
  created_at: string;
}
