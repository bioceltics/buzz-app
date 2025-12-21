import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface VenueProfile {
  name: string;
  type: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  website: string;
}

export interface OperatingHours {
  [day: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newMessages: boolean;
  dealRedemptions: boolean;
  weeklyReport: boolean;
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(type === 'success' ? 'Success' : 'Error', message);
  }
};

export function useSettings() {
  const { venue, user, refreshVenue, isDemoMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const updateVenueProfile = async (data: Partial<VenueProfile>): Promise<boolean> => {
    if (isDemoMode) {
      showToast('Profile updated! (Demo mode)');
      return true;
    }

    if (!venue?.id) {
      showToast('No venue found', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('venues')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', venue.id);

      if (error) throw error;

      await refreshVenue();
      showToast('Profile updated successfully!');
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOperatingHours = async (hours: OperatingHours): Promise<boolean> => {
    if (isDemoMode) {
      showToast('Hours updated! (Demo mode)');
      return true;
    }

    if (!venue?.id) {
      showToast('No venue found', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('venues')
        .update({
          hours: hours,
          updated_at: new Date().toISOString(),
        })
        .eq('id', venue.id);

      if (error) throw error;

      await refreshVenue();
      showToast('Operating hours updated!');
      return true;
    } catch (error: any) {
      console.error('Error updating hours:', error);
      showToast(error.message || 'Failed to update hours', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationPreferences = async (prefs: NotificationPreferences): Promise<boolean> => {
    if (isDemoMode) {
      showToast('Preferences updated! (Demo mode)');
      return true;
    }

    if (!user?.id) {
      showToast('No user found', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          notification_preferences: prefs,
        })
        .eq('id', user.id);

      if (error) throw error;

      showToast('Notification preferences updated!');
      return true;
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      showToast(error.message || 'Failed to update preferences', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadVenueImage = async (
    uri: string,
    type: 'logo' | 'cover' | 'gallery'
  ): Promise<string | null> => {
    if (isDemoMode) {
      showToast('Image uploaded! (Demo mode)');
      return 'https://placeholder.com/image.jpg';
    }

    if (!venue?.id) {
      showToast('No venue found', 'error');
      return null;
    }

    setIsLoading(true);
    try {
      // Get file extension from URI
      const uriParts = uri.split('.');
      const fileExt = uriParts[uriParts.length - 1] || 'jpg';
      const fileName = `${venue.id}/${type}-${Date.now()}.${fileExt}`;

      // Fetch the image and convert to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('venue-images')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('venue-images')
        .getPublicUrl(fileName);

      // Update venue with new image URL
      const updateField = type === 'logo' ? 'logo_url' : type === 'cover' ? 'cover_image_url' : null;

      if (updateField) {
        const { error: updateError } = await supabase
          .from('venues')
          .update({ [updateField]: publicUrl })
          .eq('id', venue.id);

        if (updateError) throw updateError;
      } else if (type === 'gallery') {
        // Add to images array
        const currentImages = (venue as any).images || [];
        const { error: updateError } = await supabase
          .from('venues')
          .update({ images: [...currentImages, publicUrl] })
          .eq('id', venue.id);

        if (updateError) throw updateError;
      }

      await refreshVenue();
      showToast('Image uploaded successfully!');
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showToast(error.message || 'Failed to upload image', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeGalleryImage = async (imageUrl: string): Promise<boolean> => {
    if (isDemoMode) {
      showToast('Image removed! (Demo mode)');
      return true;
    }

    if (!venue?.id) {
      showToast('No venue found', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      const currentImages = (venue as any).images || [];
      const updatedImages = currentImages.filter((img: string) => img !== imageUrl);

      const { error } = await supabase
        .from('venues')
        .update({ images: updatedImages })
        .eq('id', venue.id);

      if (error) throw error;

      await refreshVenue();
      showToast('Image removed!');
      return true;
    } catch (error: any) {
      console.error('Error removing image:', error);
      showToast(error.message || 'Failed to remove image', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    venue,
    user,
    isLoading,
    isDemoMode,
    updateVenueProfile,
    updateOperatingHours,
    updateNotificationPreferences,
    uploadVenueImage,
    removeGalleryImage,
  };
}
