import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF6B35',
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  star: '#F59E0B',
  success: '#10B981',
};

interface Venue {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  logo_url?: string;
  rating?: number;
  active_deals_count?: number;
}

interface VenueMapCardProps {
  venue: Venue;
  onPress: () => void;
  onClose: () => void;
}

export function VenueMapCard({ venue, onPress, onClose }: VenueMapCardProps) {
  const openDirections = () => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?daddr=${venue.latitude},${venue.longitude}&dirflg=d`,
      android: `${scheme}${venue.latitude},${venue.longitude}?q=${venue.latitude},${venue.longitude}(${venue.name})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.content} onPress={onPress}>
        <Image
          source={{
            uri: venue.logo_url || 'https://via.placeholder.com/60',
          }}
          style={styles.logo}
        />
        <View style={styles.info}>
          <View style={styles.header}>
            <View style={styles.typeBadge}>
              <Ionicons name={getTypeIcon() as any} size={12} color={COLORS.primary} />
              <Text style={styles.typeText}>
                {venue.type.charAt(0).toUpperCase() + venue.type.slice(1)}
              </Text>
            </View>
            {venue.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color={COLORS.star} />
                <Text style={styles.rating}>{venue.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {venue.name}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {venue.address}
          </Text>
          {venue.active_deals_count && venue.active_deals_count > 0 && (
            <View style={styles.dealsContainer}>
              <Ionicons name="pricetag" size={12} color={COLORS.success} />
              <Text style={styles.dealsText}>
                {venue.active_deals_count} active{' '}
                {venue.active_deals_count === 1 ? 'deal' : 'deals'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={openDirections}>
          <Ionicons name="navigate" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={onPress}
        >
          <Text style={styles.primaryButtonText}>View Details</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dealsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dealsText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.background,
  },
});
