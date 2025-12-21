import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { BuzzeeIcon } from '@/components/ui/BuzzeeIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function VenueDashboardScreen() {
  const { venue, refreshVenue } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: dealsStats, refetch: refetchStats } = useQuery({
    queryKey: ['venue-deals-stats', venue?.id],
    queryFn: async () => {
      if (!venue) return { total: 0, active: 0, redemptions: 0 };
      const { data: deals } = await supabase
        .from('deals')
        .select('id, is_active, redemption_count')
        .eq('venue_id', venue.id);
      const total = deals?.length || 0;
      const active = deals?.filter(d => d.is_active).length || 0;
      const redemptions = deals?.reduce((sum, d) => sum + (d.redemption_count || 0), 0) || 0;
      return { total, active, redemptions };
    },
    enabled: !!venue,
  });

  const { data: todayRedemptions, refetch: refetchToday } = useQuery({
    queryKey: ['today-redemptions', venue?.id],
    queryFn: async () => {
      if (!venue) return 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('redemptions')
        .select('id', { count: 'exact', head: true })
        .eq('venue_id', venue.id)
        .gte('redeemed_at', today.toISOString());
      return count || 0;
    },
    enabled: !!venue,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshVenue(), refetchStats(), refetchToday()]);
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section with Premium Gradient */}
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460', '#1a1a2e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          {/* Decorative Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          <SafeAreaView edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryLight]}
                  style={styles.logoContainer}
                >
                  <BuzzeeIcon size={18} color="#FFF" />
                </LinearGradient>
                <View>
                  <Text style={styles.logoText}>Buzzee</Text>
                  <Text style={styles.logoSubtext}>for Business</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)']}
                  style={styles.profileGradient}
                >
                  <Ionicons name="person" size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Welcome */}
            <View style={styles.welcomeSection}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.venueName}>{venue?.name || 'Your Business'}</Text>
            </View>

            {/* Stats Cards - Glass Morphism Style */}
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(99,102,241,0.25)', 'rgba(99,102,241,0.08)']}
                    style={styles.statIconBg}
                  >
                    <Ionicons name="flash" size={20} color="#818CF8" />
                  </LinearGradient>
                  <Text style={styles.statValue}>{dealsStats?.active || 0}</Text>
                  <Text style={styles.statLabel}>Active Deals</Text>
                </View>

                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(52,211,153,0.25)', 'rgba(52,211,153,0.08)']}
                    style={styles.statIconBg}
                  >
                    <Ionicons name="checkmark-done" size={20} color="#34D399" />
                  </LinearGradient>
                  <Text style={styles.statValue}>{dealsStats?.redemptions || 0}</Text>
                  <Text style={styles.statLabel}>Redeemed</Text>
                </View>

                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(251,191,36,0.25)', 'rgba(251,191,36,0.08)']}
                    style={styles.statIconBg}
                  >
                    <Ionicons name="today" size={20} color="#FBBF24" />
                  </LinearGradient>
                  <Text style={styles.statValue}>{todayRedemptions || 0}</Text>
                  <Text style={styles.statLabel}>Today</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Quick Create Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Create</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Two Primary Actions - Deal & Event */}
          <View style={styles.createActions}>
            {/* Create Deal */}
            <TouchableOpacity
              style={styles.createAction}
              onPress={() => router.push('/create-deal')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.primary, '#D81B60']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createActionGradient}
              >
                <View style={styles.createActionIconWrapper}>
                  <View style={styles.createActionIcon}>
                    <Ionicons name="pricetag" size={26} color="#FFF" />
                  </View>
                </View>
                <Text style={styles.createActionTitle}>Daily Deal</Text>
                <Text style={styles.createActionSubtitle}>Up to 24 hours</Text>
                <View style={styles.createActionArrow}>
                  <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Create Event */}
            <TouchableOpacity
              style={styles.createAction}
              onPress={() => router.push('/create-event')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createActionGradient}
              >
                <View style={styles.createActionIconWrapper}>
                  <View style={styles.createActionIcon}>
                    <Ionicons name="calendar" size={26} color="#FFF" />
                  </View>
                </View>
                <Text style={styles.createActionTitle}>Event</Text>
                <Text style={styles.createActionSubtitle}>Any duration</Text>
                <View style={styles.createActionArrow}>
                  <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Manage Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manage</Text>
          </View>

          {/* Action Grid - Modern Cards */}
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/scanner')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ECFDF5', '#D1FAE5']}
                style={styles.actionIconContainer}
              >
                <Ionicons name="qr-code" size={26} color="#059669" />
              </LinearGradient>
              <Text style={styles.actionTitle}>Scan</Text>
              <Text style={styles.actionSubtitle}>QR Codes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/analytics')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FEF3C7', '#FDE68A']}
                style={styles.actionIconContainer}
              >
                <Ionicons name="stats-chart" size={26} color="#D97706" />
              </LinearGradient>
              <Text style={styles.actionTitle}>Analytics</Text>
              <Text style={styles.actionSubtitle}>Performance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/insights')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EDE9FE', '#DDD6FE']}
                style={styles.actionIconContainer}
              >
                <Ionicons name="sparkles" size={26} color="#7C3AED" />
              </LinearGradient>
              <Text style={styles.actionTitle}>AI Insights</Text>
              <Text style={styles.actionSubtitle}>Smart Tips</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FCE7F3', '#FBCFE8']}
                style={styles.actionIconContainer}
              >
                <Ionicons name="settings" size={26} color="#DB2777" />
              </LinearGradient>
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionSubtitle}>Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Insight Card - Premium Design */}
          <View style={styles.insightCard}>
            <LinearGradient
              colors={['rgba(5, 150, 105, 0.08)', 'rgba(5, 150, 105, 0.02)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.insightHeader}>
              <View style={styles.insightIconContainer}>
                <Ionicons name="trending-up" size={22} color="#059669" />
              </View>
              <View style={styles.insightBadge}>
                <Ionicons name="bulb" size={12} color="#059669" />
                <Text style={styles.insightBadgeText}>Tip</Text>
              </View>
            </View>
            <Text style={styles.insightTitle}>Performance Insight</Text>
            <Text style={styles.insightText}>
              Businesses that post deals weekly see 40% more customer engagement. Keep your deals fresh!
            </Text>
            <TouchableOpacity style={styles.insightButton} onPress={() => router.push('/create-deal')}>
              <Text style={styles.insightButtonText}>Create a Deal</Text>
              <Ionicons name="arrow-forward" size={16} color="#059669" />
            </TouchableOpacity>
          </View>

          {/* Bottom Stats - Glass Style */}
          <View style={styles.bottomStats}>
            <View style={styles.bottomStatItem}>
              <View style={styles.bottomStatIcon}>
                <Ionicons name="layers-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.bottomStatValue}>{dealsStats?.total || 0}</Text>
              <Text style={styles.bottomStatLabel}>Total Deals</Text>
            </View>
            <View style={styles.bottomStatDivider} />
            <View style={styles.bottomStatItem}>
              <View style={styles.bottomStatIcon}>
                <Ionicons name="trending-up-outline" size={18} color={COLORS.success} />
              </View>
              <Text style={styles.bottomStatValue}>
                {dealsStats?.redemptions ? Math.round((dealsStats.redemptions / Math.max(dealsStats.total, 1)) * 10) / 10 : 0}
              </Text>
              <Text style={styles.bottomStatLabel}>Avg. Redemptions</Text>
            </View>
          </View>

          {/* Bottom Padding for Tab Bar */}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    marginTop: -2,
  },
  profileButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  venueName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.8,
  },
  statsContainer: {
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  mainContent: {
    padding: 20,
    marginTop: -8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.4,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  createActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  createAction: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  createActionGradient: {
    padding: 20,
    paddingBottom: 24,
    minHeight: 160,
    position: 'relative',
  },
  createActionIconWrapper: {
    marginBottom: 20,
  },
  createActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  createActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  createActionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  createActionArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionItem: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    ...SHADOWS.sm,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  insightCard: {
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  insightIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  insightBadgeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  insightTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 21,
    marginBottom: 16,
  },
  insightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  insightButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  bottomStats: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    ...SHADOWS.sm,
  },
  bottomStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  bottomStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  bottomStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  bottomStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  bottomPadding: {
    height: 100,
  },
});
