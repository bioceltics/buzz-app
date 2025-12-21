import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SHADOWS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_free: boolean;
  cover_charge: number;
  age_restriction: string;
  capacity: number;
  dress_code: string;
  is_active: boolean;
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  live_music: 'musical-notes',
  dj: 'disc',
  comedy: 'happy',
  trivia: 'help-circle',
  sports: 'football',
  themed: 'color-palette',
  special: 'star',
  other: 'calendar',
};

const EVENT_TYPE_GRADIENTS: Record<string, [string, string]> = {
  live_music: ['#8B5CF6', '#A78BFA'],
  dj: ['#EC4899', '#F472B6'],
  comedy: ['#F59E0B', '#FBBF24'],
  trivia: ['#10B981', '#34D399'],
  sports: ['#3B82F6', '#60A5FA'],
  themed: ['#6366F1', '#818CF8'],
  special: ['#EF4444', '#F87171'],
  other: ['#6B7280', '#9CA3AF'],
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  live_music: 'Live Music',
  dj: 'DJ Night',
  comedy: 'Comedy',
  trivia: 'Trivia',
  sports: 'Sports',
  themed: 'Themed',
  special: 'Special',
  other: 'Event',
};

export default function EventsScreen() {
  const { venue } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: events, refetch, isLoading } = useQuery({
    queryKey: ['venue-events', venue?.id],
    queryFn: async () => {
      if (!venue) return [];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('venue_id', venue.id)
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!venue,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const upcomingEvents = events?.filter(e => new Date(e.start_date) >= new Date()) || [];
  const pastEvents = events?.filter(e => new Date(e.start_date) < new Date()) || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Events</Text>
          <Text style={styles.headerSubtitle}>
            {events?.length || 0} events • {upcomingEvents.length} upcoming
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-event')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={26} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Empty State */}
        {(!events || events.length === 0) && !isLoading && (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#EDE9FE', '#DDD6FE']}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="calendar-outline" size={48} color="#6366F1" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No Events Yet</Text>
            <Text style={styles.emptyText}>
              Create your first event to attract more customers to your venue
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create-event')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add" size={22} color="#FFF" />
                <Text style={styles.createButtonText}>Create Event</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{upcomingEvents.length}</Text>
              </View>
            </View>
            {upcomingEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/edit-event?id=${event.id}`)}
                activeOpacity={0.8}
              >
                {/* Date Column */}
                <View style={styles.dateColumn}>
                  <Text style={styles.dateDay}>{getDayOfWeek(event.start_date)}</Text>
                  <Text style={styles.dateNum}>
                    {new Date(event.start_date).getDate()}
                  </Text>
                  <Text style={styles.dateMonth}>
                    {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </View>

                {/* Event Content */}
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <LinearGradient
                      colors={EVENT_TYPE_GRADIENTS[event.event_type] || EVENT_TYPE_GRADIENTS.other}
                      style={styles.eventTypeIcon}
                    >
                      <Ionicons
                        name={EVENT_TYPE_ICONS[event.event_type] || 'calendar'}
                        size={18}
                        color="#FFF"
                      />
                    </LinearGradient>
                    <Text style={styles.eventType}>
                      {EVENT_TYPE_LABELS[event.event_type] || 'Event'}
                    </Text>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>

                  <View style={styles.eventMeta}>
                    <View style={styles.eventMetaItem}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.eventMetaText}>{formatTime(event.start_time)}</Text>
                    </View>
                    {event.capacity > 0 && (
                      <View style={styles.eventMetaItem}>
                        <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.eventMetaText}>{event.capacity}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.eventTags}>
                    {event.is_free ? (
                      <View style={[styles.tag, styles.tagFree]}>
                        <Text style={styles.tagTextFree}>Free Entry</Text>
                      </View>
                    ) : (
                      <View style={[styles.tag, styles.tagPaid]}>
                        <Text style={styles.tagTextPaid}>${event.cover_charge} Cover</Text>
                      </View>
                    )}
                    {event.age_restriction && event.age_restriction !== 'none' && (
                      <View style={[styles.tag, styles.tagAge]}>
                        <Text style={styles.tagTextAge}>{event.age_restriction}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.eventArrow}>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Past Events</Text>
              <View style={[styles.sectionBadge, styles.sectionBadgeMuted]}>
                <Text style={styles.sectionBadgeTextMuted}>{pastEvents.length}</Text>
              </View>
            </View>
            {pastEvents.slice(0, 5).map((event) => (
              <View key={event.id} style={styles.pastEventCard}>
                <View style={styles.pastDateColumn}>
                  <Text style={styles.pastDate}>{formatDate(event.start_date)}</Text>
                </View>
                <View style={styles.pastEventContent}>
                  <Text style={styles.pastEventTitle}>{event.title}</Text>
                  <Text style={styles.pastEventType}>
                    {EVENT_TYPE_LABELS[event.event_type] || 'Event'}
                  </Text>
                </View>
                <View style={styles.pastEventIcon}>
                  <Ionicons
                    name={EVENT_TYPE_ICONS[event.event_type] || 'calendar'}
                    size={18}
                    color={COLORS.textTertiary}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 26,
    overflow: 'hidden',
    ...SHADOWS.primary,
  },
  addButtonGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.primary,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sectionBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  sectionBadgeMuted: {
    backgroundColor: '#E5E7EB',
  },
  sectionBadgeTextMuted: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  dateColumn: {
    width: 52,
    alignItems: 'center',
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
    marginRight: 14,
  },
  dateDay: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  dateNum: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  eventTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventType: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  eventTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagFree: {
    backgroundColor: '#D1FAE5',
  },
  tagTextFree: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  tagPaid: {
    backgroundColor: '#FEF3C7',
  },
  tagTextPaid: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  tagAge: {
    backgroundColor: '#EDE9FE',
  },
  tagTextAge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  eventArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  pastEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  pastDateColumn: {
    width: 70,
  },
  pastDate: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  pastEventContent: {
    flex: 1,
  },
  pastEventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  pastEventType: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  pastEventIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 120,
  },
});
