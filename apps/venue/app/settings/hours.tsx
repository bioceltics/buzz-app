import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings, OperatingHours } from '@/hooks/useSettings';
import { COLORS, SHADOWS } from '@/constants/colors';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_HOURS: OperatingHours = DAYS_OF_WEEK.reduce(
  (acc, day) => ({
    ...acc,
    [day]: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  }),
  {} as OperatingHours
);

export default function OperatingHoursScreen() {
  const { venue, isLoading, updateOperatingHours } = useSettings();
  const [hours, setHours] = useState<OperatingHours>(DEFAULT_HOURS);

  useEffect(() => {
    if (venue && (venue as any).hours) {
      setHours((venue as any).hours);
    }
  }, [venue]);

  const handleSave = async () => {
    const success = await updateOperatingHours(hours);
    if (success) {
      router.back();
    }
  };

  const toggleDay = (day: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen },
    }));
  };

  const updateTime = (day: string, field: 'openTime' | 'closeTime', value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operating Hours</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
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
            <Ionicons name="time" size={20} color="#6366F1" />
          </LinearGradient>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Set Your Schedule</Text>
            <Text style={styles.infoText}>
              Configure when your venue is open for business
            </Text>
          </View>
        </View>

        {/* Hours List */}
        <View style={styles.card}>
          {DAYS_OF_WEEK.map((day, index) => (
            <View
              key={day}
              style={[
                styles.dayRow,
                index === DAYS_OF_WEEK.length - 1 && styles.lastDayRow,
              ]}
            >
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day}</Text>
                <View style={styles.toggleContainer}>
                  <Text
                    style={[
                      styles.statusText,
                      hours[day]?.isOpen ? styles.openText : styles.closedText,
                    ]}
                  >
                    {hours[day]?.isOpen ? 'Open' : 'Closed'}
                  </Text>
                  <Switch
                    value={hours[day]?.isOpen}
                    onValueChange={() => toggleDay(day)}
                    trackColor={{ false: '#E5E7EB', true: COLORS.primaryLighter }}
                    thumbColor={hours[day]?.isOpen ? COLORS.primary : '#9CA3AF'}
                  />
                </View>
              </View>

              {hours[day]?.isOpen && (
                <View style={styles.timeRow}>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>Opens</Text>
                    <TextInput
                      style={styles.timeField}
                      value={hours[day]?.openTime || '09:00'}
                      onChangeText={(value) => updateTime(day, 'openTime', value)}
                      placeholder="09:00"
                      placeholderTextColor={COLORS.textTertiary}
                    />
                  </View>
                  <View style={styles.timeSeparator}>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.textTertiary} />
                  </View>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>Closes</Text>
                    <TextInput
                      style={styles.timeField}
                      value={hours[day]?.closeTime || '22:00'}
                      onChangeText={(value) => updateTime(day, 'closeTime', value)}
                      placeholder="22:00"
                      placeholderTextColor={COLORS.textTertiary}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Helper Text */}
        <View style={styles.helperCard}>
          <Ionicons name="information-circle" size={18} color={COLORS.textTertiary} />
          <Text style={styles.helperText}>
            Use 24-hour format (e.g., 09:00 for 9 AM, 22:00 for 10 PM)
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
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLighter,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
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
  dayRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastDayRow: {
    borderBottomWidth: 0,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  openText: {
    color: '#059669',
  },
  closedText: {
    color: '#6B7280',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  timeField: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center',
  },
  timeSeparator: {
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});
