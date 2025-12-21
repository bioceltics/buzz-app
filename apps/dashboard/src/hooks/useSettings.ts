import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface VenueProfile {
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

interface OperatingHours {
  [day: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newMessages: boolean;
  dealRedemptions: boolean;
  weeklyReport: boolean;
}

export function useSettings() {
  const { venue, user, refreshUserData, isDemoMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const updateVenueProfile = async (data: Partial<VenueProfile>) => {
    if (isDemoMode) {
      toast.success('Profile updated! (Demo mode)');
      return true;
    }

    if (!venue?.id) {
      toast.error('No venue found');
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

      await refreshUserData();
      toast.success('Profile updated successfully!');
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOperatingHours = async (hours: OperatingHours) => {
    if (isDemoMode) {
      toast.success('Hours updated! (Demo mode)');
      return true;
    }

    if (!venue?.id) {
      toast.error('No venue found');
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

      await refreshUserData();
      toast.success('Operating hours updated!');
      return true;
    } catch (error: any) {
      console.error('Error updating hours:', error);
      toast.error(error.message || 'Failed to update hours');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationPreferences = async (prefs: NotificationPreferences) => {
    if (isDemoMode) {
      toast.success('Preferences updated! (Demo mode)');
      return true;
    }

    if (!user?.id) {
      toast.error('No user found');
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

      toast.success('Notification preferences updated!');
      return true;
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error(error.message || 'Failed to update preferences');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadVenueImage = async (file: File, type: 'logo' | 'cover' | 'gallery') => {
    if (isDemoMode) {
      toast.success('Image uploaded! (Demo mode)');
      return 'https://placeholder.com/image.jpg';
    }

    if (!venue?.id) {
      toast.error('No venue found');
      return null;
    }

    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${venue.id}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('venue-images')
        .upload(fileName, file);

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
        const currentImages = venue.images || [];
        const { error: updateError } = await supabase
          .from('venues')
          .update({ images: [...currentImages, publicUrl] })
          .eq('id', venue.id);

        if (updateError) throw updateError;
      }

      await refreshUserData();
      toast.success('Image uploaded successfully!');
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      return null;
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
  };
}
