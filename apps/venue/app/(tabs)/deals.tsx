import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SHADOWS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '@/constants/colors';
import { HeaderWithAction, EmptyState, StatusBadge, StatCard } from '@/components/ui';
import { useScreenRefresh, useConfirmDialog } from '@/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MainTab = 'deals' | 'insights';
type InsightSubTab = 'analytics' | 'ai';

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

interface DemandHour {
  hour: string;
  level: 'low' | 'medium' | 'busy' | 'peak';
  percentage: number;
}

interface CustomerSegment {
  name: string;
  size: number;
  avgSpend: number;
  churnRisk: 'low' | 'medium' | 'high';
  preferredDeals: string[];
}

interface PopularDeal {
  name: string;
  score: number;
  badge: 'hot' | 'trending' | 'popular' | 'new';
}

export default function VenueDealsScreen() {
  const { venue } = useAuth();
  const queryClient = useQueryClient();
  const { showDeleteDialog } = useConfirmDialog();
  const [mainTab, setMainTab] = useState<MainTab>('deals');
  const [insightTab, setInsightTab] = useState<InsightSubTab>('analytics');

  // Fetch deals
  const { data: deals, refetch: refetchDeals, isLoading } = useQuery({
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

  // Fetch analytics data
  const { data: analytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ['venue-analytics', venue?.id],
    queryFn: async () => {
      if (!venue) return null;

      const { data: dealsData } = await supabase
        .from('deals')
        .select('id, title, redemption_count, is_active, created_at')
        .eq('venue_id', venue.id);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentRedemptions } = await supabase
        .from('redemptions')
        .select('id, redeemed_at, deal_id')
        .eq('venue_id', venue.id)
        .gte('redeemed_at', sevenDaysAgo.toISOString());

      const dailyData: { [key: string]: number } = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayKey = days[date.getDay()];
        dailyData[dayKey] = 0;
      }

      recentRedemptions?.forEach((r) => {
        const date = new Date(r.redeemed_at);
        const dayKey = days[date.getDay()];
        if (dailyData[dayKey] !== undefined) {
          dailyData[dayKey]++;
        }
      });

      const topDeals = [...(dealsData || [])]
        .sort((a, b) => (b.redemption_count || 0) - (a.redemption_count || 0))
        .slice(0, 5);

      return {
        totalDeals: dealsData?.length || 0,
        activeDeals: dealsData?.filter((d) => d.is_active).length || 0,
        totalRedemptions: dealsData?.reduce((sum, d) => sum + (d.redemption_count || 0), 0) || 0,
        weeklyRedemptions: recentRedemptions?.length || 0,
        dailyData,
        topDeals,
      };
    },
    enabled: !!venue,
  });

  const maxDailyValue = analytics ? Math.max(...Object.values(analytics.dailyData), 1) : 1;

  // Mock AI data
  const aiStats = {
    accuracy: 78,
    engagementLift: 23,
    revenueImpact: 18,
    fraudPrevented: 1250,
  };

  const demandForecast: DemandHour[] = [
    { hour: '11 AM', level: 'low', percentage: 25 },
    { hour: '12 PM', level: 'medium', percentage: 45 },
    { hour: '1 PM', level: 'busy', percentage: 70 },
    { hour: '2 PM', level: 'medium', percentage: 50 },
    { hour: '5 PM', level: 'busy', percentage: 75 },
    { hour: '6 PM', level: 'peak', percentage: 95 },
    { hour: '7 PM', level: 'peak', percentage: 90 },
    { hour: '8 PM', level: 'busy', percentage: 80 },
  ];

  const pricingRecommendation = {
    discount: 25,
    predictedRedemptions: 45,
    confidence: 82,
    competitorAvg: 20,
    predictedRevenue: 1850,
  };

  const customerSegments: CustomerSegment[] = [
    {
      name: 'Happy Hour Regulars',
      size: 234,
      avgSpend: 45,
      churnRisk: 'low',
      preferredDeals: ['2-for-1', 'Happy Hour'],
    },
    {
      name: 'Weekend Warriors',
      size: 156,
      avgSpend: 78,
      churnRisk: 'medium',
      preferredDeals: ['Special Events', 'VIP'],
    },
    {
      name: 'Deal Hunters',
      size: 89,
      avgSpend: 32,
      churnRisk: 'high',
      preferredDeals: ['Flash Deals', 'BOGO'],
    },
  ];

  const popularDeals: PopularDeal[] = [
    { name: '2-for-1 Cocktails', score: 95, badge: 'hot' },
    { name: '50% Off Appetizers', score: 87, badge: 'trending' },
    { name: 'Happy Hour Special', score: 82, badge: 'popular' },
  ];

  const { refreshing, handleRefresh } = useScreenRefresh({
    onRefresh: async () => {
      await Promise.all([refetchDeals(), refetchAnalytics()]);
    },
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

  const handleDelete = (id: string, title: string) => {
    showDeleteDialog(title, () => deleteMutation.mutate(id));
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

  const getDealStatus = (deal: Deal): 'active' | 'paused' | 'expired' => {
    if (isExpired(deal)) return 'expired';
    return deal.is_active ? 'active' : 'paused';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#60A5FA';
      case 'medium': return '#34D399';
      case 'busy': return '#FBBF24';
      case 'peak': return '#F87171';
      default: return COLORS.textTertiary;
    }
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'hot': return { bg: '#FEE2E2', color: '#DC2626' };
      case 'trending': return { bg: '#FEF3C7', color: '#D97706' };
      case 'popular': return { bg: '#DCFCE7', color: '#16A34A' };
      case 'new': return { bg: '#E0E7FF', color: '#4F46E5' };
      default: return { bg: COLORS.backgroundSecondary, color: COLORS.textSecondary };
    }
  };

  const getChurnColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#22C55E';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return COLORS.textTertiary;
    }
  };

  const renderDeal = ({ item }: { item: Deal }) => {
    const expired = isExpired(item);
    const active = item.is_active && !expired;
    const status = getDealStatus(item);

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
            <StatusBadge status={status} size="sm" />
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

  const activeDeals = deals?.filter(d => d.is_active).length || 0;

  const renderInsightsContent = () => (
    <ScrollView
      style={styles.insightsScrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Insight Sub-Tab Selector */}
      <View style={styles.insightTabContainer}>
        <TouchableOpacity
          style={[styles.insightTab, insightTab === 'analytics' && styles.insightTabActive]}
          onPress={() => setInsightTab('analytics')}
        >
          <LinearGradient
            colors={insightTab === 'analytics' ? GRADIENTS.primary : [COLORS.bgGray100, COLORS.bgGray200]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.insightTabIconContainer}
          >
            <Ionicons
              name="bar-chart"
              size={16}
              color={insightTab === 'analytics' ? COLORS.white : COLORS.textTertiary}
            />
          </LinearGradient>
          <Text style={[styles.insightTabText, insightTab === 'analytics' && styles.insightTabTextActive]}>
            Analytics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.insightTab, insightTab === 'ai' && styles.insightTabActive]}
          onPress={() => setInsightTab('ai')}
        >
          <LinearGradient
            colors={insightTab === 'ai' ? GRADIENTS.secondary : [COLORS.bgGray100, COLORS.bgGray200]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.insightTabIconContainer}
          >
            <Ionicons
              name="sparkles"
              size={16}
              color={insightTab === 'ai' ? COLORS.white : COLORS.textTertiary}
            />
          </LinearGradient>
          <Text style={[styles.insightTabText, insightTab === 'ai' && styles.insightTabTextActive]}>
            AI Insights
          </Text>
        </TouchableOpacity>
      </View>

      {insightTab === 'analytics' ? (
        <>
          {/* Analytics Stats Grid */}
          <View style={styles.insightStatsGrid}>
            <StatCard
              icon="flash"
              value={analytics?.activeDeals || 0}
              label="Active Deals"
              iconGradient={GRADIENTS.primary}
              iconColor={COLORS.white}
            />
            <StatCard
              icon="ticket"
              value={analytics?.totalRedemptions || 0}
              label="Total Redemptions"
              iconGradient={GRADIENTS.success}
              iconColor={COLORS.white}
            />
            <StatCard
              icon="calendar"
              value={analytics?.weeklyRedemptions || 0}
              label="This Week"
              iconGradient={GRADIENTS.warning}
              iconColor={COLORS.white}
            />
            <StatCard
              icon="layers"
              value={analytics?.totalDeals || 0}
              label="Total Deals"
              iconGradient={GRADIENTS.secondary}
              iconColor={COLORS.white}
            />
          </View>

          {/* Weekly Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Weekly Redemptions</Text>
              <View style={styles.chartBadge}>
                <Ionicons name="trending-up" size={14} color="#059669" />
                <Text style={styles.chartBadgeText}>Last 7 days</Text>
              </View>
            </View>

            <View style={styles.chart}>
              {analytics &&
                Object.entries(analytics.dailyData).map(([day, value], index) => {
                  const isToday = index === Object.keys(analytics.dailyData).length - 1;
                  const heightPercent = (value / maxDailyValue) * 100;

                  return (
                    <View key={day} style={styles.chartColumn}>
                      <View style={styles.barWrapper}>
                        <LinearGradient
                          colors={isToday ? [COLORS.primary, '#D81B60'] : ['#E5E7EB', '#D1D5DB']}
                          style={[
                            styles.bar,
                            { height: `${Math.max(heightPercent, 8)}%` },
                          ]}
                        />
                      </View>
                      <Text style={[styles.barValue, isToday && styles.barValueActive]}>
                        {value}
                      </Text>
                      <Text style={[styles.barLabel, isToday && styles.barLabelActive]}>
                        {day}
                      </Text>
                    </View>
                  );
                })}
            </View>
          </View>

          {/* Top Deals */}
          <View style={styles.topDealsCard}>
            <View style={styles.topDealsHeader}>
              <Text style={styles.chartTitle}>Top Performing Deals</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setMainTab('deals')}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {analytics?.topDeals.length === 0 ? (
              <View style={styles.emptyDeals}>
                <LinearGradient
                  colors={[COLORS.primaryLighter, '#FDF2F8']}
                  style={styles.emptyIcon}
                >
                  <Ionicons name="trophy-outline" size={32} color={COLORS.primary} />
                </LinearGradient>
                <Text style={styles.emptyText}>No deals yet</Text>
                <Text style={styles.emptySubtext}>Create your first deal to see performance</Text>
              </View>
            ) : (
              analytics?.topDeals.map((deal, index) => (
                <View
                  key={deal.id}
                  style={[
                    styles.topDealItem,
                    index === analytics.topDeals.length - 1 && styles.lastDealItem,
                  ]}
                >
                  <LinearGradient
                    colors={
                      index === 0
                        ? ['#FFD700', '#FFA500']
                        : index === 1
                        ? ['#C0C0C0', '#A0A0A0']
                        : index === 2
                        ? ['#CD7F32', '#B87333']
                        : ['#E5E7EB', '#D1D5DB']
                    }
                    style={styles.rankBadge}
                  >
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </LinearGradient>

                  <View style={styles.topDealInfo}>
                    <Text style={styles.topDealName} numberOfLines={1}>
                      {deal.title}
                    </Text>
                    <View style={styles.dealMeta}>
                      <View
                        style={[
                          styles.dealStatusDot,
                          { backgroundColor: deal.is_active ? '#10B981' : '#9CA3AF' },
                        ]}
                      />
                      <Text style={styles.dealMetaText}>
                        {deal.is_active ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.redemptionCount}>
                    <Text style={styles.countValue}>{deal.redemption_count || 0}</Text>
                    <Text style={styles.countLabel}>redeems</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      ) : (
        <>
          {/* AI Stats Grid */}
          <View style={styles.insightStatsGrid}>
            <StatCard
              icon="analytics"
              value={`${aiStats.accuracy}%`}
              label="Accuracy"
              iconGradient={GRADIENTS.secondary}
              iconColor={COLORS.white}
            />
            <StatCard
              icon="trending-up"
              value={`+${aiStats.engagementLift}%`}
              label="Engagement"
              iconGradient={GRADIENTS.success}
              iconColor={COLORS.white}
            />
            <StatCard
              icon="cash"
              value={`+${aiStats.revenueImpact}%`}
              label="Revenue"
              iconGradient={GRADIENTS.warning}
              iconColor={COLORS.white}
            />
            <StatCard
              icon="shield-checkmark"
              value={`$${aiStats.fraudPrevented}`}
              label="Saved"
              iconGradient={GRADIENTS.info}
              iconColor={COLORS.white}
            />
          </View>

          {/* Demand Forecast */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#3B82F6', '#60A5FA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="time" size={18} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Demand Forecast</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Predicted traffic for today</Text>
            <View style={styles.demandChart}>
              {demandForecast.map((hour, index) => (
                <View key={index} style={styles.demandBar}>
                  <View style={styles.demandBarContainer}>
                    <View
                      style={[
                        styles.demandBarFill,
                        {
                          height: `${hour.percentage}%`,
                          backgroundColor: getLevelColor(hour.level),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.demandHour}>{hour.hour}</Text>
                </View>
              ))}
            </View>
            <View style={styles.demandLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#60A5FA' }]} />
                <Text style={styles.legendText}>Low</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#34D399' }]} />
                <Text style={styles.legendText}>Medium</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
                <Text style={styles.legendText}>Busy</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F87171' }]} />
                <Text style={styles.legendText}>Peak</Text>
              </View>
            </View>
          </View>

          {/* Pricing Optimization */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="pricetag" size={18} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Pricing Optimization</Text>
            </View>
            <Text style={styles.sectionSubtitle}>AI-recommended discount for maximum impact</Text>

            <LinearGradient
              colors={[COLORS.primary + '15', COLORS.primary + '05']}
              style={styles.pricingCard}
            >
              <View style={styles.pricingMain}>
                <Text style={styles.pricingValue}>{pricingRecommendation.discount}%</Text>
                <Text style={styles.pricingLabel}>Recommended Discount</Text>
              </View>
              <View style={styles.pricingStats}>
                <View style={styles.pricingStat}>
                  <Text style={styles.pricingStatValue}>{pricingRecommendation.predictedRedemptions}</Text>
                  <Text style={styles.pricingStatLabel}>Est. Redemptions</Text>
                </View>
                <View style={styles.pricingStat}>
                  <Text style={styles.pricingStatValue}>{pricingRecommendation.confidence}%</Text>
                  <Text style={styles.pricingStatLabel}>Confidence</Text>
                </View>
                <View style={styles.pricingStat}>
                  <Text style={styles.pricingStatValue}>${pricingRecommendation.predictedRevenue}</Text>
                  <Text style={styles.pricingStatLabel}>Est. Revenue</Text>
                </View>
              </View>
              <View style={styles.competitorNote}>
                <Ionicons name="information-circle" size={16} color={COLORS.textSecondary} />
                <Text style={styles.competitorNoteText}>
                  Competitor average: {pricingRecommendation.competitorAvg}% off
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Customer Segments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={GRADIENTS.secondary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="people" size={18} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Customer Segments</Text>
            </View>
            <Text style={styles.sectionSubtitle}>AI-identified customer groups</Text>

            {customerSegments.map((segment, index) => (
              <View key={index} style={styles.segmentCard}>
                <View style={styles.segmentHeader}>
                  <Text style={styles.segmentName}>{segment.name}</Text>
                  <View style={[styles.churnBadge, { backgroundColor: getChurnColor(segment.churnRisk) + '20' }]}>
                    <Text style={[styles.churnText, { color: getChurnColor(segment.churnRisk) }]}>
                      {segment.churnRisk} risk
                    </Text>
                  </View>
                </View>
                <View style={styles.segmentStats}>
                  <View style={styles.segmentStat}>
                    <Text style={styles.segmentStatValue}>{segment.size}</Text>
                    <Text style={styles.segmentStatLabel}>Customers</Text>
                  </View>
                  <View style={styles.segmentStat}>
                    <Text style={styles.segmentStatValue}>${segment.avgSpend}</Text>
                    <Text style={styles.segmentStatLabel}>Avg Spend</Text>
                  </View>
                </View>
                <View style={styles.preferredDeals}>
                  {segment.preferredDeals.map((deal, i) => (
                    <View key={i} style={styles.preferredDealTag}>
                      <Text style={styles.preferredDealTagText}>{deal}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Popular Deals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="flame" size={18} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Deal Popularity</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Real-time popularity scores</Text>

            {popularDeals.map((deal, index) => {
              const badgeStyle = getBadgeStyle(deal.badge);
              return (
                <View key={index} style={styles.popularDealCard}>
                  <View style={styles.popularDealRank}>
                    <Text style={styles.popularDealRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.popularDealInfo}>
                    <Text style={styles.popularDealName}>{deal.name}</Text>
                    <View style={styles.popularDealScore}>
                      <View style={styles.scoreBar}>
                        <View style={[styles.scoreBarFill, { width: `${deal.score}%` }]} />
                      </View>
                      <Text style={styles.scoreText}>{deal.score}</Text>
                    </View>
                  </View>
                  <View style={[styles.popularDealBadge, { backgroundColor: badgeStyle.bg }]}>
                    <Text style={[styles.popularDealBadgeText, { color: badgeStyle.color }]}>
                      {deal.badge.toUpperCase()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <HeaderWithAction
        title="Deals"
        subtitle={mainTab === 'deals' ? `${deals?.length || 0} deals • ${activeDeals} active` : venue?.name}
        rightAction={mainTab === 'deals' ? {
          icon: 'add',
          onPress: () => router.push('/create-deal'),
          gradient: [COLORS.primary, '#D81B60'],
        } : undefined}
      />

      {/* Main Tab Selector */}
      <View style={styles.mainTabContainer}>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'deals' && styles.mainTabActive]}
          onPress={() => setMainTab('deals')}
        >
          <LinearGradient
            colors={mainTab === 'deals' ? GRADIENTS.primary : [COLORS.bgGray100, COLORS.bgGray200]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainTabIconContainer}
          >
            <Ionicons
              name="pricetag"
              size={18}
              color={mainTab === 'deals' ? COLORS.white : COLORS.textTertiary}
            />
          </LinearGradient>
          <Text style={[styles.mainTabText, mainTab === 'deals' && styles.mainTabTextActive]}>
            My Deals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'insights' && styles.mainTabActive]}
          onPress={() => setMainTab('insights')}
        >
          <LinearGradient
            colors={mainTab === 'insights' ? GRADIENTS.secondary : [COLORS.bgGray100, COLORS.bgGray200]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainTabIconContainer}
          >
            <Ionicons
              name="analytics"
              size={18}
              color={mainTab === 'insights' ? COLORS.white : COLORS.textTertiary}
            />
          </LinearGradient>
          <Text style={[styles.mainTabText, mainTab === 'insights' && styles.mainTabTextActive]}>
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {mainTab === 'deals' ? (
        <FlatList
          data={deals}
          renderItem={renderDeal}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon="pricetag-outline"
                iconGradient={[COLORS.primaryLighter, '#FDF2F8']}
                title="No deals yet"
                subtitle="Create your first deal to start attracting customers"
                ctaButton={{
                  label: 'Create Deal',
                  icon: 'add',
                  onPress: () => router.push('/create-deal'),
                  gradient: [COLORS.primary, '#D81B60'],
                }}
              />
            ) : null
          }
        />
      ) : (
        renderInsightsContent()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Main Tab Styles
  mainTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundSecondary,
  },
  mainTabActive: {
    backgroundColor: COLORS.primaryLighter,
  },
  mainTabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textTertiary,
  },
  mainTabTextActive: {
    color: COLORS.primary,
  },
  mainTabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Deals List Styles
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
  // Insights Styles
  insightsScrollView: {
    flex: 1,
  },
  insightTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  insightTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundSecondary,
  },
  insightTabActive: {
    backgroundColor: COLORS.primaryLighter,
  },
  insightTabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textTertiary,
  },
  insightTabTextActive: {
    color: COLORS.primary,
  },
  insightTabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  // Chart Styles
  chartCard: {
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS['2xl'],
    ...SHADOWS.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chartBadgeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: 28,
    height: 120,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 10,
  },
  barValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 8,
  },
  barValueActive: {
    color: COLORS.primary,
  },
  barLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  barLabelActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  // Top Deals Styles
  topDealsCard: {
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS['2xl'],
    ...SHADOWS.md,
  },
  topDealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyDeals: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: RADIUS['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  topDealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  lastDealItem: {
    borderBottomWidth: 0,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  topDealInfo: {
    flex: 1,
  },
  topDealName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  dealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dealStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dealMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  redemptionCount: {
    alignItems: 'flex-end',
  },
  countValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  countLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  // AI Sections Styles
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  demandChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: SPACING.md,
  },
  demandBar: {
    alignItems: 'center',
    flex: 1,
  },
  demandBarContainer: {
    width: 24,
    height: 100,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  demandBarFill: {
    width: '100%',
    borderRadius: RADIUS.sm,
  },
  demandHour: {
    fontSize: 9,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  demandLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  pricingCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  pricingMain: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pricingValue: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  pricingLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  pricingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  pricingStat: {
    alignItems: 'center',
  },
  pricingStatValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  pricingStatLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  competitorNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    justifyContent: 'center',
  },
  competitorNoteText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  segmentCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  segmentName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  churnBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  churnText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  segmentStats: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  segmentStat: {},
  segmentStatValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  segmentStatLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  preferredDeals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  preferredDealTag: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  preferredDealTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  popularDealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  popularDealRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  popularDealRankText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  popularDealInfo: {
    flex: 1,
  },
  popularDealName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  popularDealScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  scoreBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.white,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  scoreText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    width: 30,
  },
  popularDealBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
  },
  popularDealBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 120,
  },
});
