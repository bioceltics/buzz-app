import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings, NotificationPreferences, FollowedVenue } from '@/hooks/useSettings';
import { COLORS, SHADOWS } from '@/constants/colors';

interface NotificationOption {
  key: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: string;
  gradient: [string, string];
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    key: 'pushNotifications',
    title: 'Push Notifications',
    description: 'Get instant notifications on your device',
    icon: 'notifications',
    gradient: ['#8B5CF6', '#A78BFA'],
  },
  {
    key: 'emailNotifications',
    title: 'Email Notifications',
    description: 'Receive updates and alerts via email',
    icon: 'mail',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  {
    key: 'newDeals',
    title: 'New Deals',
    description: 'Alert when new deals are available nearby',
    icon: 'pricetag',
    gradient: [COLORS.primary, '#D81B60'],
  },
  {
    key: 'messageReplies',
    title: 'Message Replies',
    description: 'Notify when venues respond to messages',
    icon: 'chatbubble',
    gradient: ['#10B981', '#34D399'],
  },
  {
    key: 'weeklyDigest',
    title: 'Weekly Digest',
    description: 'Weekly summary of deals and savings',
    icon: 'calendar',
    gradient: ['#F59E0B', '#FBBF24'],
  },
];

export default function NotificationsScreen() {
  const {
    preferences,
    followedVenues,
    isLoading,
    updateNotificationPreferences,
    toggleVenueNotifications,
    searchVenues,
    refreshFollowedVenues,
  } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FollowedVenue[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshFollowedVenues();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await searchVenues(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const togglePreference = async (key: keyof NotificationPreferences) => {
    setSaving(true);
    await updateNotificationPreferences({
      [key]: !preferences[key],
    });
    setSaving(false);
  };

  const handleVenueToggle = async (venueId: string) => {
    setSaving(true);
    await toggleVenueNotifications(venueId);
    setSaving(false);
  };

  const setNotificationMode = async (onlyFollowed: boolean) => {
    setSaving(true);
    await updateNotificationPreferences({
      onlyFollowedVenues: onlyFollowed,
    });
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {saving ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#EDE9FE', '#DDD6FE']}
            style={styles.infoIconBg}
          >
            <Ionicons name="notifications" size={20} color="#6366F1" />
          </LinearGradient>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Stay Updated</Text>
            <Text style={styles.infoText}>
              Choose how you'd like to hear about deals and updates
            </Text>
          </View>
        </View>

        {/* Notification Mode Section */}
        <Text style={styles.sectionTitle}>NOTIFICATION MODE</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setNotificationMode(false)}
          >
            <LinearGradient
              colors={['#3B82F6', '#60A5FA']}
              style={styles.radioIcon}
            >
              <Ionicons name="globe" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.radioContent}>
              <Text style={styles.radioTitle}>All Nearby Deals</Text>
              <Text style={styles.radioDescription}>
                Get notified about all deals in your area
              </Text>
            </View>
            <View style={[styles.radio, !preferences.onlyFollowedVenues && styles.radioSelected]}>
              {!preferences.onlyFollowedVenues && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setNotificationMode(true)}
          >
            <LinearGradient
              colors={['#EF4444', '#F87171']}
              style={styles.radioIcon}
            >
              <Ionicons name="heart" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.radioContent}>
              <Text style={styles.radioTitle}>Only Followed Venues</Text>
              <Text style={styles.radioDescription}>
                Only get deals from venues you follow
              </Text>
            </View>
            <View style={[styles.radio, preferences.onlyFollowedVenues && styles.radioSelected]}>
              {preferences.onlyFollowedVenues && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Followed Venues Section */}
        <Text style={styles.sectionTitle}>FOLLOWED VENUES</Text>
        <View style={styles.card}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search venues to follow..."
              placeholderTextColor={COLORS.textTertiary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={COLORS.primary} />
            )}
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.venueRow}
                  onPress={() => handleVenueToggle(venue.id)}
                >
                  <View style={styles.venueAvatar}>
                    {venue.logo_url ? (
                      <Image source={{ uri: venue.logo_url }} style={styles.venueImage} />
                    ) : (
                      <LinearGradient
                        colors={[COLORS.primary, '#D81B60']}
                        style={styles.venueImagePlaceholder}
                      >
                        <Text style={styles.venueInitial}>
                          {venue.name.charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.venueInfo}>
                    <Text style={styles.venueName}>{venue.name}</Text>
                    <Text style={styles.venueType}>{venue.type}</Text>
                  </View>
                  <Switch
                    value={venue.notificationsEnabled}
                    onValueChange={() => handleVenueToggle(venue.id)}
                    trackColor={{ false: '#E5E7EB', true: COLORS.primaryLighter }}
                    thumbColor={venue.notificationsEnabled ? COLORS.primary : '#9CA3AF'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Followed Venues List */}
          {followedVenues.length > 0 ? (
            <>
              {searchResults.length > 0 && <View style={styles.divider} />}
              <Text style={styles.subsectionTitle}>Your Followed Venues</Text>
              {followedVenues.map((venue, index) => (
                <View key={venue.id}>
                  <TouchableOpacity
                    style={styles.venueRow}
                    onPress={() => handleVenueToggle(venue.id)}
                  >
                    <View style={styles.venueAvatar}>
                      {venue.logo_url ? (
                        <Image source={{ uri: venue.logo_url }} style={styles.venueImage} />
                      ) : (
                        <LinearGradient
                          colors={[COLORS.primary, '#D81B60']}
                          style={styles.venueImagePlaceholder}
                        >
                          <Text style={styles.venueInitial}>
                            {venue.name.charAt(0).toUpperCase()}
                          </Text>
                        </LinearGradient>
                      )}
                    </View>
                    <View style={styles.venueInfo}>
                      <Text style={styles.venueName}>{venue.name}</Text>
                      <Text style={styles.venueType}>{venue.type}</Text>
                    </View>
                    <Switch
                      value={venue.notificationsEnabled}
                      onValueChange={() => handleVenueToggle(venue.id)}
                      trackColor={{ false: '#E5E7EB', true: COLORS.primaryLighter }}
                      thumbColor={venue.notificationsEnabled ? COLORS.primary : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                  {index < followedVenues.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyVenues}>
              <Ionicons name="heart-outline" size={32} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No followed venues yet</Text>
              <Text style={styles.emptySubtext}>
                Save venues to your favorites to follow them
              </Text>
            </View>
          ) : null}

          {/* Follow More Button */}
          <TouchableOpacity
            style={styles.followMoreButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.primary} />
            <Text style={styles.followMoreText}>Discover More Venues</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Types Section */}
        <Text style={styles.sectionTitle}>NOTIFICATION TYPES</Text>
        <View style={styles.card}>
          {NOTIFICATION_OPTIONS.map((option, index) => (
            <View key={option.key}>
              <View style={styles.optionRow}>
                <LinearGradient
                  colors={option.gradient}
                  style={styles.optionIcon}
                >
                  <Ionicons name={option.icon as any} size={20} color="#FFF" />
                </LinearGradient>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Switch
                  value={preferences[option.key] as boolean}
                  onValueChange={() => togglePreference(option.key)}
                  trackColor={{ false: '#E5E7EB', true: COLORS.primaryLighter }}
                  thumbColor={preferences[option.key] ? COLORS.primary : '#9CA3AF'}
                  disabled={saving}
                />
              </View>
              {index < NOTIFICATION_OPTIONS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Helper Text */}
        <View style={styles.helperCard}>
          <Ionicons name="information-circle" size={18} color={COLORS.textTertiary} />
          <Text style={styles.helperText}>
            Your preferences are saved automatically. Some notifications may be required for important updates about your account.
          </Text>
        </View>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  infoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 14,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 20,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  radioIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  radioTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  radioDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    margin: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  searchResults: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  venueAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  venueImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  venueInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  venueName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  venueType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  emptyVenues: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  followMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  followMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    flex: 1,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
