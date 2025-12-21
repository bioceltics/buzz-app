import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { venue } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: analytics, refetch } = useQuery({
    queryKey: ['venue-analytics', venue?.id],
    queryFn: async () => {
      if (!venue) return null;

      const { data: deals } = await supabase
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

      const topDeals = [...(deals || [])]
        .sort((a, b) => (b.redemption_count || 0) - (a.redemption_count || 0))
        .slice(0, 5);

      return {
        totalDeals: deals?.length || 0,
        activeDeals: deals?.filter((d) => d.is_active).length || 0,
        totalRedemptions: deals?.reduce((sum, d) => sum + (d.redemption_count || 0), 0) || 0,
        weeklyRedemptions: recentRedemptions?.length || 0,
        dailyData,
        topDeals,
      };
    },
    enabled: !!venue,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const maxDailyValue = analytics ? Math.max(...Object.values(analytics.dailyData), 1) : 1;

  const stats = [
    {
      label: 'Active Deals',
      value: analytics?.activeDeals || 0,
      icon: 'flash',
      gradient: [COLORS.primary, '#D81B60'] as [string, string],
      bgColor: COLORS.primaryLighter,
    },
    {
      label: 'Total Redemptions',
      value: analytics?.totalRedemptions || 0,
      icon: 'ticket',
      gradient: ['#059669', '#10B981'] as [string, string],
      bgColor: '#D1FAE5',
    },
    {
      label: 'This Week',
      value: analytics?.weeklyRedemptions || 0,
      icon: 'calendar',
      gradient: ['#D97706', '#F59E0B'] as [string, string],
      bgColor: '#FEF3C7',
    },
    {
      label: 'Total Deals',
      value: analytics?.totalDeals || 0,
      icon: 'layers',
      gradient: ['#6366F1', '#8B5CF6'] as [string, string],
      bgColor: '#EDE9FE',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>{venue?.name}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <LinearGradient
                colors={stat.gradient}
                style={styles.statIconContainer}
              >
                <Ionicons name={stat.icon as any} size={22} color="#FFF" />
              </LinearGradient>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
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
              onPress={() => router.push('/(tabs)/deals')}
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

                <View style={styles.dealInfo}>
                  <Text style={styles.dealName} numberOfLines={1}>
                    {deal.title}
                  </Text>
                  <View style={styles.dealMeta}>
                    <View
                      style={[
                        styles.statusDot,
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

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  headerContent: {
    flex: 1,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    width: (width - 36) / 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'flex-start',
    ...SHADOWS.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  chartCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 24,
    ...SHADOWS.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
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
    backgroundColor: '#F3F4F6',
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
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
  },
  barValueActive: {
    color: COLORS.primary,
  },
  barLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  barLabelActive: {
    color: '#111827',
    fontWeight: '600',
  },
  topDealsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 24,
    ...SHADOWS.md,
  },
  topDealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
    borderBottomColor: '#F3F4F6',
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
    color: '#FFF',
  },
  dealInfo: {
    flex: 1,
  },
  dealName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  dealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
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
  bottomPadding: {
    height: 100,
  },
});
