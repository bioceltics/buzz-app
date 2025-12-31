import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '@/hooks/useSettings';
import { COLORS, SHADOWS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PlanTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  gradient: [string, string];
  isPopular?: boolean;
}

const PLAN_TIERS: PlanTier[] = [
  {
    name: 'Starter',
    price: '$49.99',
    period: '/month',
    description: 'Perfect for small venues testing the platform',
    features: [
      'Up to 10 deals per month',
      'Basic analytics dashboard',
      'Email support',
      '1 user account',
    ],
    gradient: ['#6B7280', '#9CA3AF'],
  },
  {
    name: 'Pro',
    price: '$99.99',
    period: '/month',
    description: 'For active venues maximizing customer traffic',
    features: [
      'Unlimited deals',
      'Advanced analytics & AI insights',
      'Priority support',
      'Up to 5 user accounts',
      'Custom branding',
      'Featured placement',
    ],
    gradient: [COLORS.primary, '#D81B60'],
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For venue chains and large hospitality groups',
    features: [
      'Multi-location management',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantees',
      'White-label options',
    ],
    gradient: ['#6366F1', '#8B5CF6'],
  },
];

export default function BillingScreen() {
  const { venue } = useSettings();
  const currentPlan = (venue as any)?.subscription_tier || 'starter';

  const getCurrentPlanName = () => {
    const tier = PLAN_TIERS.find(
      (t) => t.name.toLowerCase() === currentPlan.toLowerCase()
    );
    return tier?.name || 'Starter';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Plan Card */}
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          style={styles.currentPlanCard}
        >
          <View style={styles.currentPlanHeader}>
            <View style={styles.currentPlanBadge}>
              <Ionicons name="diamond" size={16} color="#FFF" />
              <Text style={styles.currentPlanBadgeText}>Current Plan</Text>
            </View>
          </View>
          <Text style={styles.currentPlanName}>{getCurrentPlanName()}</Text>
          <Text style={styles.currentPlanDescription}>
            Your subscription renews monthly
          </Text>
          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
            <Ionicons name="open-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Plan Tiers */}
        <Text style={styles.sectionTitle}>Available Plans</Text>

        {PLAN_TIERS.map((tier, index) => {
          const isCurrentPlan = tier.name.toLowerCase() === currentPlan.toLowerCase();

          return (
            <View
              key={tier.name}
              style={[
                styles.planCard,
                tier.isPopular && styles.popularPlanCard,
                isCurrentPlan && styles.currentTierCard,
              ]}
            >
              {tier.isPopular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="star" size={12} color="#FFF" />
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <LinearGradient
                  colors={tier.gradient}
                  style={styles.planIcon}
                >
                  <Ionicons
                    name={tier.name === 'Enterprise' ? 'business' : tier.name === 'Pro' ? 'rocket' : 'flash'}
                    size={22}
                    color="#FFF"
                  />
                </LinearGradient>
                <View style={styles.planPricing}>
                  <View style={styles.priceRow}>
                    <Text style={styles.planPrice}>{tier.price}</Text>
                    <Text style={styles.planPeriod}>{tier.period}</Text>
                  </View>
                  <Text style={styles.planName}>{tier.name}</Text>
                </View>
                {isCurrentPlan && (
                  <View style={styles.currentBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#059669" />
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>

              <Text style={styles.planDescription}>{tier.description}</Text>

              <View style={styles.featuresList}>
                {tier.features.map((feature, featureIndex) => (
                  <View key={featureIndex} style={styles.featureRow}>
                    <View style={styles.featureCheck}>
                      <Ionicons name="checkmark" size={14} color="#059669" />
                    </View>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {!isCurrentPlan && (
                <TouchableOpacity
                  style={[
                    styles.selectPlanButton,
                    tier.isPopular && styles.popularSelectButton,
                  ]}
                >
                  <LinearGradient
                    colors={tier.isPopular ? tier.gradient : ['#F3F4F6', '#E5E7EB']}
                    style={styles.selectPlanGradient}
                  >
                    <Text
                      style={[
                        styles.selectPlanText,
                        tier.isPopular && styles.popularSelectText,
                      ]}
                    >
                      {tier.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentIcon}>
              <Ionicons name="card" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Add a payment method</Text>
              <Text style={styles.paymentDescription}>
                Set up billing to upgrade your plan
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpCard}>
          <Ionicons name="help-circle" size={20} color="#6366F1" />
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Need help choosing?</Text>
            <Text style={styles.helpText}>
              Contact our team for a personalized recommendation
            </Text>
          </View>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Contact</Text>
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
  currentPlanCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  currentPlanBadgeText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
  },
  currentPlanName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  currentPlanDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 20,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 14,
  },
  manageButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  popularPlanCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  currentTierCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planPricing: {
    flex: 1,
    marginLeft: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  planPeriod: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  planName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  currentBadgeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  selectPlanButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  popularSelectButton: {},
  selectPlanGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  selectPlanText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  popularSelectText: {
    color: '#FFF',
  },
  paymentSection: {
    marginTop: 8,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.sm,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  paymentDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  helpContent: {
    flex: 1,
    marginLeft: 12,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  helpText: {
    fontSize: 12,
    color: '#7C3AED',
    marginTop: 2,
  },
  helpButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  helpButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomPadding: {
    height: 40,
  },
});
