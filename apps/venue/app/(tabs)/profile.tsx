import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SHADOWS } from '@/constants/colors';
import { BuzzeeIcon } from '@/components/ui/BuzzeeIcon';

interface MenuItem {
  title: string;
  subtitle: string;
  icon: string;
  gradient: [string, string];
  route?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function ProfileScreen() {
  const { user, venue, signOut, isDemoMode } = useAuth();

  const handleSignOut = async () => {
    const message = 'Are you sure you want to sign out?';

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        try {
          await signOut();
          router.replace('/(auth)/login');
        } catch (error) {
          console.error('Sign out error:', error);
        }
      }
    } else {
      Alert.alert('Sign Out', message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Sign out error:', error);
            }
          }
        },
      ]);
    }
  };

  const handleMenuPress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Business',
      items: [
        {
          title: 'Venue Profile',
          subtitle: 'Edit business details and information',
          icon: 'business',
          gradient: [COLORS.primary, '#D81B60'],
          route: '/settings/profile',
        },
        {
          title: 'Operating Hours',
          subtitle: 'Set your weekly schedule',
          icon: 'time',
          gradient: ['#6366F1', '#8B5CF6'],
          route: '/settings/hours',
        },
        {
          title: 'Photos & Media',
          subtitle: 'Upload logo, cover, and gallery images',
          icon: 'images',
          gradient: ['#059669', '#10B981'],
          route: '/settings/media',
        },
      ],
    },
    {
      title: 'Billing & Subscription',
      items: [
        {
          title: 'Subscription & Billing',
          subtitle: 'View plans and manage payments',
          icon: 'diamond',
          gradient: ['#D97706', '#F59E0B'],
          route: '/settings/billing',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          title: 'Notifications',
          subtitle: 'Configure alerts and updates',
          icon: 'notifications',
          gradient: ['#DC2626', '#EF4444'],
          route: '/settings/notifications',
        },
        {
          title: 'Help & Support',
          subtitle: 'Get help with your account',
          icon: 'help-circle',
          gradient: ['#0891B2', '#06B6D4'],
        },
      ],
    },
  ];

  const getVenueTypeLabel = (type: string | undefined) => {
    const types: { [key: string]: string } = {
      bar: 'Bar & Lounge',
      restaurant: 'Restaurant',
      club: 'Night Club',
      cafe: 'Cafe',
      hotel: 'Hotel',
    };
    return types[type || ''] || 'Business';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <View style={styles.demoBanner}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.demoBannerGradient}
            >
              <Ionicons name="flask" size={18} color="#FFF" />
              <Text style={styles.demoBannerText}>Demo Mode Active</Text>
            </LinearGradient>
          </View>
        )}

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
                  <LinearGradient
                    colors={[COLORS.primary, '#D81B60']}
                    style={styles.venueAvatarGradient}
                  >
                    <BuzzeeIcon size={32} color={COLORS.white} />
                  </LinearGradient>
                )}
              </View>
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue?.name || 'Your Venue'}</Text>
                <View style={styles.venueTypeBadge}>
                  <Text style={styles.venueTypeText}>{getVenueTypeLabel(venue?.type)}</Text>
                </View>
                {venue?.address && (
                  <View style={styles.venueAddressRow}>
                    <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.venueAddress} numberOfLines={1}>
                      {venue.address}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.editVenueButton}>
                <Ionicons name="pencil" size={18} color={COLORS.primary} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Account Info Card */}
        <View style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View style={styles.accountIconWrapper}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Account</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#059669" />
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
                    <Ionicons name={item.icon as any} size={20} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.menuArrow}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
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
          <View style={styles.signOutContent}>
            <View style={styles.signOutIconWrapper}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
            </View>
            <Text style={styles.signOutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Buzzee for Business</Text>
          <Text style={styles.versionNumber}>Version 1.0.0</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  headerPlaceholder: {
    width: 44,
  },
  demoBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  demoBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  demoBannerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  venueCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  venueCardGradient: {
    padding: 20,
  },
  venueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueAvatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  venueAvatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueInfo: {
    flex: 1,
    marginLeft: 16,
  },
  venueName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  venueTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  venueTypeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  venueAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  venueAddress: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
  },
  editVenueButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.sm,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
    marginLeft: 14,
  },
  accountLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  accountEmail: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 16,
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
  menuCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  menuSubtitle: {
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
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 32,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    overflow: 'hidden',
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  signOutIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    gap: 4,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  versionNumber: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  bottomPadding: {
    height: 120,
  },
});
