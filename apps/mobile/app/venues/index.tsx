import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { VenueCard } from '@/components/venues/VenueCard';
import { BuzzeeIcon } from '@/components/ui/BuzzeeIcon';
import { Button } from '@/components/ui';
import { useVenues } from '@/hooks/useVenues';
import { useLocation } from '@/hooks/useLocation';
import { useFavorites } from '@/hooks/useFavorites';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/colors';

const VENUE_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'restaurant', label: 'Restaurants', icon: 'restaurant-outline' },
  { id: 'bar', label: 'Bars', icon: 'beer-outline' },
  { id: 'club', label: 'Clubs', icon: 'musical-notes-outline' },
  { id: 'cafe', label: 'Cafes', icon: 'cafe-outline' },
  { id: 'hotel', label: 'Hotels', icon: 'bed-outline' },
];

const SORT_OPTIONS = [
  { id: 'distance', label: 'Nearest', icon: 'location-outline' },
  { id: 'name', label: 'A-Z', icon: 'text-outline' },
  { id: 'rating', label: 'Top Rated', icon: 'star-outline' },
];

export default function VenuesBrowseScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'rating'>('distance');
  const [refreshing, setRefreshing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const { location } = useLocation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const { venues, isLoading, refetch } = useVenues({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery,
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude,
  });

  // Sort venues based on selected sort option
  const sortedVenues = useMemo(() => {
    if (!venues) return [];

    const sorted = [...venues];
    switch (sortBy) {
      case 'distance':
        return sorted.sort((a, b) => ((a as any).distance || Infinity) - ((b as any).distance || Infinity));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  }, [venues, sortBy]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleFavoritePress = useCallback(
    async (venueId: string) => {
      if (isFavorite(venueId)) {
        await removeFavorite(venueId);
      } else {
        await addFavorite(venueId);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, searchFocused && styles.searchFocused]}>
        <Ionicons name="search" size={20} color={COLORS.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {VENUE_CATEGORIES.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelectedCategory(item.id)}
            style={[
              styles.categoryPill,
              selectedCategory === item.id && styles.categoryPillActive,
            ]}
          >
            <Ionicons
              name={item.icon as any}
              size={16}
              color={selectedCategory === item.id ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item.id && styles.categoryTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortOptions}>
          {SORT_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSortBy(option.id as 'distance' | 'name' | 'rating')}
              style={[
                styles.sortPill,
                sortBy === option.id && styles.sortPillActive,
              ]}
            >
              <Ionicons
                name={option.icon as any}
                size={14}
                color={sortBy === option.id ? COLORS.white : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.sortText,
                  sortBy === option.id && styles.sortTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {sortedVenues.length} venue{sortedVenues.length !== 1 ? 's' : ''} found
        </Text>
        {location && (
          <View style={styles.locationIndicator}>
            <Ionicons name="location" size={14} color={COLORS.success} />
            <Text style={styles.locationText}>Near you</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={[COLORS.primary, '#D81B60']}
        style={styles.emptyIcon}
      >
        <Ionicons name="business-outline" size={48} color={COLORS.white} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No venues found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Try adjusting your search or filters'
          : 'No venues available in this category'}
      </Text>
      <Button
        title="Reset Filters"
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }}
        variant="outline"
        size="md"
        style={styles.resetButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <LinearGradient
            colors={[COLORS.primary, '#D81B60']}
            style={styles.logoContainer}
          >
            <BuzzeeIcon size={16} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.headerTitle}>Explore Venues</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading venues...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedVenues}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <VenueCard
                venue={item}
                onPress={() => router.push(`/venue/${item.id}`)}
                onFavoritePress={() => handleFavoritePress(item.id)}
                isFavorite={isFavorite(item.id)}
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.base,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  listHeader: {
    paddingTop: SPACING.base,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.base,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
  },
  searchFocused: {
    borderColor: COLORS.primary,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    gap: SPACING.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.base,
  },
  sortLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  sortPillActive: {
    backgroundColor: COLORS.primary,
  },
  sortText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  sortTextActive: {
    color: COLORS.white,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  resultsCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  cardWrapper: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  resetButton: {
    minWidth: 150,
  },
});
