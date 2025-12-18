import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION, GRADIENTS } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Deal {
  id: string;
  title: string;
  description: string;
  type: string;
  discount_type: string;
  discount_value: number;
  original_price: number;
  deal_price: number;
  image_url: string;
  start_time: string;
  end_time: string;
  venue: {
    id: string;
    name: string;
    type: string;
    logo_url: string;
    address: string;
  };
}

interface DealCardProps {
  deal: Deal;
  variant?: 'default' | 'featured' | 'compact' | 'premium';
  onPress: () => void;
  index?: number;
  animateOnMount?: boolean;
}

export function DealCard({
  deal,
  variant = 'default',
  onPress,
  index = 0,
  animateOnMount = true,
}: DealCardProps) {
  const isFeatured = variant === 'featured';
  const isPremium = variant === 'premium';
  const isCompact = variant === 'compact';
  const isExpiringSoon = new Date(deal.end_time).getTime() - Date.now() < 3600000;

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(animateOnMount ? 40 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const imageScaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mount animation
  useEffect(() => {
    if (animateOnMount) {
      Animated.parallel([
        Animated.spring(translateYAnim, {
          toValue: 0,
          delay: index * 100,
          useNativeDriver: true,
          ...ANIMATION.spring.smooth,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: ANIMATION.duration.slow,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Pulse animation for urgent badge
    if (isExpiringSoon) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animateOnMount, index, isExpiringSoon]);

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: ANIMATION.scale.pressedSm,
        useNativeDriver: true,
        ...ANIMATION.spring.snappy,
      }),
      Animated.timing(imageScaleAnim, {
        toValue: 1.1,
        duration: ANIMATION.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: ANIMATION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.bouncy,
      }),
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.smooth,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: ANIMATION.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getDiscountLabel = () => {
    switch (deal.discount_type) {
      case 'percentage':
        return `${deal.discount_value}% OFF`;
      case 'fixed':
        return `$${deal.discount_value} OFF`;
      case 'bogo':
        return 'BOGO';
      case 'free_item':
        return 'FREE ITEM';
      default:
        return 'DEAL';
    }
  };

  const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (deal.type) {
      case 'happy_hour':
        return 'beer';
      case 'flash_deal':
        return 'flash';
      case 'event':
        return 'calendar';
      case 'recurring':
        return 'repeat';
      default:
        return 'pricetag';
    }
  };

  const getTypeLabel = () => {
    switch (deal.type) {
      case 'happy_hour':
        return 'Happy Hour';
      case 'flash_deal':
        return 'Flash Deal';
      case 'event':
        return 'Event';
      case 'recurring':
        return 'Daily';
      default:
        return 'Deal';
    }
  };

  const animatedContainerStyle = {
    transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
    opacity: opacityAnim,
  };

  // Premium Featured Card
  if (isPremium || isFeatured) {
    const cardWidth = isPremium ? SCREEN_WIDTH - SPACING.base * 2 : SCREEN_WIDTH * 0.85;
    const cardHeight = isPremium ? 280 : 240;

    return (
      <Animated.View style={[animatedContainerStyle, { marginRight: isFeatured ? SPACING.md : 0 }]}>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
          <View style={[styles.premiumContainer, { width: cardWidth, height: cardHeight }]}>
            {/* Image with parallax effect */}
            <Animated.View style={[styles.imageWrapper, { transform: [{ scale: imageScaleAnim }] }]}>
              <Image
                source={{
                  uri: deal.image_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
                }}
                style={styles.premiumImage}
              />
            </Animated.View>

            {/* Gradient overlays */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
              locations={[0, 0.5, 1]}
              style={styles.premiumGradient}
            />

            {/* Glowing edge effect */}
            <Animated.View
              style={[
                styles.glowBorder,
                {
                  opacity: glowAnim,
                  borderColor: COLORS.primary,
                },
              ]}
            />

            {/* Top Badges */}
            <View style={styles.premiumTopRow}>
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.discountBadgePremium}
              >
                <Ionicons name="flash" size={14} color={COLORS.white} />
                <Text style={styles.discountTextPremium}>{getDiscountLabel()}</Text>
              </LinearGradient>

              {isExpiringSoon && (
                <Animated.View style={[styles.urgentBadgePremium, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.urgentDot} />
                  <Text style={styles.urgentTextPremium}>Ends Soon</Text>
                </Animated.View>
              )}
            </View>

            {/* Bottom Content with Glass effect */}
            <View style={styles.premiumContent}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={25} tint="dark" style={styles.premiumBlur}>
                  <PremiumCardContent deal={deal} getTypeIcon={getTypeIcon} getTypeLabel={getTypeLabel} />
                </BlurView>
              ) : (
                <View style={[styles.premiumBlur, styles.androidBlurFallback]}>
                  <PremiumCardContent deal={deal} getTypeIcon={getTypeIcon} getTypeLabel={getTypeLabel} />
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Default Card Layout
  return (
    <Animated.View style={animatedContainerStyle}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
        <View style={[styles.container, isCompact && styles.containerCompact]}>
          {/* Image with animation */}
          <View style={styles.imageContainer}>
            <Animated.View style={{ transform: [{ scale: imageScaleAnim }] }}>
              <Image
                source={{
                  uri: deal.image_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300',
                }}
                style={[styles.image, isCompact && styles.imageCompact]}
              />
            </Animated.View>

            {/* Discount Badge with gradient */}
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.discountBadge}
            >
              <Text style={styles.discountText}>{getDiscountLabel()}</Text>
            </LinearGradient>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.typeBadge}>
                <Ionicons name={getTypeIcon()} size={11} color={COLORS.primary} />
                <Text style={styles.typeText}>{getTypeLabel()}</Text>
              </View>
              {isExpiringSoon && (
                <Animated.View style={[styles.timerBadge, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.timerDot} />
                  <Text style={styles.timerText}>Ending soon</Text>
                </Animated.View>
              )}
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {deal.title}
            </Text>

            {/* Venue Info */}
            <View style={styles.venueRow}>
              <Image
                source={{ uri: deal.venue.logo_url || 'https://via.placeholder.com/24' }}
                style={styles.venueLogo}
              />
              <Text style={styles.venueName} numberOfLines={1}>
                {deal.venue.name}
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.priceContainer}>
                {deal.original_price > 0 && (
                  <Text style={styles.originalPrice}>${deal.original_price}</Text>
                )}
                <Text style={styles.dealPrice}>${deal.deal_price}</Text>
              </View>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>View</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Premium card content component
function PremiumCardContent({
  deal,
  getTypeIcon,
  getTypeLabel,
}: {
  deal: Deal;
  getTypeIcon: () => keyof typeof Ionicons.glyphMap;
  getTypeLabel: () => string;
}) {
  return (
    <View style={styles.premiumInner}>
      <View style={styles.typePill}>
        <Ionicons name={getTypeIcon()} size={12} color={COLORS.white} />
        <Text style={styles.typePillText}>{getTypeLabel()}</Text>
      </View>

      <Text style={styles.premiumTitle} numberOfLines={2}>
        {deal.title}
      </Text>

      <View style={styles.premiumVenueRow}>
        <Image
          source={{ uri: deal.venue.logo_url || 'https://via.placeholder.com/40' }}
          style={styles.premiumVenueLogo}
        />
        <View style={styles.premiumVenueInfo}>
          <Text style={styles.premiumVenueName} numberOfLines={1}>
            {deal.venue.name}
          </Text>
          <View style={styles.premiumLocationRow}>
            <Ionicons name="location" size={11} color="rgba(255,255,255,0.6)" />
            <Text style={styles.premiumAddress} numberOfLines={1}>
              {deal.venue.address}
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={GRADIENTS.success}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumPriceTag}
        >
          <Text style={styles.premiumPriceLabel}>NOW</Text>
          <Text style={styles.premiumPrice}>${deal.deal_price}</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Default Container
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  containerCompact: {
    borderRadius: RADIUS.xl,
  },

  // Image
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: 120,
    height: 150,
    backgroundColor: COLORS.backgroundTertiary,
  },
  imageCompact: {
    width: 100,
    height: 120,
  },

  // Discount Badge
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  discountText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  typeText: {
    fontSize: TYPOGRAPHY.sizes['2xs'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  timerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    marginRight: 4,
  },
  timerText: {
    fontSize: TYPOGRAPHY.sizes['2xs'],
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.error,
  },

  // Title
  title: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },

  // Venue Row
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  venueLogo: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundTertiary,
    marginRight: SPACING.sm,
  },
  venueName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
    marginRight: SPACING.sm,
  },
  dealPrice: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.heavy,
    color: COLORS.success,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginRight: 4,
  },

  // Premium/Featured Styles
  premiumContainer: {
    borderRadius: RADIUS['3xl'],
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  imageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  premiumImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundTertiary,
  },
  premiumGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS['3xl'],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  premiumTopRow: {
    position: 'absolute',
    top: SPACING.base,
    left: SPACING.base,
    right: SPACING.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  discountBadgePremium: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    ...SHADOWS.primary,
  },
  discountTextPremium: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.heavy,
    color: COLORS.white,
    marginLeft: SPACING.xs,
    letterSpacing: 0.5,
  },
  urgentBadgePremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
  },
  urgentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginRight: SPACING.xs,
  },
  urgentTextPremium: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  premiumContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: RADIUS['3xl'],
    borderBottomRightRadius: RADIUS['3xl'],
    overflow: 'hidden',
  },
  premiumBlur: {
    padding: SPACING.base,
  },
  androidBlurFallback: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  premiumInner: {},
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  typePillText: {
    fontSize: TYPOGRAPHY.sizes['2xs'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.heavy,
    color: COLORS.white,
    marginBottom: SPACING.md,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumVenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumVenueLogo: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  premiumVenueInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  premiumVenueName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  premiumLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  premiumAddress: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 3,
    flex: 1,
  },
  premiumPriceTag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.success,
  },
  premiumPriceLabel: {
    fontSize: TYPOGRAPHY.sizes['2xs'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  premiumPrice: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.heavy,
    color: COLORS.white,
  },
});
