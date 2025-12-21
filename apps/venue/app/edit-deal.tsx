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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/colors';

const DISCOUNT_TYPES = [
  { id: 'percentage', label: 'Percentage Off', icon: 'pricetag' },
  { id: 'fixed', label: 'Fixed Amount Off', icon: 'cash' },
  { id: 'bogo', label: 'Buy One Get One', icon: 'gift' },
  { id: 'free_item', label: 'Free Item', icon: 'star' },
];

export default function EditDealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [terms, setTerms] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch deal
  const { data: deal, isLoading } = useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
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
    if (deal) {
      setTitle(deal.title || '');
      setDescription(deal.description || '');
      setDiscountType(deal.discount_type || 'percentage');
      setDiscountValue(deal.discount_value?.toString() || '');
      setTerms(deal.terms || '');
      setMaxRedemptions(deal.max_redemptions?.toString() || '');
      setIsActive(deal.is_active);
    }
  }, [deal]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('Title is required');
      if (!description.trim()) throw new Error('Description is required');

      const { error } = await supabase
        .from('deals')
        .update({
          title: title.trim(),
          description: description.trim(),
          discount_type: discountType,
          discount_value: parseFloat(discountValue) || 0,
          terms: terms.trim() || null,
          max_redemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', id] });

      if (Platform.OS === 'web') {
        window.alert('Deal updated successfully!');
      } else {
        Alert.alert('Success', 'Deal updated successfully!');
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Deal</Text>
        <View style={{ width: 40 }} />
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
                {isActive ? 'Deal is Active' : 'Deal is Paused'}
              </Text>
              <Text style={styles.toggleSubtitle}>
                {isActive ? 'Customers can see and redeem this deal' : 'Deal is hidden from customers'}
              </Text>
            </View>
          </View>
          <View style={[styles.toggle, isActive && styles.toggleOn]}>
            <View style={[styles.toggleThumb, isActive && styles.toggleThumbOn]} />
          </View>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Deal Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 50% Off All Drinks"
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
            placeholder="Describe your deal..."
            placeholderTextColor={COLORS.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Discount Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Discount Type</Text>
          <View style={styles.optionsGrid}>
            {DISCOUNT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionCard,
                  discountType === type.id && styles.optionCardActive,
                ]}
                onPress={() => setDiscountType(type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={discountType === type.id ? COLORS.primary : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    discountType === type.id && styles.optionLabelActive,
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
              {discountType === 'percentage' ? 'Percentage Off' : 'Amount Off ($)'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={discountType === 'percentage' ? 'e.g., 25' : 'e.g., 10'}
              placeholderTextColor={COLORS.textTertiary}
              value={discountValue}
              onChangeText={setDiscountValue}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Max Redemptions */}
        <View style={styles.field}>
          <Text style={styles.label}>Max Redemptions</Text>
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
            placeholder="e.g., Valid for dine-in only."
            placeholderTextColor={COLORS.textTertiary}
            value={terms}
            onChangeText={setTerms}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Stats */}
        {deal && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Deal Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{deal.redemption_count || 0}</Text>
                <Text style={styles.statLabel}>Redemptions</Text>
              </View>
              {deal.max_redemptions && (
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{deal.max_redemptions}</Text>
                  <Text style={styles.statLabel}>Max Allowed</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateButton, updateMutation.isPending && styles.updateButtonDisabled]}
          onPress={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.updateButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: SPACING['2xl'] }} />
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
    paddingVertical: SPACING.sm,
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
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  toggleActive: {
    backgroundColor: COLORS.successLight || '#D1FAE5',
  },
  toggleInactive: {
    backgroundColor: COLORS.backgroundTertiary,
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
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  optionLabelActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.lg,
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
