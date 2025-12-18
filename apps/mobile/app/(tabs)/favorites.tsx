import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { VenueCard } from '@/components/venues/VenueCard';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

export default function FavoritesScreen() {
  const { user } = useAuth();
  const { favorites, isLoading, removeFavorite } = useFavorites();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart" size={40} color={COLORS.error} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to save favorites</Text>
          <Text style={styles.emptySubtext}>
            Keep track of your favorite venues and never miss their best deals
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            size="lg"
            style={styles.actionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Favorites</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{favorites.length}</Text>
          </View>
        </View>
        {favorites.length > 0 && (
          <Text style={styles.subtitle}>
            Your saved venues and their latest deals
          </Text>
        )}
      </View>

      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <VenueCard
              venue={item.venue}
              onPress={() => router.push(`/venue/${item.venue.id}`)}
              onFavoritePress={() => removeFavorite(item.venue.id)}
              isFavorite={true}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="heart-outline" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the heart icon on any venue to save it here for quick access
            </Text>
            <Button
              title="Explore Venues"
              onPress={() => router.push('/(tabs)')}
              size="lg"
              style={styles.actionButton}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.heavy,
    color: COLORS.text,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  countBadge: {
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
  },
  countBadgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.base,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  separator: {
    height: SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING['4xl'],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.relaxed,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    minWidth: 200,
  },
});
