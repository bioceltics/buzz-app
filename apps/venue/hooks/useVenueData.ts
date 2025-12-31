import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

type TableName = 'deals' | 'events' | 'venues' | 'redemptions' | 'analytics';

interface UseVenueQueryOptions<T> {
  table: TableName;
  queryKey: string[];
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, unknown>;
  enabled?: boolean;
}

interface UseVenueMutationOptions<T> {
  table: TableName;
  invalidateKeys?: string[][];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for venue data queries using Supabase
 * Centralizes the query pattern with automatic venue filtering
 */
export function useVenueQuery<T>({
  table,
  queryKey,
  select = '*',
  orderBy,
  filters = {},
  enabled = true,
}: UseVenueQueryOptions<T>) {
  const { venue } = useAuth();

  return useQuery({
    queryKey: [...queryKey, venue?.id],
    queryFn: async () => {
      if (!venue) return [];

      let query = supabase
        .from(table)
        .select(select)
        .eq('venue_id', venue.id);

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as T[];
    },
    enabled: enabled && !!venue,
  });
}

/**
 * Custom hook for creating venue data mutations
 */
export function useVenueMutation<T extends Record<string, unknown>>({
  table,
  invalidateKeys = [],
  onSuccess,
  onError,
}: UseVenueMutationOptions<T>) {
  const queryClient = useQueryClient();
  const { venue } = useAuth();

  const createMutation = useMutation({
    mutationFn: async (data: Omit<T, 'id' | 'venue_id'>) => {
      if (!venue) throw new Error('No venue');
      const { data: result, error } = await supabase
        .from(table)
        .insert({ ...data, venue_id: venue.id })
        .select()
        .single();
      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<T> & { id: string }) => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from(table)
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleActiveMutation,
  };
}

export { useVenueQuery as useVenueData };
