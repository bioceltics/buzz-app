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
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { BuzzeeIcon } from '@/components/ui/BuzzeeIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, GRADIENTS } from '@/constants/colors';
import { useScreenRefresh } from '@/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// TypeScript Interfaces
interface Campaign {
  id: string;
  type: 'deal' | 'event';
  title: string;
  description?: string;
  image_url: string | null;
  is_active: boolean;
  start_time: string;
  end_time: string | null;
  // Deal-specific
  discount_type?: string;
  discount_value?: number;
  redemption_count?: number;
  // Event-specific
  event_type?: string;
  rsvp_count?: number;
}

interface ActivityItem {
  id: string;
  type: 'redemption' | 'rsvp';
  campaign_title: string;
  campaign_type: 'deal' | 'event';
  timestamp: string;
}

interface PerformanceSummary {
  todayRedemptions: number;
  totalActiveCampaigns: number;
  weeklyChange: number;
  weeklyTrend: 'up' | 'down' | 'stable';
  topCampaign: { id: string; title: string; redemption_count: number } | null;
}

// Event type mappings
const EVENT_TYPE_GRADIENTS: Record<string, [string, string]> = {
  live_music: ['#8B5CF6', '#A78BFA'],
  dj: ['#EC4899', '#F472B6'],
  comedy: ['#F59E0B', '#FBBF24'],
  trivia: ['#10B981', '#34D399'],
  sports: ['#3B82F6', '#60A5FA'],
  themed: ['#6366F1', '#818CF8'],
  special: ['#EF4444', '#F87171'],
  other: ['#6B7280', '#9CA3AF'],
};

export default function VenueDashboardScreen() {
  const { venue, refreshVenue } = useAuth();

  // Query 1: Active Campaigns (deals + events)
  const { data: campaigns, refetch: refetchCampaigns } = useQuery({
    queryKey: ['active-campaigns', venue?.id],
    queryFn: async () => {
      if (!venue) return [];
      const now = new Date().toISOString();

      const [dealsResult, eventsResult] = await Promise.all([
        supabase
          .from('deals')
          .select('id, title, description, image_url, is_active, start_time, end_time, discount_type, discount_value, redemption_count')
          .eq('venue_id', venue.id)
          .eq('is_active', true)
          .gte('end_time', now)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('events')
          .select('id, title, description, image_url, is_active, start_time, end_time, type, rsvp_count')
          .eq('venue_id', venue.id)
          .eq('is_active', true)
          .gte('start_time', now)
          .order('start_time', { ascending: true })
          .limit(10),
      ]);

      const allCampaigns: Campaign[] = [
        ...(dealsResult.data || []).map(d => ({ ...d, type: 'deal' as const })),
        ...(eventsResult.data || []).map(e => ({ ...e, type: 'event' as const, event_type: e.type })),
      ].sort((a, b) => {
        const aTime = a.type === 'deal' && a.end_time ? new Date(a.end_time).getTime() : new Date(a.start_time).getTime();
        const bTime = b.type === 'deal' && b.end_time ? new Date(b.end_time).getTime() : new Date(b.start_time).getTime();
        return aTime - bTime;
      });

      return allCampaigns;
    },
    enabled: !!venue,
    refetchInterval: 30000,
  });

  // Query 2: Recent Activity
  const { data: recentActivity, refetch: refetchActivity } = useQuery({
    queryKey: ['recent-activity', venue?.id],
    queryFn: async () => {
      if (!venue) return [];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { data: redemptions } = await supabase
        .from('redemptions')
        .select('id, redeemed_at, deal_id, deals(title)')
        .eq('venue_id', venue.id)
        .gte('redeemed_at', yesterday.toISOString())
        .order('redeemed_at', { ascending: false })
        .limit(15);

      const activities: ActivityItem[] = (redemptions || []).map(r => ({
        id: r.id,
        type: 'redemption' as const,
        campaign_title: (r.deals as any)?.title || 'Unknown Deal',
        campaign_type: 'deal' as const,
        timestamp: r.redeemed_at,
      }));

      return activities;
    },
    enabled: !!venue,
    refetchInterval: 15000,
  });

  // Query 3: Performance Summary
  const { data: performance, refetch: refetchPerformance } = useQuery({
    queryKey: ['performance-summary', venue?.id],
    queryFn: async () => {
      if (!venue) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const now = new Date().toISOString();

      const [todayResult, thisWeekResult, lastWeekResult, activeDealsResult, activeEventsResult, topDealResult] = await Promise.all([
        supabase.from('redemptions').select('id', { count: 'exact', head: true })
          .eq('venue_id', venue.id).gte('redeemed_at', today.toISOString()),
        supabase.from('redemptions').select('id', { count: 'exact', head: true })
          .eq('venue_id', venue.id).gte('redeemed_at', weekAgo.toISOString()),
        supabase.from('redemptions').select('id', { count: 'exact', head: true })
          .eq('venue_id', venue.id).gte('redeemed_at', twoWeeksAgo.toISOString()).lt('redeemed_at', weekAgo.toISOString()),
        supabase.from('deals').select('id', { count: 'exact', head: true })
          .eq('venue_id', venue.id).eq('is_active', true).gte('end_time', now),
        supabase.from('events').select('id', { count: 'exact', head: true })
          .eq('venue_id', venue.id).eq('is_active', true).gte('start_time', now),
        supabase.from('deals').select('id, title, redemption_count')
          .eq('venue_id', venue.id).eq('is_active', true).order('redemption_count', { ascending: false }).limit(1).single(),
      ]);

      const thisWeek = thisWeekResult.count || 0;
      const lastWeek = lastWeekResult.count || 0;
      const change = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

      return {
        todayRedemptions: todayResult.count || 0,
        totalActiveCampaigns: (activeDealsResult.count || 0) + (activeEventsResult.count || 0),
        weeklyChange: Math.abs(change),
        weeklyTrend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
        topCampaign: topDealResult.data,
      } as PerformanceSummary;
    },
    enabled: !!venue,
  });

  const { refreshing, handleRefresh } = useScreenRefresh({
    onRefresh: async () => {
      await Promise.all([
        refreshVenue(),
        refetchCampaigns(),
        refetchActivity(),
        refetchPerformance(),
      ]);
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff < 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(diff / 60000)}m left`;
    if (hours < 24) return `${hours}h left`;
    return `${Math.floor(hours / 24)}d left`;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDealGradient = (discountType?: string): [string, string] => {
    switch (discountType) {
      case 'percentage': return [COLORS.primary, '#D81B60'];
      case 'fixed': return ['#6366F1', '#8B5CF6'];
      case 'bogo': return ['#059669', '#10B981'];
      case 'free_item': return ['#D97706', '#F59E0B'];
      default: return [COLORS.primary, '#D81B60'];
    }
  };

  const getInsightText = () => {
    if (!performance) return 'Loading insights...';
    if (performance.weeklyTrend === 'up') {
      return `Great week! Activity is up ${performance.weeklyChange}% from last week. Keep the momentum going!`;
    } else if (performance.weeklyTrend === 'down') {
      return `Activity is down ${performance.weeklyChange}% from last week. Try creating a flash deal to boost engagement.`;
    }
    return 'Your campaign performance is steady. Try experimenting with new deal types to grow.';
  };

  // Campaign Card Component
  const CampaignCard = ({ campaign, index }: { campaign: Campaign; index: number }) => {
    const isDeal = campaign.type === 'deal';
    const gradient = isDeal
      ? getDealGradient(campaign.discount_type)
      : EVENT_TYPE_GRADIENTS[campaign.event_type || 'other'] || EVENT_TYPE_GRADIENTS.other;

    return (
      <TouchableOpacity
        style={[styles.campaignCard, index === 0 && styles.campaignCardFirst]}
        onPress={() => router.push(isDeal ? `/edit-deal?id=${campaign.id}` : `/edit-event?id=${campaign.id}`)}
        activeOpacity={0.9}
      >
        {campaign.image_url ? (
          <Image source={{ uri: campaign.image_url }} style={styles.campaignImage} />
        ) : (
          <LinearGradient colors={gradient} style={styles.campaignImagePlaceholder}>
            <Ionicons
              name={isDeal ? 'pricetag' : 'calendar'}
              size={28}
              color="rgba(255,255,255,0.4)"
            />
          </LinearGradient>
        )}

        <View style={[styles.typeBadge, isDeal ? styles.typeBadgeDeal : styles.typeBadgeEvent]}>
          <Ionicons name={isDeal ? 'pricetag' : 'calendar'} size={10} color={isDeal ? COLORS.primary : '#6366F1'} />
          <Text style={[styles.typeBadgeText, isDeal ? styles.typeBadgeTextDeal : styles.typeBadgeTextEvent]}>
            {isDeal ? 'Deal' : 'Event'}
          </Text>
        </View>

        <View style={styles.campaignContent}>
          <Text style={styles.campaignTitle} numberOfLines={2}>{campaign.title}</Text>
          <View style={styles.campaignMeta}>
            <View style={styles.campaignMetaItem}>
              <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.campaignMetaText}>
                {isDeal && campaign.end_time ? getTimeRemaining(campaign.end_time) : new Date(campaign.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <View style={styles.campaignMetaItem}>
              <Ionicons name={isDeal ? 'ticket-outline' : 'people-outline'} size={12} color={COLORS.textSecondary} />
              <Text style={styles.campaignMetaText}>
                {isDeal ? campaign.redemption_count || 0 : campaign.rsvp_count || 0}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Activity Item Component
  const ActivityItemRow = ({ activity }: { activity: ActivityItem }) => {
    const colors = { bg: '#D1FAE5', icon: '#059669' };
    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: colors.bg }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors.icon} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityAction}>Deal redeemed</Text>
          <Text style={styles.activityCampaign} numberOfLines={1}>{activity.campaign_title}</Text>
        </View>
        <Text style={styles.activityTime}>{getTimeAgo(activity.timestamp)}</Text>
      </View>
    );
  };

  // Hero Background Component - Supports custom venue cover image
  const HeroBackground = ({ children }: { children: React.ReactNode }) => {
    if (venue?.cover_image_url) {
      return (
        <ImageBackground
          source={{ uri: venue.cover_image_url }}
          style={styles.heroSection}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(26,26,46,0.65)', 'rgba(22,33,62,0.75)', 'rgba(15,52,96,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          {children}
        </ImageBackground>
      );
    }

    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460', '#1a1a2e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        {children}
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFF" />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section with Customizable Background */}
        <HeroBackground>

          <SafeAreaView edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <BuzzeeIcon size={32} showBackground />
                <View>
                  <Text style={styles.logoText}>Buzzee</Text>
                  <Text style={styles.logoSubtext}>for Business</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push('/(tabs)/more')}
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

            {/* Stats Cards - Updated for Campaigns */}
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(99,102,241,0.25)', 'rgba(99,102,241,0.08)']}
                    style={styles.statIconBg}
                  >
                    <Ionicons name="megaphone" size={20} color="#818CF8" />
                  </LinearGradient>
                  <Text style={styles.statValue}>{campaigns?.length || 0}</Text>
                  <Text style={styles.statLabel}>Active Campaigns</Text>
                </View>

                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(52,211,153,0.25)', 'rgba(52,211,153,0.08)']}
                    style={styles.statIconBg}
                  >
                    <Ionicons name="pulse" size={20} color="#34D399" />
                  </LinearGradient>
                  <Text style={styles.statValue}>{performance?.todayRedemptions || 0}</Text>
                  <Text style={styles.statLabel}>Today</Text>
                </View>

                <View style={styles.statCard}>
                  <LinearGradient
                    colors={
                      performance?.weeklyTrend === 'up'
                        ? ['rgba(52,211,153,0.25)', 'rgba(52,211,153,0.08)']
                        : ['rgba(251,191,36,0.25)', 'rgba(251,191,36,0.08)']
                    }
                    style={styles.statIconBg}
                  >
                    <Ionicons
                      name={performance?.weeklyTrend === 'up' ? 'trending-up' : performance?.weeklyTrend === 'down' ? 'trending-down' : 'remove'}
                      size={20}
                      color={performance?.weeklyTrend === 'up' ? '#34D399' : '#FBBF24'}
                    />
                  </LinearGradient>
                  <Text style={styles.statValue}>
                    {performance?.weeklyTrend === 'up' ? '+' : performance?.weeklyTrend === 'down' ? '-' : ''}{performance?.weeklyChange || 0}%
                  </Text>
                  <Text style={styles.statLabel}>This Week</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </HeroBackground>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Quick Create - Compact Version */}
          <View style={styles.quickCreateSection}>
            <Text style={styles.sectionTitle}>Quick Create</Text>
            <View style={styles.quickCreateRow}>
              <TouchableOpacity
                style={styles.quickCreateBtn}
                onPress={() => router.push('/create-deal')}
                activeOpacity={0.8}
              >
                <LinearGradient colors={[COLORS.primary, '#D81B60']} style={styles.quickCreateBtnGradient}>
                  <Ionicons name="pricetag" size={18} color="#FFF" />
                  <Text style={styles.quickCreateBtnText}>New Deal</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCreateBtn}
                onPress={() => router.push('/create-event')}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.quickCreateBtnGradient}>
                  <Ionicons name="calendar" size={18} color="#FFF" />
                  <Text style={styles.quickCreateBtnText}>New Event</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Campaigns Carousel */}
          <View style={styles.campaignsSection}>
            <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
              <Text style={styles.sectionTitle}>Active Campaigns</Text>
              {campaigns && campaigns.length > 0 && (
                <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push('/(tabs)/deals')}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>

            {!campaigns || campaigns.length === 0 ? (
              <View style={styles.emptyCarousel}>
                <LinearGradient colors={[COLORS.primaryLighter, '#FDF2F8']} style={styles.emptyCarouselIcon}>
                  <Ionicons name="megaphone-outline" size={32} color={COLORS.primary} />
                </LinearGradient>
                <Text style={styles.emptyCarouselTitle}>No Active Campaigns</Text>
                <Text style={styles.emptyCarouselSubtitle}>Create a deal or event to get started</Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.campaignsCarousel}
              >
                {campaigns.map((campaign, index) => (
                  <CampaignCard key={campaign.id} campaign={campaign} index={index} />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Recent Activity Feed */}
          <View style={styles.activitySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {recentActivity && recentActivity.length > 0 && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              )}
            </View>

            {!recentActivity || recentActivity.length === 0 ? (
              <View style={styles.emptyActivity}>
                <Ionicons name="pulse-outline" size={40} color={COLORS.textTertiary} />
                <Text style={styles.emptyActivityText}>No recent activity</Text>
                <Text style={styles.emptyActivitySubtext}>Activity will appear here as customers engage</Text>
              </View>
            ) : (
              <View style={styles.activityList}>
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <View
                    key={activity.id}
                    style={[styles.activityItemWrapper, index === Math.min(recentActivity.length, 5) - 1 && styles.activityItemLast]}
                  >
                    <ActivityItemRow activity={activity} />
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Performance Summary Card */}
          <View style={styles.performanceSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Performance</Text>
              <TouchableOpacity style={styles.insightsBtn} onPress={() => router.push('/(tabs)/deals')}>
                <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                <Text style={styles.insightsBtnText}>Full Report</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.performanceCard}>
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.08)', 'rgba(99, 102, 241, 0.02)']}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.performanceStats}>
                <View style={styles.performanceStat}>
                  <LinearGradient colors={GRADIENTS.success} style={styles.performanceStatIcon}>
                    <Ionicons name="checkmark-done" size={16} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.performanceStatValue}>{performance?.todayRedemptions || 0}</Text>
                  <Text style={styles.performanceStatLabel}>Redeemed Today</Text>
                </View>

                <View style={styles.performanceStatDivider} />

                <View style={styles.performanceStat}>
                  <LinearGradient colors={GRADIENTS.secondary} style={styles.performanceStatIcon}>
                    <Ionicons name="megaphone" size={16} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.performanceStatValue}>{performance?.totalActiveCampaigns || 0}</Text>
                  <Text style={styles.performanceStatLabel}>Active Campaigns</Text>
                </View>
              </View>

              <View style={styles.insightBox}>
                <View style={styles.insightHeader}>
                  <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.insightIcon}>
                    <Ionicons name="bulb" size={14} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.insightLabel}>AI Insight</Text>
                </View>
                <Text style={styles.insightText}>{getInsightText()}</Text>

                {performance?.topCampaign && (
                  <View style={styles.topCampaignBadge}>
                    <Ionicons name="trophy" size={12} color="#D97706" />
                    <Text style={styles.topCampaignText}>
                      Top: {performance.topCampaign.title} ({performance.topCampaign.redemption_count} redeemed)
                    </Text>
                  </View>
                )}
              </View>
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
    textAlign: 'center',
  },
  mainContent: {
    paddingTop: 20,
    marginTop: -8,
  },
  // Quick Create Compact
  quickCreateSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  quickCreateRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickCreateBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  quickCreateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  quickCreateBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Campaigns Carousel
  campaignsSection: {
    marginTop: 20,
  },
  campaignsCarousel: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  campaignCard: {
    width: 180,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    ...SHADOWS.md,
  },
  campaignCardFirst: {},
  campaignImage: {
    width: '100%',
    height: 100,
  },
  campaignImagePlaceholder: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeDeal: {
    backgroundColor: COLORS.primaryLighter,
  },
  typeBadgeEvent: {
    backgroundColor: '#EDE9FE',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  typeBadgeTextDeal: {
    color: COLORS.primary,
  },
  typeBadgeTextEvent: {
    color: '#6366F1',
  },
  campaignContent: {
    padding: 12,
  },
  campaignTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  campaignMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  campaignMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  campaignMetaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyCarousel: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 40,
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    ...SHADOWS.sm,
  },
  emptyCarouselIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyCarouselTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyCarouselSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Activity Feed
  activitySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  activityList: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 4,
    ...SHADOWS.sm,
  },
  activityItemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  activityItemLast: {
    borderBottomWidth: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  activityCampaign: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    ...SHADOWS.sm,
  },
  emptyActivityText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  emptyActivitySubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  // Performance Summary
  performanceSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  insightsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightsBtnText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  performanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    ...SHADOWS.md,
  },
  performanceStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  performanceStat: {
    flex: 1,
    alignItems: 'center',
  },
  performanceStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  performanceStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  performanceStatDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 16,
  },
  insightBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderRadius: 16,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  insightText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  topCampaignBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  topCampaignText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 120,
  },
});
