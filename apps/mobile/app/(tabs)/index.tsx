import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { DealCard } from '@/components/deals/DealCard';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { useDeals } from '@/hooks/useDeals';
import { useLocation } from '@/hooks/useLocation';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION, GRADIENTS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'bar', label: 'Bars', icon: 'beer' },
  { id: 'restaurant', label: 'Restaurants', icon: 'restaurant' },
  { id: 'club', label: 'Clubs', icon: 'musical-notes' },
  { id: 'hotel', label: 'Hotels', icon: 'bed' },
  { id: 'cafe', label: 'Cafes', icon: 'cafe' },
];

// Animated Header Button
function AnimatedIconButton({
  icon,
  onPress,
  badge,
  delay = 0,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: number;
  delay?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateYAnim, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        ...ANIMATION.spring.smooth,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ANIMATION.duration.normal,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      ...ANIMATION.spring.snappy,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIMATION.spring.bouncy,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.headerButtonWrapper,
        {
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.headerButton}
      >
        <Ionicons name={icon} size={24} color={COLORS.text} />
        {badge && badge > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// Animated Search Bar
function AnimatedSearchBar({
  value,
  onChangeText,
  onFocus,
  onBlur,
  isFocused,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const borderWidthAnim = useRef(new Animated.Value(0)).current;
  const clearOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateYAnim, {
        toValue: 0,
        delay: 100,
        useNativeDriver: true,
        ...ANIMATION.spring.smooth,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ANIMATION.duration.slow,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(clearOpacity, {
      toValue: value.length > 0 ? 1 : 0,
      duration: ANIMATION.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      ...ANIMATION.spring.snappy,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIMATION.spring.bouncy,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.searchContainer,
        isFocused && styles.searchContainerFocused,
        {
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View style={styles.searchInner}>
          <View style={[styles.searchIconContainer, isFocused && styles.searchIconFocused]}>
            <Ionicons
              name="search"
              size={20}
              color={isFocused ? COLORS.white : COLORS.primary}
            />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search deals, venues, events..."
            placeholderTextColor={COLORS.textTertiary}
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onBlur={onBlur}
            returnKeyType="search"
          />
          <Animated.View style={[styles.clearButtonWrapper, { opacity: clearOpacity }]}>
            <Pressable
              onPress={() => onChangeText('')}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.15)']}
                style={styles.clearIconContainer}
              >
                <Ionicons name="close" size={14} color={COLORS.white} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Animated Section Header
function SectionHeader({
  title,
  icon,
  iconColor,
  iconBg,
  rightText,
  onPressRight,
  isLive,
  delay = 0,
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  rightText?: string;
  onPressRight?: () => void;
  isLive?: boolean;
  delay?: number;
}) {
  const translateXAnim = useRef(new Animated.Value(-30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateXAnim, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        ...ANIMATION.spring.smooth,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ANIMATION.duration.slow,
        delay,
        useNativeDriver: true,
      }),
    ]).start();

    if (isLive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [delay, isLive]);

  return (
    <Animated.View
      style={[
        styles.sectionHeader,
        {
          transform: [{ translateX: translateXAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.sectionTitleContainer}>
        {isLive ? (
          <Animated.View
            style={[
              styles.sectionIcon,
              styles.sectionIconLive,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.liveDot} />
          </Animated.View>
        ) : icon ? (
          <View style={[styles.sectionIcon, iconBg ? { backgroundColor: iconBg } : {}]}>
            <Ionicons name={icon} size={16} color={iconColor || COLORS.primary} />
          </View>
        ) : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {rightText && onPressRight && (
        <Pressable onPress={onPressRight} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>{rightText}</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </Pressable>
      )}
    </Animated.View>
  );
}

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Logo animation
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.bouncy,
      }),
      Animated.timing(logoOpacityAnim, {
        toValue: 1,
        duration: ANIMATION.duration.slow,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const { location } = useLocation();
  const { deals, featuredDeals, isLoading, refetch } = useDeals({
    category: selectedCategory,
    search: searchQuery,
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <AnimatedSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        isFocused={searchFocused}
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        variant="default"
      />

      {/* Featured Section */}
      {featuredDeals && featuredDeals.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Featured Deals"
            icon="flame"
            iconColor={COLORS.primary}
            iconBg={COLORS.primaryLighter}
            rightText="See All"
            onPressRight={() => router.push('/deals/featured')}
            delay={200}
          />
          <FlatList
            horizontal
            data={featuredDeals}
            renderItem={({ item, index }) => (
              <View style={[styles.featuredCardWrapper, index === 0 && styles.firstCard]}>
                <DealCard
                  deal={item}
                  variant="featured"
                  onPress={() => router.push(`/deal/${item.id}`)}
                  index={index}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            snapToInterval={280 + SPACING.md}
            decelerationRate="fast"
          />
        </View>
      )}

      {/* Nearby Section Header */}
      <SectionHeader
        title="Happening Now"
        isLive
        rightText="Map"
        onPressRight={() => router.push('/(tabs)/map')}
        delay={300}
      />
    </View>
  );

  const renderEmptyState = () => {
    const emptyScaleAnim = useRef(new Animated.Value(0.8)).current;
    const emptyOpacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(emptyScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...ANIMATION.spring.bouncy,
        }),
        Animated.timing(emptyOpacityAnim, {
          toValue: 1,
          duration: ANIMATION.duration.slow,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.emptyState,
          {
            transform: [{ scale: emptyScaleAnim }],
            opacity: emptyOpacityAnim,
          },
        ]}
      >
        <LinearGradient
          colors={GRADIENTS.primary}
          style={styles.emptyIconContainer}
        >
          <Ionicons name="search-outline" size={32} color={COLORS.white} />
        </LinearGradient>
        <Text style={styles.emptyTitle}>No deals found</Text>
        <Text style={styles.emptySubtext}>
          Try adjusting your filters or search to discover amazing deals nearby
        </Text>
        <Pressable
          style={styles.resetButton}
          onPress={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.resetButtonGradient}
          >
            <Ionicons name="refresh" size={18} color={COLORS.white} />
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Premium App Header */}
      <View style={styles.appHeader}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScaleAnim }],
              opacity: logoOpacityAnim,
            },
          ]}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBox}
          >
            <Text style={styles.logoLetter}>B</Text>
          </LinearGradient>
          <View style={styles.brandContainer}>
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.brandTextGradient}
            >
              <Text style={styles.brandName}>Buzz</Text>
            </LinearGradient>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>BETA</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.headerRight}>
          <AnimatedIconButton
            icon="notifications-outline"
            onPress={() => router.push('/notifications')}
            badge={3}
            delay={150}
          />
        </View>
      </View>

      <FlatList
        data={deals}
        renderItem={({ item, index }) => (
          <View style={styles.dealCardWrapper}>
            <DealCard
              deal={item}
              onPress={() => router.push(`/deal/${item.id}`)}
              index={index}
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
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.button,
  },
  logoLetter: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  brandContainer: {
    marginLeft: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextGradient: {
    borderRadius: RADIUS.xs,
  },
  brandName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    paddingHorizontal: SPACING.xs,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  logoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginLeft: SPACING.xs,
  },
  logoBadgeText: {
    fontSize: 8,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonWrapper: {},
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...SHADOWS.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    minWidth: 20,
    height: 20,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  header: {
    paddingBottom: SPACING.sm,
  },
  searchContainer: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  searchContainerFocused: {
    borderColor: COLORS.primary,
    ...SHADOWS.primary,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconFocused: {
    backgroundColor: COLORS.primary,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
  },
  clearButtonWrapper: {},
  clearButton: {
    padding: SPACING.xs,
  },
  clearIconContainer: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  sectionIconLive: {
    backgroundColor: COLORS.successLight,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.primaryLighter,
    borderRadius: RADIUS.full,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginRight: 2,
  },
  horizontalList: {
    paddingLeft: SPACING.base,
    paddingRight: SPACING.sm,
  },
  featuredCardWrapper: {
    marginRight: SPACING.md,
  },
  firstCard: {
    marginLeft: 0,
  },
  dealCardWrapper: {
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
  },
  listContent: {
    paddingBottom: SPACING['2xl'],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING['2xl'],
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: RADIUS['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.primary,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.relaxed,
    marginBottom: SPACING.xl,
  },
  resetButton: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  resetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  resetButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
});
