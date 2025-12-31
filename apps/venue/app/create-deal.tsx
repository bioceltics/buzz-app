import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/colors';
import { GradientButton } from '@/components/ui';

const DISCOUNT_TYPES = [
  { id: 'percentage', label: '% Off', icon: 'pricetag' },
  { id: 'fixed', label: '$ Off', icon: 'cash' },
  { id: 'bogo', label: 'BOGO', icon: 'gift' },
  { id: 'free_item', label: 'Free Item', icon: 'star' },
];

const DEAL_CATEGORIES = [
  { id: 'happy_hour', label: 'Happy Hour', icon: 'beer' },
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'drinks', label: 'Drinks', icon: 'wine' },
  { id: 'special', label: 'Special', icon: 'sparkles' },
];

const DURATION_OPTIONS = [
  { id: '1', label: '1 Hour', hours: 1 },
  { id: '2', label: '2 Hours', hours: 2 },
  { id: '4', label: '4 Hours', hours: 4 },
  { id: '8', label: '8 Hours', hours: 8 },
  { id: '12', label: '12 Hours', hours: 12 },
  { id: '24', label: '24 Hours', hours: 24 },
];

export default function CreateDealScreen() {
  const { venue } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [category, setCategory] = useState('happy_hour');
  const [duration, setDuration] = useState('4');
  const [terms, setTerms] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');

  const selectedDuration = DURATION_OPTIONS.find(d => d.id === duration);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!venue) throw new Error('Venue not found');
      if (!title.trim()) throw new Error('Title is required');
      if (!description.trim()) throw new Error('Description is required');
      if (!discountValue && discountType !== 'bogo' && discountType !== 'free_item') {
        throw new Error('Discount value is required');
      }

      const startTime = new Date();
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + (selectedDuration?.hours || 4));

      const { data, error } = await supabase
        .from('deals')
        .insert({
          venue_id: venue.id,
          title: title.trim(),
          description: description.trim(),
          discount_type: discountType,
          discount_value: parseFloat(discountValue) || 0,
          type: 'flash_deal',
          category: category,
          terms: terms.trim() || null,
          max_redemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          is_active: true,
          is_featured: false,
          redemption_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-deals'] });
      queryClient.invalidateQueries({ queryKey: ['venue-deals-stats'] });

      if (Platform.OS === 'web') {
        window.alert('Deal created successfully!');
      } else {
        Alert.alert('Success', 'Deal created successfully!');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Daily Deal</Text>
          <Text style={styles.headerSubtitle}>Valid for up to 24 hours</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="time-outline" size={20} color="#6366F1" />
          <Text style={styles.infoBannerText}>
            Deals are time-limited offers (max 24hrs). For longer promotions, create an Event instead.
          </Text>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Deal Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Happy Hour: 50% Off Cocktails"
            placeholderTextColor={COLORS.textTertiary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what customers get with this deal..."
            placeholderTextColor={COLORS.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {DEAL_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  category === cat.id && styles.categoryCardActive,
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={22}
                  color={category === cat.id ? COLORS.primary : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.id && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Discount Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Discount Type</Text>
          <View style={styles.discountTypeRow}>
            {DISCOUNT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.discountTypeBtn,
                  discountType === type.id && styles.discountTypeBtnActive,
                ]}
                onPress={() => setDiscountType(type.id)}
              >
                <Text
                  style={[
                    styles.discountTypeText,
                    discountType === type.id && styles.discountTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Discount Value */}
        {(discountType === 'percentage' || discountType === 'fixed') && (
          <View style={styles.field}>
            <Text style={styles.label}>
              {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
            </Text>
            <View style={styles.inputWithPrefix}>
              {discountType === 'fixed' && <Text style={styles.inputPrefix}>$</Text>}
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder={discountType === 'percentage' ? '25' : '10'}
                placeholderTextColor={COLORS.textTertiary}
                value={discountValue}
                onChangeText={setDiscountValue}
                keyboardType="numeric"
              />
              {discountType === 'percentage' && <Text style={styles.inputSuffix}>%</Text>}
            </View>
          </View>
        )}

        {/* Duration */}
        <View style={styles.field}>
          <Text style={styles.label}>Duration</Text>
          <View style={styles.durationGrid}>
            {DURATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.durationBtn,
                  duration === opt.id && styles.durationBtnActive,
                ]}
                onPress={() => setDuration(opt.id)}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === opt.id && styles.durationTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.durationHint}>
            Deal will start now and end in {selectedDuration?.label.toLowerCase()}
          </Text>
        </View>

        {/* Max Redemptions */}
        <View style={styles.field}>
          <Text style={styles.label}>Limit Redemptions (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Leave empty for unlimited"
            placeholderTextColor={COLORS.textTertiary}
            value={maxRedemptions}
            onChangeText={setMaxRedemptions}
            keyboardType="numeric"
          />
        </View>

        {/* Terms */}
        <View style={styles.field}>
          <Text style={styles.label}>Terms & Conditions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., Dine-in only. One per customer."
            placeholderTextColor={COLORS.textTertiary}
            value={terms}
            onChangeText={setTerms}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Create Button */}
        <GradientButton
          label="Launch Deal"
          onPress={() => createMutation.mutate()}
          icon="flash"
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          fullWidth
          size="lg"
          style={{ marginTop: SPACING.md }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#EEF2FF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoBannerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#4338CA',
    lineHeight: 20,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
  },
  inputFlex: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    paddingTop: SPACING.md,
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.base,
  },
  inputPrefix: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  inputSuffix: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  categoryCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  discountTypeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  discountTypeBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  discountTypeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  discountTypeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
  discountTypeTextActive: {
    color: '#FFF',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  durationBtn: {
    width: '31%',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  durationBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
  durationTextActive: {
    color: '#FFF',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  durationHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  createButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.md,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
