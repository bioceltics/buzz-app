import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';
import { Button } from '@/components/ui';
import { BuzzeeIcon } from '@/components/ui/BuzzeeIcon';

interface MenuItemData {
  icon: string;
  title: string;
  subtitle?: string;
  gradient: [string, string];
  route?: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  // Check if user is a venue owner
  const { data: venue } = useQuery({
    queryKey: ['user-venue', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('venues')
        .select('id, name')
        .eq('owner_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isVenueOwner = !!venue;

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        signOut();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[COLORS.primary, '#D81B60']}
              style={styles.logoContainer}
            >
              <BuzzeeIcon size={18} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.logoText}>Buzzee</Text>
          </View>
        </View>
        <View style={styles.signInPrompt}>
          <LinearGradient
            colors={[COLORS.primary, '#D81B60']}
            style={styles.welcomeIconContainer}
          >
            <Ionicons name="person" size={40} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.signInTitle}>Welcome to Buzzee</Text>
          <Text style={styles.signInSubtext}>
            Sign in to save favorites, chat with venues, and redeem exclusive deals
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            size="lg"
            style={styles.signInButton}
          />
          <Button
            title="Create Account"
            variant="ghost"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.createAccountButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[COLORS.primary, '#D81B60']}
              style={styles.logoContainer}
            >
              <BuzzeeIcon size={18} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.logoText}>Buzzee</Text>
          </View>
        </View>

        {/* User Card with Dark Gradient */}
        <View style={styles.userCardWrapper}>
          <LinearGradient
            colors={['#1a1a2e', '#16213e']}
            style={styles.userCard}
          >
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: user.avatar_url || 'https://via.placeholder.com/100',
                  }}
                  style={styles.avatar}
                />
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color={COLORS.white} />
                </View>
              </View>
              <Text style={styles.userName}>
                {user.full_name || 'Buzzee User'}
              </Text>
              <Text style={styles.userEmail}>{user.email || user.phone}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push('/settings/edit-profile')}
              >
                <Ionicons name="pencil" size={14} color={COLORS.white} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, '#D81B60']}
                style={styles.statIconContainer}
              >
                <Ionicons name="ticket" size={18} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Redeemed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <LinearGradient
                colors={['#DC2626', '#EF4444']}
                style={styles.statIconContainer}
              >
                <Ionicons name="heart" size={18} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={styles.statIconContainer}
              >
                <Ionicons name="star" size={18} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Activity Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Activity</Text>
          <View style={styles.menuCard}>
            <GradientMenuItem
              icon="receipt-outline"
              title="My Redemptions"
              subtitle="View your redeemed deals"
              gradient={[COLORS.primary, '#D81B60']}
              onPress={() => router.push('/profile/redemptions')}
            />
            <View style={styles.menuDivider} />
            <GradientMenuItem
              icon="star-outline"
              title="My Reviews"
              subtitle="Manage your venue reviews"
              gradient={['#D97706', '#F59E0B']}
              onPress={() => router.push('/profile/reviews')}
            />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            <GradientMenuItem
              icon="notifications-outline"
              title="Notification Preferences"
              subtitle="Manage alerts and followed venues"
              gradient={['#3B82F6', '#60A5FA']}
              onPress={() => router.push('/settings/notifications')}
            />
            <View style={styles.menuDivider} />
            <GradientMenuItem
              icon="location-outline"
              title="Location Settings"
              subtitle="Manage location permissions"
              gradient={['#059669', '#10B981']}
              onPress={() => router.push('/profile/location')}
            />
            <View style={styles.menuDivider} />
            <GradientMenuItem
              icon="shield-checkmark-outline"
              title="Privacy"
              subtitle="Control your data"
              gradient={['#6366F1', '#8B5CF6']}
              onPress={() => router.push('/profile/privacy')}
            />
          </View>
        </View>

        {/* Premium Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Premium</Text>
          <View style={styles.menuCard}>
            <GradientMenuItem
              icon="diamond-outline"
              title="Buzzee Premium"
              subtitle="Unlock exclusive features"
              gradient={['#F59E0B', '#FBBF24']}
              onPress={() => router.push('/settings/premium')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <GradientMenuItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="FAQs and support"
              gradient={['#0891B2', '#06B6D4']}
              onPress={() => router.push('/profile/help')}
            />
            <View style={styles.menuDivider} />
            <GradientMenuItem
              icon="document-text-outline"
              title="Terms of Service"
              gradient={['#64748B', '#94A3B8']}
              onPress={() => router.push('/profile/terms')}
            />
            <View style={styles.menuDivider} />
            <GradientMenuItem
              icon="lock-closed-outline"
              title="Privacy Policy"
              gradient={['#64748B', '#94A3B8']}
              onPress={() => router.push('/profile/privacy-policy')}
            />
          </View>
        </View>

        {/* Venue Owner Section */}
        {isVenueOwner && (
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Business</Text>
            <TouchableOpacity
              style={styles.venueButton}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.alert('Use the Buzzee for Business app to manage your venue.');
                } else {
                  Alert.alert(
                    'Buzzee for Business',
                    'Use the Buzzee for Business app to manage your venue, create deals, and scan redemptions.',
                    [{ text: 'OK' }]
                  );
                }
              }}
            >
              <View style={styles.venueButtonContent}>
                <LinearGradient
                  colors={[COLORS.primary, '#D81B60']}
                  style={styles.menuIconContainer}
                >
                  <Ionicons name="business" size={20} color={COLORS.white} />
                </LinearGradient>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemTitle}>Buzzee for Business</Text>
                  <Text style={styles.menuItemSubtitle}>Manage {venue?.name}</Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LinearGradient
            colors={['#DC2626', '#EF4444']}
            style={styles.signOutIconContainer}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Buzzee v1.0.0</Text>

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface GradientMenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  gradient: [string, string];
  onPress: () => void;
}

const GradientMenuItem = ({
  icon,
  title,
  subtitle,
  gradient,
  onPress,
}: GradientMenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuItemLeft}>
      <LinearGradient colors={gradient} style={styles.menuIconContainer}>
        <Ionicons name={icon as any} size={20} color={COLORS.white} />
      </LinearGradient>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.menuArrow}>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
    </View>
  </TouchableOpacity>
);

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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  signInPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  welcomeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  signInTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  signInSubtext: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.relaxed,
    marginBottom: SPACING.xl,
  },
  signInButton: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  createAccountButton: {
    width: '100%',
  },
  userCardWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  userCard: {
    padding: 24,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1a1a2e',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    gap: 6,
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    ...SHADOWS.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 74,
  },
  venueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    ...SHADOWS.sm,
  },
  venueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginTop: 32,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    gap: 14,
  },
  signOutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.textTertiary,
    paddingVertical: 24,
  },
  bottomPadding: {
    height: 100,
  },
});
