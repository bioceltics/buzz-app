import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Calendar from 'expo-calendar';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`*, venue:venues(*)`)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: rsvp } = useQuery({
    queryKey: ['event-rsvp', id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const rsvpMutation = useMutation({
    mutationFn: async (status: 'going' | 'interested') => {
      const session = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/events/${id}/rsvp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) throw new Error('Failed to RSVP');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-rsvp', id] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
  });

  const handleRSVP = (status: 'going' | 'interested') => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to RSVP.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    rsvpMutation.mutate(status);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${event?.title} at ${event?.venue?.name}!\n\n${event?.description}`,
        title: event?.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleAddToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Calendar access is needed to add events.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find((c) => c.allowsModifications) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar available.');
        return;
      }

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: event?.title || 'Event',
        startDate: new Date(event?.start_time),
        endDate: event?.end_time ? new Date(event.end_time) : new Date(event?.start_time),
        location: event?.venue?.address,
        notes: event?.description,
      });

      Alert.alert('Success', 'Event added to calendar!');
    } catch (error) {
      console.error('Calendar error:', error);
      Alert.alert('Error', 'Failed to add event to calendar.');
    }
  };

  const openMaps = () => {
    if (event?.venue) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${event.venue.latitude},${event.venue.longitude}`;
      Linking.openURL(url);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'live_music':
        return 'musical-notes';
      case 'dj':
        return 'disc';
      case 'comedy':
        return 'happy';
      case 'trivia':
        return 'help-circle';
      case 'sports':
        return 'football';
      case 'themed':
        return 'color-palette';
      default:
        return 'calendar';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  const venue = event.venue;
  const isPast = new Date(event.start_time) < new Date();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.image_url || venue?.cover_image_url || 'https://via.placeholder.com/400x250' }}
            style={styles.image}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.typeBadge}>
            <Ionicons name={getEventTypeIcon(event.type)} size={16} color="#fff" />
            <Text style={styles.typeText}>{event.type.replace('_', ' ')}</Text>
          </View>
        </View>

        {/* Event Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>

          {/* Date & Time */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.infoTitle}>{formatEventDate(event.start_time)}</Text>
              <Text style={styles.infoSubtitle}>
                {formatEventTime(event.start_time)}
                {event.end_time && ` - ${formatEventTime(event.end_time)}`}
              </Text>
            </View>
          </View>

          {/* Venue */}
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => router.push(`/venue/${venue.id}`)}
          >
            <View style={styles.infoIcon}>
              <Ionicons name="location" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>{venue.name}</Text>
              <Text style={styles.infoSubtitle} numberOfLines={1}>
                {venue.address}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Price & Age */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="ticket" size={20} color={Colors.text} />
              <Text style={styles.metaText}>
                {event.is_free ? 'Free' : `$${event.cover_charge}`}
              </Text>
            </View>
            {event.age_restriction && (
              <View style={styles.metaItem}>
                <Ionicons name="person" size={20} color={Colors.text} />
                <Text style={styles.metaText}>{event.age_restriction}+</Text>
              </View>
            )}
            {event.capacity && (
              <View style={styles.metaItem}>
                <Ionicons name="people" size={20} color={Colors.text} />
                <Text style={styles.metaText}>
                  {event.rsvp_count}/{event.capacity}
                </Text>
              </View>
            )}
          </View>

          {/* Dress Code */}
          {event.dress_code && (
            <View style={styles.dressCodeContainer}>
              <Ionicons name="shirt" size={18} color={Colors.textSecondary} />
              <Text style={styles.dressCodeText}>Dress Code: {event.dress_code}</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={openMaps}>
              <Ionicons name="navigate" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddToCalendar}>
              <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Add to Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom RSVP Buttons */}
      {!isPast && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.rsvpButton,
              styles.interestedButton,
              rsvp?.status === 'interested' && styles.activeButton,
            ]}
            onPress={() => handleRSVP('interested')}
            disabled={rsvpMutation.isPending}
          >
            <Ionicons
              name={rsvp?.status === 'interested' ? 'star' : 'star-outline'}
              size={20}
              color={rsvp?.status === 'interested' ? '#fff' : Colors.primary}
            />
            <Text
              style={[
                styles.rsvpButtonText,
                rsvp?.status === 'interested' && styles.activeButtonText,
              ]}
            >
              Interested
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rsvpButton,
              styles.goingButton,
              rsvp?.status === 'going' && styles.goingActiveButton,
            ]}
            onPress={() => handleRSVP('going')}
            disabled={rsvpMutation.isPending}
          >
            {rsvpMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name={rsvp?.status === 'going' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.goingButtonText}>
                  {rsvp?.status === 'going' ? "I'm Going!" : 'Going'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isPast && (
        <View style={styles.pastEventBanner}>
          <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.pastEventText}>This event has ended</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width,
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  shareButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  typeBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  typeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  infoSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  dressCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dressCodeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: Colors.primary,
  },
  bottomContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  rsvpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  interestedButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  activeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goingButton: {
    backgroundColor: Colors.success,
  },
  goingActiveButton: {
    backgroundColor: Colors.success,
  },
  rsvpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  activeButtonText: {
    color: '#fff',
  },
  goingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  pastEventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  pastEventText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
