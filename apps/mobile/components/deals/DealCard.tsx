import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  variant?: 'default' | 'featured' | 'compact';
  onPress: () => void;
  index?: number;
}

export function DealCard({
  deal,
  variant = 'default',
  onPress,
  index = 0,
}: DealCardProps) {
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateYAnim, {
        toValue: 0,
        delay: index * 80,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, []);

  const getDiscountLabel = () => {
    switch (deal.discount_type) {
      case 'percentage':
        return `${deal.discount_value}%`;
      case 'fixed':
        return `$${deal.discount_value}`;
      case 'bogo':
        return 'BOGO';
      case 'free_item':
        return 'FREE';
      default:
        return 'DEAL';
    }
  };

  // Featured Card - Full width elegant card
  if (isFeatured) {
    return (
      <Animated.View
        style={[
          styles.featuredContainer,
          {
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
          <View style={styles.featuredCard}>
            <Image
              source={{
                uri: deal.image_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
              }}
              style={styles.featuredImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.featuredGradient}
            />

            {/* Discount Badge */}
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>{getDiscountLabel()}</Text>
            </View>

            {/* Content */}
            <View style={styles.featuredContent}>
              <Text style={styles.featuredVenue}>{deal.venue.name}</Text>
              <Text style={styles.featuredTitle} numberOfLines={2}>{deal.title}</Text>
              <View style={styles.featuredFooter}>
                <View style={styles.featuredPriceRow}>
                  <Text style={styles.featuredPrice}>${deal.deal_price}</Text>
                  {deal.original_price > 0 && (
                    <Text style={styles.featuredOriginal}>${deal.original_price}</Text>
                  )}
                </View>
                <View style={styles.featuredArrow}>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Default Card - Clean minimal design
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
        <View style={styles.card}>
          {/* Image */}
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri: deal.image_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
              }}
              style={styles.image}
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getDiscountLabel()}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.venue}>{deal.venue.name}</Text>
            <Text style={styles.title} numberOfLines={2}>{deal.title}</Text>

            <View style={styles.footer}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>${deal.deal_price}</Text>
                {deal.original_price > 0 && (
                  <Text style={styles.originalPrice}>${deal.original_price}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Default Card
  container: {
    marginBottom: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 110,
    height: 130,
    backgroundColor: COLORS.backgroundTertiary,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  venue: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  originalPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },

  // Featured Card
  featuredContainer: {
    width: SCREEN_WIDTH * 0.75,
    marginRight: 12,
  },
  featuredCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundTertiary,
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  featuredBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredVenue: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 22,
    marginBottom: 10,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  featuredOriginal: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'line-through',
  },
  featuredArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
