import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationPreferences {
  pushNotifications: boolean;
  emailNotifications: boolean;
  newDeals: boolean;
  favoriteVenues: boolean;
  messageReplies: boolean;
  weeklyDigest: boolean;
  onlyFollowedVenues: boolean;
  followedVenueIds: string[];
}

export interface FollowedVenue {
  id: string;
  name: string;
  logo_url: string | null;
  type: string;
  notificationsEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushNotifications: true,
  emailNotifications: true,
  newDeals: true,
  favoriteVenues: true,
  messageReplies: true,
  weeklyDigest: false,
  onlyFollowedVenues: false,
  followedVenueIds: [],
};

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(type === 'success' ? 'Success' : 'Error', message);
  }
};

export function useSettings() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [followedVenues, setFollowedVenues] = useState<FollowedVenue[]>([]);

  // Load preferences on mount
  useEffect(() => {
    if (user) {
      const userPrefs = (user as any).notification_preferences;
      if (userPrefs) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...userPrefs,
        });
      }
      loadFollowedVenues();
    }
  }, [user]);

  const loadFollowedVenues = async () => {
    if (!user?.id) return;

    try {
      // Get user's favorites
      const { data: favorites, error } = await supabase
        .from('user_favorites')
        .select(`
          venue_id,
          venues (
            id,
            name,
            logo_url,
            type
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const venues: FollowedVenue[] = (favorites || []).map((fav: any) => ({
        id: fav.venues.id,
        name: fav.venues.name,
        logo_url: fav.venues.logo_url,
        type: fav.venues.type,
        notificationsEnabled: preferences.followedVenueIds.includes(fav.venues.id),
      }));

      setFollowedVenues(venues);
    } catch (error) {
      console.error('Error loading followed venues:', error);
    }
  };

  const updateNotificationPreferences = async (
    newPreferences: Partial<NotificationPreferences>
  ): Promise<boolean> => {
    if (!user?.id) {
      showToast('Please sign in to update preferences', 'error');
      return false;
    }

    const updatedPreferences = {
      ...preferences,
      ...newPreferences,
    };

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          notification_preferences: updatedPreferences,
        })
        .eq('id', user.id);

      if (error) throw error;

      setPreferences(updatedPreferences);
      showToast('Preferences updated!');
      return true;
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      showToast(error.message || 'Failed to update preferences', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVenueNotifications = async (venueId: string): Promise<boolean> => {
    const currentIds = preferences.followedVenueIds || [];
    const isEnabled = currentIds.includes(venueId);

    const newFollowedVenueIds = isEnabled
      ? currentIds.filter((id) => id !== venueId)
      : [...currentIds, venueId];

    const success = await updateNotificationPreferences({
      followedVenueIds: newFollowedVenueIds,
    });

    if (success) {
      setFollowedVenues((prev) =>
        prev.map((v) =>
          v.id === venueId ? { ...v, notificationsEnabled: !isEnabled } : v
        )
      );
    }

    return success;
  };

  const searchVenues = async (query: string): Promise<FollowedVenue[]> => {
    if (!query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, logo_url, type')
        .ilike('name', `%${query}%`)
        .eq('status', 'active')
        .limit(10);

      if (error) throw error;

      return (data || []).map((venue) => ({
        ...venue,
        notificationsEnabled: preferences.followedVenueIds.includes(venue.id),
      }));
    } catch (error) {
      console.error('Error searching venues:', error);
      return [];
    }
  };

  const updateProfile = async (data: {
    full_name?: string;
    phone?: string;
  }): Promise<boolean> => {
    if (!user?.id) {
      showToast('Please sign in to update profile', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      if (refreshUser) {
        await refreshUser();
      }
      showToast('Profile updated!');
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    preferences,
    followedVenues,
    updateNotificationPreferences,
    toggleVenueNotifications,
    searchVenues,
    updateProfile,
    refreshFollowedVenues: loadFollowedVenues,
  };
}
