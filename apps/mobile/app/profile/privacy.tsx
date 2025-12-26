import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SHADOWS } from '@/constants/colors';

interface PrivacySetting {
  key: string;
  title: string;
  description: string;
  icon: string;
  gradient: [string, string];
}

const PRIVACY_SETTINGS: PrivacySetting[] = [
  {
    key: 'profileVisibility',
    title: 'Public Profile',
    description: 'Allow others to see your profile and reviews',
    icon: 'eye',
    gradient: ['#6366F1', '#8B5CF6'],
  },
  {
    key: 'showActivityStatus',
    title: 'Activity Status',
    description: 'Show when you were last active',
    icon: 'time',
    gradient: ['#10B981', '#34D399'],
  },
  {
    key: 'shareLocation',
    title: 'Share Location',
    description: 'Allow venues to see your general location',
    icon: 'location',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  {
    key: 'personalizedDeals',
    title: 'Personalized Deals',
    description: 'Get deal recommendations based on your activity',
    icon: 'sparkles',
    gradient: ['#F59E0B', '#FBBF24'],
  },
  {
    key: 'marketingEmails',
    title: 'Marketing Emails',
    description: 'Receive promotional emails and newsletters',
    icon: 'mail',
    gradient: [COLORS.primary, '#D81B60'],
  },
];

export default function PrivacyScreen() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    profileVisibility: true,
    showActivityStatus: true,
    shareLocation: true,
    personalizedDeals: true,
    marketingEmails: false,
  });
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSetting = (key: string) => {
    setSaving(true);
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    // Simulate save delay
    setTimeout(() => setSaving(false), 300);
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download Your Data',
      'We will prepare a copy of your data and send it to your registered email address. This may take up to 48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Download',
          onPress: () => {
            Alert.alert('Request Submitted', 'You will receive an email when your data is ready to download.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type "DELETE" to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'I Understand, Delete',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeleting(true);
                    // In a real app, call API to delete account
                    setTimeout(async () => {
                      setIsDeleting(false);
                      await signOut();
                      router.replace('/(auth)/login');
                    }, 1500);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyTitle}>Sign in to manage privacy</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        {saving ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#DBEAFE', '#BFDBFE']}
            style={styles.infoIconBg}
          >
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
          </LinearGradient>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Your Privacy Matters</Text>
            <Text style={styles.infoText}>
              Control how your information is used and shared
            </Text>
          </View>
        </View>

        {/* Privacy Settings Section */}
        <Text style={styles.sectionTitle}>PRIVACY CONTROLS</Text>
        <View style={styles.card}>
          {PRIVACY_SETTINGS.map((setting, index) => (
            <View key={setting.key}>
              <View style={styles.optionRow}>
                <LinearGradient
                  colors={setting.gradient}
                  style={styles.optionIcon}
                >
                  <Ionicons name={setting.icon as any} size={20} color="#FFF" />
                </LinearGradient>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{setting.title}</Text>
                  <Text style={styles.optionDescription}>{setting.description}</Text>
                </View>
                <Switch
                  value={settings[setting.key]}
                  onValueChange={() => toggleSetting(setting.key)}
                  trackColor={{ false: '#E5E7EB', true: COLORS.primaryLighter }}
                  thumbColor={settings[setting.key] ? COLORS.primary : '#9CA3AF'}
                  disabled={saving}
                />
              </View>
              {index < PRIVACY_SETTINGS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Data Management Section */}
        <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleDownloadData}>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              style={styles.optionIcon}
            >
              <Ionicons name="download" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Download My Data</Text>
              <Text style={styles.optionDescription}>
                Get a copy of all your data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAccount}>
            <LinearGradient
              colors={['#EF4444', '#F87171']}
              style={styles.optionIcon}
            >
              <Ionicons name="trash" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: '#EF4444' }]}>Delete Account</Text>
              <Text style={styles.optionDescription}>
                Permanently delete your account and data
              </Text>
            </View>
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/profile/privacy-policy' as any)}
          >
            <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/profile/terms' as any)}
          >
            <Ionicons name="reader-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Helper Text */}
        <View style={styles.helperCard}>
          <Ionicons name="information-circle" size={18} color={COLORS.textTertiary} />
          <Text style={styles.helperText}>
            Your privacy settings are saved automatically. For questions about your data, contact support@buzzee.ca
          </Text>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  infoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 14,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 20,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    flex: 1,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    marginTop: 20,
  },
  signInButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
