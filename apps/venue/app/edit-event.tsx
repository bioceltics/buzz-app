import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/services/supabase';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';
import { useConfirmDialog } from '@/hooks';
import { GradientButton } from '@/components/ui';

const EVENT_TYPES = [
  { id: 'live_music', label: 'Live Music', icon: 'musical-notes' },
  { id: 'dj', label: 'DJ Night', icon: 'disc' },
  { id: 'comedy', label: 'Comedy', icon: 'happy' },
  { id: 'trivia', label: 'Trivia', icon: 'help-circle' },
  { id: 'sports', label: 'Sports', icon: 'football' },
  { id: 'themed', label: 'Themed Party', icon: 'color-palette' },
  { id: 'special', label: 'Special Event', icon: 'star' },
  { id: 'other', label: 'Other', icon: 'calendar' },
];

const AGE_RESTRICTIONS = [
  { id: 'none', label: 'No Restriction' },
  { id: '18+', label: '18+' },
  { id: '19+', label: '19+' },
  { id: '21+', label: '21+' },
];

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { showDeleteDialog } = useConfirmDialog();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [coverCharge, setCoverCharge] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('none');
  const [capacity, setCapacity] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch event
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Populate form with existing data
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setEventType(event.event_type || '');
      setStartDate(event.start_date || '');
      setEndDate(event.end_date || '');
      setStartTime(event.start_time || '');
      setEndTime(event.end_time || '');
      setIsFree(event.is_free ?? true);
      setCoverCharge(event.cover_charge?.toString() || '');
      setAgeRestriction(event.age_restriction || 'none');
      setCapacity(event.capacity?.toString() || '');
      setDressCode(event.dress_code || '');
      setIsActive(event.is_active ?? true);
    }
  }, [event]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('Title is required');
      if (!eventType) throw new Error('Event type is required');
      if (!startDate || !startTime) throw new Error('Start date and time are required');

      const { error } = await supabase
        .from('events')
        .update({
          title: title.trim(),
          description: description.trim(),
          event_type: eventType,
          start_date: startDate,
          end_date: endDate || startDate,
          start_time: startTime,
          end_time: endTime || null,
          is_free: isFree,
          cover_charge: isFree ? 0 : parseFloat(coverCharge) || 0,
          age_restriction: ageRestriction,
          capacity: capacity ? parseInt(capacity) : null,
          dress_code: dressCode.trim() || null,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });

      if (Platform.OS === 'web') {
        window.alert('Event updated successfully!');
      } else {
        Alert.alert('Success', 'Event updated successfully!');
      }
      router.back();
    },
    onError: (error: Error) => {
      if (Platform.OS === 'web') {
        window.alert(`Error: ${error.message}`);
      } else {
        Alert.alert('Error', error.message);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-events'] });

      if (Platform.OS === 'web') {
        window.alert('Event deleted successfully!');
      } else {
        Alert.alert('Success', 'Event deleted successfully!');
      }
      router.back();
    },
    onError: (error: Error) => {
      if (Platform.OS === 'web') {
        window.alert(`Error: ${error.message}`);
      } else {
        Alert.alert('Error', error.message);
      }
    },
  });

  const handleDelete = () => {
    showDeleteDialog(title, () => deleteMutation.mutate());
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Event</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Ionicons name="trash-outline" size={22} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Toggle */}
        <TouchableOpacity
          style={[styles.toggleCard, isActive ? styles.toggleActive : styles.toggleInactive]}
          onPress={() => setIsActive(!isActive)}
        >
          <View style={styles.toggleContent}>
            <Ionicons
              name={isActive ? 'checkmark-circle' : 'pause-circle'}
              size={24}
              color={isActive ? COLORS.success : COLORS.textSecondary}
            />
            <View>
              <Text style={styles.toggleTitle}>
                {isActive ? 'Event is Active' : 'Event is Hidden'}
              </Text>
              <Text style={styles.toggleSubtitle}>
                {isActive ? 'Visible to customers' : 'Hidden from customers'}
              </Text>
            </View>
          </View>
          <View style={[styles.toggle, isActive && styles.toggleOn]}>
            <View style={[styles.toggleThumb, isActive && styles.toggleThumbOn]} />
          </View>
        </TouchableOpacity>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Friday Night Jazz"
              placeholderTextColor={COLORS.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your event..."
              placeholderTextColor={COLORS.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Type *</Text>
            <View style={styles.typeGrid}>
              {EVENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    eventType === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() => setEventType(type.id)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={eventType === type.id ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      eventType === type.id && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Start Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textTertiary}
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Start Time *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor={COLORS.textTertiary}
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>End Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textTertiary}
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>End Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor={COLORS.textTertiary}
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </View>
        </View>

        {/* Admission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admission</Text>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Free Event</Text>
              <Text style={styles.switchSubtext}>Toggle off to set a cover charge</Text>
            </View>
            <Switch
              value={isFree}
              onValueChange={setIsFree}
              trackColor={{ false: COLORS.borderLight, true: COLORS.primary + '50' }}
              thumbColor={isFree ? COLORS.primary : COLORS.textTertiary}
            />
          </View>

          {!isFree && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cover Charge ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.textTertiary}
                value={coverCharge}
                onChangeText={setCoverCharge}
                keyboardType="decimal-pad"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age Restriction</Text>
            <View style={styles.ageGrid}>
              {AGE_RESTRICTIONS.map((age) => (
                <TouchableOpacity
                  key={age.id}
                  style={[
                    styles.ageButton,
                    ageRestriction === age.id && styles.ageButtonActive,
                  ]}
                  onPress={() => setAgeRestriction(age.id)}
                >
                  <Text
                    style={[
                      styles.ageButtonText,
                      ageRestriction === age.id && styles.ageButtonTextActive,
                    ]}
                  >
                    {age.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Additional Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capacity Limit</Text>
            <TextInput
              style={styles.input}
              placeholder="Leave empty for no limit"
              placeholderTextColor={COLORS.textTertiary}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dress Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Smart Casual"
              placeholderTextColor={COLORS.textTertiary}
              value={dressCode}
              onChangeText={setDressCode}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <GradientButton
            label="Save Changes"
            onPress={() => updateMutation.mutate()}
            icon="checkmark"
            iconPosition="right"
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending}
            fullWidth
            size="lg"
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: SPACING.md,
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
  },
  toggleActive: {
    backgroundColor: '#D1FAE5',
  },
  toggleInactive: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  toggleTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  toggleSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.textTertiary,
    padding: 2,
  },
  toggleOn: {
    backgroundColor: COLORS.success,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  toggleThumbOn: {
    marginLeft: 'auto',
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  typeButtonTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  switchLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  switchSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  ageButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  ageButtonActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  ageButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  ageButtonTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  submitSection: {
    padding: SPACING.lg,
  },
  submitButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFF',
  },
  bottomPadding: {
    height: 40,
  },
});
