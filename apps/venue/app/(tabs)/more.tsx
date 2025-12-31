import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SHADOWS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { BuzzeeIcon } from '@/components/ui/BuzzeeIcon';
import { useConfirmDialog } from '@/hooks';

interface MenuItem {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  route: string;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function MoreScreen() {
  const { user, venue, signOut } = useAuth();
  const { showConfirmDialog } = useConfirmDialog();

  const handleSignOut = () => {
    showConfirmDialog({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      destructive: true,
      onConfirm: async () => {
        try {
          await signOut();
          router.replace('/(auth)/login');
        } catch (error) {
          console.error('Sign out error:', error);
          Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
      },
    });
  };

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  const getVenueTypeLabel = (type: string | undefined) => {
    const types: Record<string, string> = {
      bar: 'Bar & Lounge',
      restaurant: 'Restaurant',
      club: 'Night Club',
      cafe: 'Cafe',
      hotel: 'Hotel',
    };
    return types[type || ''] || 'Business';
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Business Settings',
      items: [
        {
          title: 'Venue Profile',
          subtitle: 'Edit business details',
          icon: 'business',
          gradient: [COLORS.primary, '#D81B60'] as const,
          route: '/settings/profile',
        },
        {
          title: 'Operating Hours',
          subtitle: 'Set your schedule',
          icon: 'time',
          gradient: ['#0891B2', '#06B6D4'] as const,
          route: '/settings/hours',
        },
        {
          title: 'Photos & Media',
          subtitle: 'Manage images',
          icon: 'images',
          gradient: ['#059669', '#10B981'] as const,
          route: '/settings/media',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          title: 'Subscription & Billing',
          subtitle: 'Plans and payments',
          icon: 'diamond',
          gradient: ['#D97706', '#F59E0B'] as const,
          route: '/settings/billing',
        },
        {
          title: 'Notifications',
          subtitle: 'Configure alerts',
          icon: 'notifications',
          gradient: ['#DC2626', '#EF4444'] as const,
          route: '/settings/notifications',
        },
        {
          title: 'Help & Support',
          subtitle: 'Get assistance',
          icon: 'help-circle',
          gradient: ['#7C3AED', '#A855F7'] as const,
          route: '/settings/support',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Venue Card */}
        <TouchableOpacity
          style={styles.venueCard}
          onPress={() => router.push('/settings/profile')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e']}
            style={styles.venueCardGradient}
          >
            <View style={styles.venueCardContent}>
              <View style={styles.venueAvatar}>
                {venue?.logo_url ? (
                  <Image source={{ uri: venue.logo_url }} style={styles.venueImage} />
                ) : (
                  <BuzzeeIcon size={48} showBackground />
                )}
              </View>
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue?.name || 'Your Venue'}</Text>
                <View style={styles.venueTypeBadge}>
                  <Text style={styles.venueTypeText}>{getVenueTypeLabel(venue?.type)}</Text>
                </View>
              </View>
              <View style={styles.editButton}>
                <Ionicons name="pencil" size={18} color={COLORS.primary} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Account Info */}
        <View style={styles.accountCard}>
          <View style={styles.accountRow}>
            <View style={styles.accountIcon}>
              <Ionicons name="person" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Logged in as</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#059669" />
              <Text style={styles.roleText}>Owner</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.lastMenuItem,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleMenuPress(item.route)}
                >
                  <LinearGradient
                    colors={item.gradient}
                    style={styles.menuIcon}
                  >
                    <Ionicons name={item.icon} size={20} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.menuArrow}>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <View style={styles.signOutIcon}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          </View>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Buzzee for Business</Text>
          <Text style={styles.versionNumber}>Version 1.0.0</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.base,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  venueCard: {
    marginHorizontal: SPACING.base,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  venueCardGradient: {
    padding: SPACING.base,
  },
  venueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueAvatar: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  venueInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  venueName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  venueTypeBadge: {
    backgroundColor: COLORS.glassLight,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    marginTop: SPACING.xs,
  },
  venueTypeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.glassLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountCard: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  accountLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  accountEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  roleText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  menuSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.base,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  menuArrow: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.base,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.errorLight,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  signOutIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.error,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: 2,
  },
  versionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  versionNumber: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
  },
  bottomPadding: {
    height: 100,
  },
});
