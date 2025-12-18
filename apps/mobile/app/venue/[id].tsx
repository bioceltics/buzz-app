import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useFavorites } from '../../hooks/useFavorites';
import { Colors } from '../../constants/colors';
import { formatDistance } from '../../utils/date';
import DealCard from '../../components/deals/DealCard';
import { getMockVenueById, getMockDealsByVenueId } from '../../hooks/useDeals';

const { width } = Dimensions.get('window');

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'deals' | 'events' | 'reviews'>('deals');
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        // Fallback to mock data
        const mockVenue = getMockVenueById(id as string);
        if (mockVenue) return mockVenue;
        throw err;
      }
    },
  });

  const { data: deals } = useQuery({
    queryKey: ['venue-deals', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('venue_id', id)
          .eq('is_active', true)
          .gte('end_time', new Date().toISOString())
          .order('start_time');
        if (error) throw error;
        if (data && data.length > 0) return data;
        // Fallback to mock data if no deals found
        return getMockDealsByVenueId(id as string);
      } catch (err) {
        // Fallback to mock data on error
        return getMockDealsByVenueId(id as string);
      }
    },
    enabled: !!id,
  });

  const { data: events } = useQuery({
    queryKey: ['venue-events', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('venue_id', id)
          .eq('is_active', true)
          .gte('start_time', new Date().toISOString())
          .order('start_time');
        if (error) throw error;
        return data || [];
      } catch (err) {
        // Return empty array on error for demo
        return [];
      }
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['venue-reviews', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`*, user:users(id, full_name, avatar_url)`)
          .eq('venue_id', id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (err) {
        // Return empty array on error for demo
        return [];
      }
    },
    enabled: !!id,
  });

  const openMaps = () => {
    if (venue) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`;
      Linking.openURL(url);
    }
  };

  const openPhone = () => {
    if (venue?.phone) {
      Linking.openURL(`tel:${venue.phone}`);
    }
  };

  const openWebsite = () => {
    if (venue?.website) {
      Linking.openURL(venue.website);
    }
  };

  const startChat = () => {
    router.push(`/chat/${id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Venue not found</Text>
      </View>
    );
  }

  const favorited = isFavorite(venue.id);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: venue.cover_image_url || venue.logo_url || 'https://via.placeholder.com/400x200' }}
            style={styles.coverImage}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(venue.id)}
          >
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={24}
              color={favorited ? Colors.error : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Venue Info */}
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            {venue.logo_url && (
              <Image source={{ uri: venue.logo_url }} style={styles.logo} />
            )}
            <View style={styles.headerText}>
              <Text style={styles.name}>{venue.name}</Text>
              <Text style={styles.type}>{venue.type}</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color={Colors.warning} />
            <Text style={styles.rating}>{venue.rating?.toFixed(1) || 'New'}</Text>
            <Text style={styles.reviewCount}>({venue.review_count} reviews)</Text>
            <Text style={styles.priceRange}>
              {'$'.repeat(venue.price_range || 2)}
            </Text>
          </View>

          <Text style={styles.address}>{venue.address}</Text>

          {venue.description && (
            <Text style={styles.description}>{venue.description}</Text>
          )}

          {/* Quick Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={openMaps}>
              <Ionicons name="navigate" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>
            {venue.phone && (
              <TouchableOpacity style={styles.actionButton} onPress={openPhone}>
                <Ionicons name="call" size={24} color={Colors.primary} />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
            )}
            {venue.website && (
              <TouchableOpacity style={styles.actionButton} onPress={openWebsite}>
                <Ionicons name="globe" size={24} color={Colors.primary} />
                <Text style={styles.actionText}>Website</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={startChat}>
              <Ionicons name="chatbubble" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'deals' && styles.activeTab]}
            onPress={() => setActiveTab('deals')}
          >
            <Text style={[styles.tabText, activeTab === 'deals' && styles.activeTabText]}>
              Deals ({deals?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && styles.activeTab]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
              Events ({events?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews ({reviews?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'deals' && (
            deals?.length === 0 ? (
              <Text style={styles.emptyText}>No active deals</Text>
            ) : (
              deals?.map((deal) => (
                <DealCard key={deal.id} deal={{ ...deal, venue }} />
              ))
            )
          )}

          {activeTab === 'events' && (
            events?.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming events</Text>
            ) : (
              events?.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => router.push(`/event/${event.id}`)}
                >
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(event.start_time).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.eventType}>{event.type}</Text>
                </TouchableOpacity>
              ))
            )
          )}

          {activeTab === 'reviews' && (
            <>
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => router.push(`/review/write?venue_id=${id}`)}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.writeReviewText}>Write a Review</Text>
              </TouchableOpacity>
              {reviews?.length === 0 ? (
                <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
              ) : (
                reviews?.map((review: any) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Image
                        source={{ uri: review.user?.avatar_url || 'https://via.placeholder.com/40' }}
                        style={styles.reviewerAvatar}
                      />
                      <View>
                        <Text style={styles.reviewerName}>{review.user?.full_name || 'Anonymous'}</Text>
                        <View style={styles.reviewRating}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= review.rating ? 'star' : 'star-outline'}
                              size={14}
                              color={Colors.warning}
                            />
                          ))}
                          {review.is_verified_visit && (
                            <View style={styles.verifiedBadge}>
                              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                              <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                    <Text style={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  coverContainer: {
    position: 'relative',
  },
  coverImage: {
    width,
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  type: {
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  priceRange: {
    marginLeft: 'auto',
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  address: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    paddingVertical: 24,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  eventType: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  writeReviewText: {
    color: '#fff',
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: Colors.success,
    marginLeft: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
