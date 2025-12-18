import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';

interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'bar' | 'restaurant' | 'club' | 'hotel' | 'cafe';
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
  cover_image_url: string;
  images: string[];
  hours: Record<string, { open: string; close: string }>;
  amenities: string[];
  price_range: number;
  rating: number;
  review_count: number;
}

interface UseVenuesOptions {
  category?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export function useVenues(options: UseVenuesOptions = {}) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('venues')
        .select('*')
        .eq('status', 'approved')
        .order('name', { ascending: true });

      // Filter by category
      if (options.category && options.category !== 'all') {
        query = query.eq('type', options.category);
      }

      // Search filter
      if (options.search) {
        query = query.or(
          `name.ilike.%${options.search}%,description.ilike.%${options.search}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // If we have coordinates, calculate distance and filter by radius
      let processedVenues = data || [];

      if (options.latitude && options.longitude) {
        processedVenues = processedVenues
          .map((venue) => ({
            ...venue,
            distance: calculateDistance(
              options.latitude!,
              options.longitude!,
              venue.latitude,
              venue.longitude
            ),
          }))
          .filter((venue) =>
            options.radius ? venue.distance <= options.radius : true
          )
          .sort((a, b) => a.distance - b.distance);
      }

      setVenues(processedVenues);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching venues:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options.category, options.search, options.latitude, options.longitude, options.radius]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  return {
    venues,
    isLoading,
    error,
    refetch: fetchVenues,
  };
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
