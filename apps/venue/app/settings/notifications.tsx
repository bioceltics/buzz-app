import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings, NotificationPreferences } from '@/hooks/useSettings';
import { COLORS, SHADOWS } from '@/constants/colors';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  newMessages: true,
  dealRedemptions: true,
  weeklyReport: false,
};

interface NotificationOption {
  key: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: string;
  gradient: [string, string];
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    key: 'emailNotifications',
    title: 'Email Notifications',
    description: 'Receive updates and alerts via email',
    icon: 'mail',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  {
    key: 'pushNotifications',
    title: 'Push Notifications',
    description: 'Get instant notifications on your device',
    icon: 'notifications',
    gradient: ['#8B5CF6', '#A78BFA'],
  },
  {
    key: 'newMessages',
    title: 'New Messages',
    description: 'Notify when customers send messages',
    icon: 'chatbubble',
    gradient: ['#10B981', '#34D399'],
  },
  {
    key: 'dealRedemptions',
    title: 'Deal Redemptions',
    description: 'Alert when deals are redeemed',
    icon: 'ticket',
    gradient: [COLORS.primary, '#D81B60'],
  },
  {
    key: 'weeklyReport',
    title: 'Weekly Report',
    description: 'Receive weekly performance summary',
    icon: 'stats-chart',
    gradient: ['#F59E0B', '#FBBF24'],
  },
];

export default function NotificationsScreen() {
  const { user, isLoading, updateNotificationPreferences, isDemoMode } = useSettings();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && (user as any).notification_preferences) {
      setPreferences((user as any).notification_preferences);
    }
  }, [user]);

  const togglePreference = async (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);

    setSaving(true);
    await updateNotificationPreferences(newPreferences);
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#EDE9FE', '#DDD6FE']}
            style={styles.infoIconBg}
          >
            <Ionicons name="notifications" size={20} color="#6366F1" />
          </LinearGradient>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Stay Informed</Text>
            <Text style={styles.infoText}>
              Choose how you'd like to receive updates about your venue
            </Text>
          </View>
        </View>

        {/* Notification Options */}
        <View style={styles.card}>
          {NOTIFICATION_OPTIONS.map((option, index) => (
            <View
              key={option.key}
              style={[
                styles.optionRow,
                index === NOTIFICATION_OPTIONS.length - 1 && styles.lastOptionRow,
              ]}
            >
              <LinearGradient
                colors={option.gradient}
                style={styles.optionIcon}
              >
                <Ionicons name={option.icon as any} size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Switch
                value={preferences[option.key]}
                onValueChange={() => togglePreference(option.key)}
                trackColor={{ false: '#E5E7EB', true: COLORS.primaryLighter }}
                thumbColor={preferences[option.key] ? COLORS.primary : '#9CA3AF'}
                disabled={saving}
              />
            </View>
          ))}
        </View>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <View style={styles.demoNotice}>
            <Ionicons name="flask" size={18} color="#6366F1" />
            <Text style={styles.demoNoticeText}>
              Demo mode: Changes are simulated
            </Text>
          </View>
        )}

        {/* Helper Text */}
        <View style={styles.helperCard}>
          <Ionicons name="information-circle" size={18} color={COLORS.textTertiary} />
          <Text style={styles.helperText}>
            You can change these settings at any time. Some notifications may be required for critical updates.
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastOptionRow: {
    borderBottomWidth: 0,
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
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
  },
  demoNoticeText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 20,
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
});
