import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { VenueCard } from '@/components/venues/VenueCard';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { BuzzeeIcon } from '@/components/ui/BuzzeeIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

export default function FavoritesScreen() {
  const { user } = useAuth();
  const { favorites, isLoading, removeFavorite } = useFavorites();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[COLORS.primary, '#D81B60']}
              style={styles.logoContainer}
            >
              <BuzzeeIcon size={18} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.logoText}>Buzzee</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <LinearGradient
            colors={['#DC2626', '#EF4444']}
            style={styles.emptyIconContainer}
          >
            <Ionicons name="heart" size={40} color={COLORS.white} />
          </LinearGradient>
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
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[COLORS.primary, '#D81B60']}
              style={styles.logoContainer}
            >
              <BuzzeeIcon size={18} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.logoText}>Buzzee</Text>
          </View>
          {favorites.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{favorites.length}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>Favorites</Text>
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
            <LinearGradient
              colors={[COLORS.primary, '#D81B60']}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="heart-outline" size={40} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the heart icon on any venue to save it here for quick access
            </Text>
            <Button
              title="Explore Venues"
              onPress={() => router.push('/venues')}
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...SHADOWS.lg,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    minWidth: 200,
  },
});
