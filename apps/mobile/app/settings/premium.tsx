import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui';
import { COLORS, SHADOWS } from '@/constants/colors';

interface PremiumFeature {
  icon: string;
  title: string;
  description: string;
  gradient: [string, string];
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    icon: 'flash',
    title: 'Early Access',
    description: 'Be the first to see new deals before anyone else',
    gradient: ['#F59E0B', '#FBBF24'],
  },
  {
    icon: 'star',
    title: 'Exclusive Deals',
    description: 'Access premium-only deals at top venues',
    gradient: [COLORS.primary, '#D81B60'],
  },
  {
    icon: 'ribbon',
    title: 'No Ads',
    description: 'Enjoy a completely ad-free experience',
    gradient: ['#8B5CF6', '#A78BFA'],
  },
  {
    icon: 'trending-up',
    title: 'Priority Support',
    description: 'Get faster responses from our support team',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  {
    icon: 'gift',
    title: 'Monthly Rewards',
    description: 'Earn exclusive rewards and bonus points',
    gradient: ['#10B981', '#34D399'],
  },
  {
    icon: 'analytics',
    title: 'Savings Insights',
    description: 'Track your savings with detailed analytics',
    gradient: ['#0891B2', '#06B6D4'],
  },
];

export default function PremiumScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buzzee Premium</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#F59E0B', '#FBBF24']}
          style={styles.heroCard}
        >
          <View style={styles.heroIconContainer}>
            <Ionicons name="diamond" size={40} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>Unlock Premium</Text>
          <Text style={styles.heroSubtitle}>
            Get the most out of Buzzee with exclusive features and benefits
          </Text>
        </LinearGradient>

        {/* Features List */}
        <Text style={styles.sectionTitle}>Premium Features</Text>
        <View style={styles.featuresCard}>
          {PREMIUM_FEATURES.map((feature, index) => (
            <View
              key={feature.title}
              style={[
                styles.featureRow,
                index === PREMIUM_FEATURES.length - 1 && styles.lastFeatureRow,
              ]}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureIcon}
              >
                <Ionicons name={feature.icon as any} size={22} color="#FFF" />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
            </View>
          ))}
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingHeader}>
            <Text style={styles.pricingLabel}>Monthly Plan</Text>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>Most Popular</Text>
            </View>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>$4.99</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>
          <Text style={styles.pricingNote}>Cancel anytime. No commitment.</Text>

          <Button
            title="Start Free Trial"
            onPress={() => {}}
            size="lg"
            style={styles.subscribeButton}
          />

          <Text style={styles.trialNote}>
            7-day free trial, then $4.99/month
          </Text>
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Have Questions?</Text>
        <View style={styles.faqCard}>
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqText}>How does the free trial work?</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqText}>Can I cancel anytime?</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.faqItem, styles.lastFaqItem]}>
            <Text style={styles.faqText}>What payment methods do you accept?</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.lg,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  featuresCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 24,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastFeatureRow: {
    borderBottomWidth: 0,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  pricingCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    ...SHADOWS.sm,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  priceBadge: {
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111827',
  },
  pricePeriod: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  pricingNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  subscribeButton: {
    marginBottom: 12,
  },
  trialNote: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastFaqItem: {
    borderBottomWidth: 0,
  },
  faqText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});
