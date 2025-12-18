import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF6B35',
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  star: '#F59E0B',
};

interface Venue {
  id: string;
  name: string;
  type: string;
  address: string;
  logo_url: string;
  cover_image_url: string;
  rating?: number;
  review_count?: number;
  distance?: number;
}

interface VenueCardProps {
  venue: Venue;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

export function VenueCard({
  venue,
  onPress,
  onFavoritePress,
  isFavorite = false,
}: VenueCardProps) {
  const getTypeIcon = () => {
    switch (venue.type) {
      case 'bar':
        return 'beer';
      case 'restaurant':
        return 'restaurant';
      case 'club':
        return 'musical-notes';
      case 'hotel':
        return 'bed';
      case 'cafe':
        return 'cafe';
      default:
        return 'business';
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return null;
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{
          uri: venue.cover_image_url || venue.logo_url || 'https://via.placeholder.com/150',
        }}
        style={styles.image}
      />
      {onFavoritePress && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? COLORS.primary : COLORS.background}
          />
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.typeBadge}>
            <Ionicons name={getTypeIcon() as any} size={12} color={COLORS.primary} />
            <Text style={styles.typeText}>
              {venue.type.charAt(0).toUpperCase() + venue.type.slice(1)}
            </Text>
          </View>
          {venue.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.rating}>{venue.rating.toFixed(1)}</Text>
              {venue.review_count && (
                <Text style={styles.reviewCount}>({venue.review_count})</Text>
              )}
            </View>
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {venue.name}
        </Text>
        <View style={styles.footer}>
          <View style={styles.addressContainer}>
            <Ionicons
              name="location-outline"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={styles.address} numberOfLines={1}>
              {venue.address}
            </Text>
          </View>
          {venue.distance && (
            <Text style={styles.distance}>{formatDistance(venue.distance)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  address: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
