import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SHADOWS } from '@/constants/colors';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface LocationSetting {
  key: string;
  title: string;
  description: string;
  icon: string;
  gradient: [string, string];
}

const LOCATION_SETTINGS: LocationSetting[] = [
  {
    key: 'shareWithVenues',
    title: 'Share with Venues',
    description: 'Allow venues to see your approximate location for personalized deals',
    icon: 'business',
    gradient: ['#059669', '#10B981'],
  },
  {
    key: 'highAccuracy',
    title: 'High Accuracy Mode',
    description: 'Use GPS for precise location (uses more battery)',
    icon: 'navigate',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  {
    key: 'nearbyAlerts',
    title: 'Nearby Deal Alerts',
    description: 'Get notified when you\'re near venues with active deals',
    icon: 'notifications',
    gradient: ['#F59E0B', '#FBBF24'],
  },
];

export default function LocationSettingsScreen() {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, boolean>>({
    shareWithVenues: true,
    highAccuracy: false,
    nearbyAlerts: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    setIsCheckingPermission(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);

      if (status === 'granted') {
        // Get current location for display
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (address) {
            setCurrentLocation(`${address.city || address.region}, ${address.country}`);
          }
        } catch (e) {
          setCurrentLocation('Location available');
        }
      }
    } catch (error) {
      console.error('Error checking permission:', error);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const requestPermission = async () => {
    setIsCheckingPermission(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);

      if (status === 'granted') {
        checkPermissionStatus();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const toggleSetting = (key: string) => {
    setSaving(true);
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setTimeout(() => setSaving(false), 300);
  };

  const getPermissionStatusDisplay = () => {
    switch (permissionStatus) {
      case 'granted':
        return { text: 'Enabled', color: '#10B981', icon: 'checkmark-circle' };
      case 'denied':
        return { text: 'Disabled', color: '#EF4444', icon: 'close-circle' };
      default:
        return { text: 'Not Set', color: '#F59E0B', icon: 'help-circle' };
    }
  };

  const statusDisplay = getPermissionStatusDisplay();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Location Settings</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyTitle}>Sign in to manage location</Text>
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
        <Text style={styles.headerTitle}>Location Settings</Text>
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
            colors={['#D1FAE5', '#A7F3D0']}
            style={styles.infoIconBg}
          >
            <Ionicons name="location" size={20} color="#059669" />
          </LinearGradient>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Location Services</Text>
            <Text style={styles.infoText}>
              Enable location to discover deals and venues near you
            </Text>
          </View>
        </View>

        {/* Permission Status Section */}
        <Text style={styles.sectionTitle}>PERMISSION STATUS</Text>
        <View style={styles.card}>
          <View style={styles.permissionRow}>
            <LinearGradient
              colors={['#059669', '#10B981']}
              style={styles.optionIcon}
            >
              <Ionicons name="locate" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Location Access</Text>
              <View style={styles.statusRow}>
                <Ionicons name={statusDisplay.icon as any} size={16} color={statusDisplay.color} />
                <Text style={[styles.statusText, { color: statusDisplay.color }]}>
                  {statusDisplay.text}
                </Text>
              </View>
            </View>
            {isCheckingPermission ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : permissionStatus === 'granted' ? (
              <View style={styles.enabledBadge}>
                <Text style={styles.enabledBadgeText}>Active</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.enableButton}
                onPress={permissionStatus === 'denied' ? openSettings : requestPermission}
              >
                <Text style={styles.enableButtonText}>
                  {permissionStatus === 'denied' ? 'Open Settings' : 'Enable'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {currentLocation && (
            <>
              <View style={styles.divider} />
              <View style={styles.locationInfoRow}>
                <Ionicons name="pin" size={18} color={COLORS.textSecondary} />
                <Text style={styles.locationText}>{currentLocation}</Text>
              </View>
            </>
          )}
        </View>

        {/* Location Settings Section */}
        <Text style={styles.sectionTitle}>LOCATION PREFERENCES</Text>
        <View style={styles.card}>
          {LOCATION_SETTINGS.map((setting, index) => (
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
                  trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
                  thumbColor={settings[setting.key] ? '#059669' : '#9CA3AF'}
                  disabled={saving || permissionStatus !== 'granted'}
                />
              </View>
              {index < LOCATION_SETTINGS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {permissionStatus !== 'granted' && (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              Enable location access to use these features
            </Text>
          </View>
        )}

        {/* Helper Text */}
        <View style={styles.helperCard}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.textTertiary} />
          <Text style={styles.helperText}>
            Your location data is only used to show nearby deals and venues. We never share your exact location with third parties.
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
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionRow: {
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  enabledBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  enabledBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  enableButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  enableButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  locationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
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
