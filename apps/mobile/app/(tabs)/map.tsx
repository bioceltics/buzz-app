import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
  Linking,
  TextInput,
  Pressable,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';
import { Button } from '@/components/ui';
import { useVenues } from '@/hooks/useVenues';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

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
  logoUrl?: string;
  deals?: Deal[];
}

interface Deal {
  id: string;
  title: string;
  discountType: string;
  discountValue: number;
  endTime: string;
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

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query to prevent keyboard dismissal
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch real venues from Supabase
  const { venues: fetchedVenues, isLoading: venuesLoading, refetch: refetchVenues } = useVenues({
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude,
    search: debouncedSearch,
    category: activeFilters.length === 1 ? activeFilters[0] : undefined,
  });

  // Map the venues to include activeDealCount
  const venues: Venue[] = (fetchedVenues || []).map(v => ({
    id: v.id,
    name: v.name,
    type: (v.type as Venue['type']) || 'restaurant',
    latitude: v.latitude || 0,
    longitude: v.longitude || 0,
    address: v.address || '',
    rating: v.rating || 0,
    activeDealCount: v.review_count || 0,
    distance: v.distance,
  }));

  const mapRef = useRef<MapView>(null);
  const cardAnimation = useRef(new Animated.Value(0)).current;

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      setIsLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Could not get your location');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleMarkerPress = useCallback((venue: Venue) => {
    setSelectedVenue(venue);

    Animated.spring(cardAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    mapRef.current?.animateToRegion({
      latitude: venue.latitude,
      longitude: venue.longitude,
      latitudeDelta: LATITUDE_DELTA / 2,
      longitudeDelta: LONGITUDE_DELTA / 2,
    }, 300);
  }, [cardAnimation]);

  const handleCardDismiss = useCallback(() => {
    Animated.timing(cardAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedVenue(null));
  }, [cardAnimation]);

  const handleGetDirections = useCallback((venue: Venue) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${venue.latitude},${venue.longitude}`;
    const label = encodeURIComponent(venue.name);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  }, []);

  const handleViewDeals = useCallback((venue: Venue) => {
    router.push(`/venue/${venue.id}` as any);
  }, []);

  const centerOnUser = useCallback(() => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 300);
    }
  }, [location]);

  const toggleFilter = useCallback((filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  }, []);

  // Filter by type (useVenues handles search, but only single category)
  // When multiple filters are selected, filter locally
  const filteredVenues = activeFilters.length > 1
    ? venues.filter(v => activeFilters.includes(v.type))
    : venues;

  const renderCustomMarker = (venue: Venue) => (
    <View style={[styles.markerContainer, { backgroundColor: VENUE_TYPE_COLORS[venue.type] }]}>
      <Ionicons
        name={VENUE_TYPE_ICONS[venue.type]}
        size={16}
        color={COLORS.white}
      />
      {venue.activeDealCount > 0 && (
        <View style={styles.dealBadge}>
          <Text style={styles.dealBadgeText}>{venue.activeDealCount}</Text>
        </View>
      )}
    </View>
  );

  if (isLoading || (location && venuesLoading)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding venues near you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.errorTitle}>Location Access Required</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Button
            title="Enable Location"
            onPress={() => Location.requestForegroundPermissionsAsync()}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.coords.latitude || 37.7849,
          longitude: location?.coords.longitude || -122.4094,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={handleCardDismiss}
      >
        {filteredVenues.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={{
              latitude: venue.latitude,
              longitude: venue.longitude,
            }}
            onPress={() => handleMarkerPress(venue)}
          >
            {renderCustomMarker(venue)}
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search venues..."
              placeholderTextColor={COLORS.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
              </Pressable>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="filter"
              size={20}
              color={showFilters ? COLORS.white : COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {Object.entries(VENUE_TYPE_COLORS).map(([type, color]) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterPill,
                  activeFilters.includes(type) && { backgroundColor: color },
                ]}
                onPress={() => toggleFilter(type)}
              >
                <Ionicons
                  name={VENUE_TYPE_ICONS[type]}
                  size={14}
                  color={activeFilters.includes(type) ? COLORS.white : color}
                />
                <Text style={[
                  styles.filterPillText,
                  activeFilters.includes(type) && { color: COLORS.white },
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Center on user button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
        <Ionicons name="locate" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Selected Venue Card */}
      {selectedVenue && (
        <Animated.View
          style={[
            styles.venueCard,
            {
              transform: [
                {
                  translateY: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0],
                  }),
                },
              ],
              opacity: cardAnimation,
            },
          ]}
        >
          <TouchableOpacity style={styles.cardDismiss} onPress={handleCardDismiss}>
            <Ionicons name="close" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.venueTypeIcon,
                  { backgroundColor: VENUE_TYPE_COLORS[selectedVenue.type] }
                ]}
              >
                <Ionicons
                  name={VENUE_TYPE_ICONS[selectedVenue.type]}
                  size={20}
                  color={COLORS.white}
                />
              </View>
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{selectedVenue.name}</Text>
                <Text style={styles.venueAddress}>{selectedVenue.address}</Text>
              </View>
            </View>

            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={14} color={COLORS.warning} />
                <Text style={styles.metaText}>{selectedVenue.rating}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={14} color={COLORS.textTertiary} />
                <Text style={styles.metaText}>
                  {selectedVenue.distance ? `${(selectedVenue.distance / 1000).toFixed(1)} km` : 'Nearby'}
                </Text>
              </View>
              {selectedVenue.activeDealCount > 0 && (
                <View style={[styles.metaItem, styles.dealMeta]}>
                  <Ionicons name="pricetag" size={14} color={COLORS.success} />
                  <Text style={[styles.metaText, { color: COLORS.success }]}>
                    {selectedVenue.activeDealCount} deals
                  </Text>
                </View>
              )}
            </View>

            {selectedVenue.deals && selectedVenue.deals.length > 0 && (
              <View style={styles.dealPreview}>
                <View style={styles.dealTag}>
                  <Ionicons name="flash" size={12} color={COLORS.white} />
                  <Text style={styles.dealTagText}>{selectedVenue.deals[0].title}</Text>
                </View>
              </View>
            )}

            <View style={styles.cardActions}>
              <Button
                title="Directions"
                onPress={() => handleGetDirections(selectedVenue)}
                variant="outline"
                size="sm"
                style={styles.actionButton}
              />
              <Button
                title="View Deals"
                onPress={() => handleViewDeals(selectedVenue)}
                variant="primary"
                size="sm"
                style={styles.actionButton}
              />
            </View>
          </View>
        </Animated.View>
      )}

      {/* Venue count indicator */}
      <View style={styles.venueCount}>
        <Text style={styles.venueCountText}>
          {filteredVenues.length} venues nearby
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING['2xl'],
    backgroundColor: COLORS.white,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  retryButton: {
    minWidth: 200,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  filterPillText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  centerButton: {
    position: 'absolute',
    right: SPACING.base,
    bottom: 220,
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.md,
  },
  dealBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  dealBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  venueCard: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.base,
    right: SPACING.base,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS['2xl'],
    ...SHADOWS.xl,
  },
  cardDismiss: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cardContent: {
    padding: SPACING.base,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  venueTypeIcon: {
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
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  venueAddress: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dealMeta: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  dealPreview: {
    marginBottom: SPACING.md,
  },
  dealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  dealTagText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  venueCount: {
    position: 'absolute',
    bottom: SPACING.base,
    alignSelf: 'center',
    backgroundColor: COLORS.text,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  venueCountText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.white,
  },
});
