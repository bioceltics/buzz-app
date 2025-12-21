import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Deal {
  id: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  start_time: string;
  end_time: string;
  redemption_count: number;
  max_redemptions: number | null;
  image_url: string | null;
}

export default function VenueDealsScreen() {
  const { venue } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: deals, refetch, isLoading } = useQuery({
    queryKey: ['venue-deals', venue?.id],
    queryFn: async () => {
      if (!venue) return [];
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('venue_id', venue.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!venue,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('deals')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-deals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-deals'] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (id: string, title: string) => {
    const message = `Are you sure you want to delete "${title}"? This cannot be undone.`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        deleteMutation.mutate(id);
      }
    } else {
      Alert.alert('Delete Deal', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]);
    }
  };

  const getDiscountText = (deal: Deal) => {
    switch (deal.discount_type) {
      case 'percentage':
        return `${deal.discount_value}% OFF`;
      case 'fixed':
        return `$${deal.discount_value} OFF`;
      case 'bogo':
        return 'BOGO';
      case 'free_item':
        return 'FREE';
      default:
        return 'DEAL';
    }
  };

  const getDiscountGradient = (type: string): [string, string] => {
    switch (type) {
      case 'percentage':
        return [COLORS.primary, '#D81B60'];
      case 'fixed':
        return ['#6366F1', '#8B5CF6'];
      case 'bogo':
        return ['#059669', '#10B981'];
      case 'free_item':
        return ['#D97706', '#F59E0B'];
      default:
        return [COLORS.primary, '#D81B60'];
    }
  };

  const isExpired = (deal: Deal) => new Date(deal.end_time) < new Date();

  const getTimeRemaining = (deal: Deal) => {
    const end = new Date(deal.end_time);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  const renderDeal = ({ item }: { item: Deal }) => {
    const expired = isExpired(item);
    const active = item.is_active && !expired;

    return (
      <View style={styles.dealCard}>
        {/* Image Section */}
        <View style={styles.dealImageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.dealImage} />
          ) : (
            <LinearGradient
              colors={['#F3F4F6', '#E5E7EB']}
              style={styles.dealImagePlaceholder}
            >
              <Ionicons name="image-outline" size={40} color={COLORS.textTertiary} />
            </LinearGradient>
          )}

          {/* Discount Badge */}
          <View style={styles.discountBadgeContainer}>
            <LinearGradient
              colors={active ? getDiscountGradient(item.discount_type) : ['#6B7280', '#9CA3AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.discountBadge}
            >
              <Text style={styles.discountText}>{getDiscountText(item)}</Text>
            </LinearGradient>
          </View>

          {/* Status Indicator */}
          <View style={[
            styles.statusIndicator,
            { backgroundColor: active ? '#10B981' : expired ? '#EF4444' : '#F59E0B' }
          ]}>
            <View style={styles.statusDot} />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.dealContent}>
          <View style={styles.dealHeader}>
            <Text style={styles.dealTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[
              styles.statusBadge,
              active ? styles.activeBadge : expired ? styles.expiredBadge : styles.pausedBadge
            ]}>
              <Text style={[
                styles.statusText,
                active ? styles.activeText : expired ? styles.expiredText : styles.pausedText
              ]}>
                {expired ? 'Expired' : active ? 'Active' : 'Paused'}
              </Text>
            </View>
          </View>

          <Text style={styles.dealDescription} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="ticket-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statText}>
                {item.redemption_count}{item.max_redemptions ? `/${item.max_redemptions}` : ''} redeemed
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{getTimeRemaining(item)}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.dealActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push(`/edit-deal?id=${item.id}`)}
            >
              <LinearGradient
                colors={[COLORS.primaryLighter, '#FCE7F3']}
                style={styles.actionBtnGradient}
              >
                <Ionicons name="pencil" size={18} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>Edit</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => toggleMutation.mutate({ id: item.id, is_active: !item.is_active })}
            >
              <LinearGradient
                colors={item.is_active ? ['#FEF3C7', '#FDE68A'] : ['#D1FAE5', '#A7F3D0']}
                style={styles.actionBtnGradient}
              >
                <Ionicons
                  name={item.is_active ? 'pause' : 'play'}
                  size={18}
                  color={item.is_active ? '#D97706' : '#059669'}
                />
                <Text style={[
                  styles.actionBtnText,
                  { color: item.is_active ? '#D97706' : '#059669' }
                ]}>
                  {item.is_active ? 'Pause' : 'Activate'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.id, item.title)}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Deals</Text>
          <Text style={styles.headerSubtitle}>
            {deals?.length || 0} deals • {deals?.filter(d => d.is_active).length || 0} active
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-deal')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, '#D81B60']}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={26} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Deals List */}
      <FlatList
        data={deals}
        renderItem={renderDeal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[COLORS.primaryLighter, '#FDF2F8']}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="pricetag-outline" size={48} color={COLORS.primary} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No deals yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first deal to start attracting customers
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create-deal')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, '#D81B60']}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add" size={22} color={COLORS.white} />
                <Text style={styles.createButtonText}>Create Deal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.primary,
  },
  addButtonGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  dealCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  dealImageContainer: {
    position: 'relative',
    height: 160,
  },
  dealImage: {
    width: '100%',
    height: '100%',
  },
  dealImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  discountBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  dealContent: {
    padding: 18,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  pausedBadge: {
    backgroundColor: '#FEF3C7',
  },
  expiredBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#059669',
  },
  pausedText: {
    color: '#D97706',
  },
  expiredText: {
    color: '#DC2626',
  },
  dealDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dealActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.primary,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
