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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';
import { Button } from '@/components/ui';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.signInPrompt}>
          <View style={styles.welcomeIconContainer}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.signInTitle}>Welcome to Buzz</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user.user_metadata?.avatar_url || 'https://via.placeholder.com/100',
                }}
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              </View>
            </View>
            <Text style={styles.userName}>
              {user.user_metadata?.full_name || 'Buzz User'}
            </Text>
            <Text style={styles.userEmail}>{user.email || user.phone}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/profile/edit')}
            >
              <Ionicons name="pencil" size={14} color={COLORS.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.primaryLighter }]}>
                <Ionicons name="ticket" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Redeemed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.errorLight }]}>
                <Ionicons name="heart" size={18} color={COLORS.error} />
              </View>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.warningLight }]}>
                <Ionicons name="star" size={18} color={COLORS.warning} />
              </View>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Activity</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="receipt-outline"
              iconColor={COLORS.primary}
              iconBg={COLORS.primaryLighter}
              title="My Redemptions"
              subtitle="View your redeemed deals"
              onPress={() => router.push('/profile/redemptions')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="star-outline"
              iconColor={COLORS.warning}
              iconBg={COLORS.warningLight}
              title="My Reviews"
              subtitle="Manage your venue reviews"
              onPress={() => router.push('/profile/reviews')}
              isLast
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: COLORS.infoLight }]}>
                  <Ionicons name="notifications-outline" size={20} color={COLORS.info} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemTitle}>Push Notifications</Text>
                  <Text style={styles.menuItemSubtitle}>Get deal alerts nearby</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.borderDark, true: COLORS.primaryLight }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.white}
                ios_backgroundColor={COLORS.borderDark}
              />
            </View>
            <View style={styles.menuDivider} />
            <MenuItem
              icon="location-outline"
              iconColor={COLORS.success}
              iconBg={COLORS.successLight}
              title="Location Settings"
              subtitle="Manage location permissions"
              onPress={() => router.push('/profile/location')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="shield-checkmark-outline"
              iconColor={COLORS.secondary}
              iconBg={COLORS.secondaryLight + '30'}
              title="Privacy"
              subtitle="Control your data"
              onPress={() => router.push('/profile/privacy')}
              isLast
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              iconColor={COLORS.primary}
              iconBg={COLORS.primaryLighter}
              title="Help Center"
              subtitle="FAQs and support"
              onPress={() => router.push('/profile/help')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="document-text-outline"
              iconColor={COLORS.textSecondary}
              iconBg={COLORS.backgroundTertiary}
              title="Terms of Service"
              onPress={() => router.push('/profile/terms')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="lock-closed-outline"
              iconColor={COLORS.textSecondary}
              iconBg={COLORS.backgroundTertiary}
              title="Privacy Policy"
              onPress={() => router.push('/profile/privacy-policy')}
              isLast
            />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <View style={[styles.menuIconContainer, { backgroundColor: COLORS.errorLight }]}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          </View>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface MenuItemProps {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isLast?: boolean;
}

const MenuItem = ({
  icon,
  iconColor = COLORS.text,
  iconBg = COLORS.backgroundTertiary,
  title,
  subtitle,
  onPress,
}: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuItemLeft}>
      <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.heavy,
    color: COLORS.text,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
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
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
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
  profileCard: {
    backgroundColor: COLORS.white,
    marginTop: 1,
    ...SHADOWS.sm,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.base,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundTertiary,
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.md,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLighter,
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginLeft: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  menuSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.base,
  },
  menuSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
  },
  menuItemSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: SPACING.base + 40 + SPACING.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.base,
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  signOutText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  version: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    paddingVertical: SPACING.xl,
  },
});
