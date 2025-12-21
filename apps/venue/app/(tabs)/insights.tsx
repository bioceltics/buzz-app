import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

export default function InsightsScreen() {
  const { venue } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Insights</Text>
            <Text style={styles.headerSubtitle}>Powered by machine learning</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* AI Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="analytics" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.statValue}>{aiStats.accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="trending-up" size={20} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>+{aiStats.engagementLift}%</Text>
            <Text style={styles.statLabel}>Engagement</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="cash" size={20} color="#D97706" />
            </View>
            <Text style={styles.statValue}>+{aiStats.revenueImpact}%</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#DC2626" />
            </View>
            <Text style={styles.statValue}>${aiStats.fraudPrevented}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        {/* Demand Forecast */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
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
            <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
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
            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
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
                  <View key={i} style={styles.dealTag}>
                    <Text style={styles.dealTagText}>{deal}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Popular Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flame-outline" size={20} color={COLORS.primary} />
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

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    width: (SCREEN_WIDTH - SPACING.md * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
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
  dealTag: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  dealTagText: {
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
    height: 100,
  },
});
