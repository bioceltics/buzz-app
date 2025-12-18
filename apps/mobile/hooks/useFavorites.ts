import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Favorite {
  id: string;
  user_id: string;
  venue_id: string;
  created_at: string;
  venue: {
    id: string;
    name: string;
    type: string;
    logo_url: string;
    cover_image_url: string;
    address: string;
    rating: number;
  };
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select(`
          *,
          venue:venues(id, name, type, logo_url, cover_image_url, address)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setFavorites(data || []);
    } catch (err: any) {
      // Silently handle error for demo - just set empty favorites
      console.error('Error fetching favorites:', err);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (venueId: string) => {
    if (!user) return;

    try {
      const { error: insertError } = await supabase.from('favorites').insert({
        user_id: user.id,
        venue_id: venueId,
      });

      if (insertError) throw insertError;

      await fetchFavorites();
    } catch (err: any) {
      console.error('Error adding favorite:', err);
      throw err;
    }
  };

  const removeFavorite = async (venueId: string) => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('venue_id', venueId);

      if (deleteError) throw deleteError;

      setFavorites((prev) => prev.filter((f) => f.venue_id !== venueId));
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      throw err;
    }
  };

  const isFavorite = (venueId: string) => {
    return favorites.some((f) => f.venue_id === venueId);
  };

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
}
