import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

interface Venue {
  id: string;
  name: string;
  type: 'restaurant' | 'bar' | 'club' | 'cafe' | 'hotel';
  latitude: number;
  longitude: number;
  address: string;
  rating: number;
  activeDealCount: number;
  distance?: number;
}

const VENUE_TYPE_COLORS: Record<string, string> = {
  restaurant: '#FF6B6B',
  bar: '#4ECDC4',
  club: '#9B59B6',
  cafe: '#F39C12',
  hotel: '#3498DB',
};

const VENUE_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  restaurant: 'restaurant',
  bar: 'beer',
  club: 'musical-notes',
  cafe: 'cafe',
  hotel: 'bed',
};

// Mock data for venues
const MOCK_VENUES: Venue[] = [
  {
    id: '1',
    name: 'The Golden Tap',
    type: 'bar',
    latitude: 37.7849,
    longitude: -122.4094,
    address: '123 Market St, San Francisco',
    rating: 4.5,
    activeDealCount: 3,
    distance: 500,
  },
  {
    id: '2',
    name: 'Bella Italia',
    type: 'restaurant',
    latitude: 37.7869,
    longitude: -122.4054,
    address: '456 Union Square, San Francisco',
    rating: 4.8,
    activeDealCount: 2,
    distance: 800,
  },
  {
    id: '3',
    name: 'Club Neon',
    type: 'club',
    latitude: 37.7829,
    longitude: -122.4114,
    address: '789 SOMA Blvd, San Francisco',
    rating: 4.2,
    activeDealCount: 1,
    distance: 1200,
  },
  {
    id: '4',
    name: 'Morning Brew',
    type: 'cafe',
    latitude: 37.7879,
    longitude: -122.4024,
    address: '321 Coffee Lane, San Francisco',
    rating: 4.7,
    activeDealCount: 4,
    distance: 300,
  },
];

export default function MapScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setVenues(MOCK_VENUES);
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading venues...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.title}>Nearby Venues</Text>
        <Text style={styles.subtitle}>Full map available on mobile app</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {venues.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            style={styles.venueCard}
            onPress={() => router.push(`/venue/${venue.id}` as any)}
          >
            <View style={[styles.venueIcon, { backgroundColor: VENUE_TYPE_COLORS[venue.type] }]}>
              <Ionicons name={VENUE_TYPE_ICONS[venue.type]} size={24} color={COLORS.white} />
            </View>

            <View style={styles.venueInfo}>
              <Text style={styles.venueName}>{venue.name}</Text>
              <Text style={styles.venueAddress}>{venue.address}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color={COLORS.warning} />
                  <Text style={styles.metaText}>{venue.rating}</Text>
                </View>

                <View style={styles.metaItem}>
                  <Ionicons name="location" size={14} color={COLORS.textTertiary} />
                  <Text style={styles.metaText}>
                    {venue.distance ? `${(venue.distance / 1000).toFixed(1)} km` : 'Nearby'}
                  </Text>
                </View>

                {venue.activeDealCount > 0 && (
                  <View style={[styles.metaItem, styles.dealBadge]}>
                    <Ionicons name="pricetag" size={14} color={COLORS.success} />
                    <Text style={[styles.metaText, { color: COLORS.success }]}>
                      {venue.activeDealCount} deals
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: SPACING.base,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.base,
    gap: SPACING.md,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.base,
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
  },
  venueIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  venueAddress: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  dealBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
});
