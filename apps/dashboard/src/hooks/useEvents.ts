import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export interface Event {
  id: string;
  venue_id: string;
  title: string;
  description: string;
  type: string;
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

// Demo events for preview mode
const DEMO_EVENTS: Event[] = [
  {
    id: 'demo-event-1',
    venue_id: 'demo-venue-id',
    title: 'Live Jazz Friday',
    description: 'Join us for an evening of smooth jazz with the Downtown Quartet. Great drinks, amazing music, unforgettable night.',
    type: 'live_music',
    start_time: new Date(Date.now() + 86400000 * 2).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 2 + 14400000).toISOString(),
    is_active: true,
    is_free: false,
    cover_charge: 15,
    age_restriction: 21,
    rsvp_count: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-event-2',
    venue_id: 'demo-venue-id',
    title: 'Trivia Tuesday',
    description: 'Test your knowledge and win prizes! Teams of up to 6 players. First place wins a $100 bar tab!',
    type: 'trivia',
    start_time: new Date(Date.now() + 86400000 * 4).toISOString(),
    is_active: true,
    is_free: true,
    rsvp_count: 28,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-event-3',
    venue_id: 'demo-venue-id',
    title: 'DJ Night: Summer Vibes',
    description: 'Dance the night away with DJ Marcus spinning the hottest tracks. Bottle service available.',
    type: 'dj',
    start_time: new Date(Date.now() + 86400000 * 7).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 7 + 18000000).toISOString(),
    is_active: true,
    is_free: false,
    cover_charge: 20,
    age_restriction: 21,
    dress_code: 'Smart Casual',
    capacity: 150,
    rsvp_count: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useEvents() {
  const { venue, isDemoMode } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    // Demo mode - return sample events
    if (isDemoMode) {
      setEvents(DEMO_EVENTS);
      setIsLoading(false);
      return;
    }

    if (!venue?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const session = await supabase.auth.getSession();

      if (!session.data.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events?venue_id=${venue.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [venue?.id, isDemoMode]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
}

export function useDeleteEvent() {
  const { isDemoMode } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteEvent = async (eventId: string) => {
    if (isDemoMode) {
      toast.success('Event deleted! (Demo mode)');
      return true;
    }

    setIsDeleting(true);
    try {
      const session = await supabase.auth.getSession();

      if (!session.data.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      toast.success('Event deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting event:', err);
      toast.error(err.message || 'Failed to delete event');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteEvent, isDeleting };
}
