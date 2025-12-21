import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/colors';
import { formatTimeRemaining, formatDateTime } from '../../utils/date';
import { getMockDealById } from '../../hooks/useDeals';

const { width } = Dimensions.get('window');

interface QRData {
  qrCode: string;
  redemptionCode: string;
  expiresAt: string;
  deal: {
    id: string;
    title: string;
    venue: {
      id: string;
      name: string;
    };
  };
}

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrExpiry, setQrExpiry] = useState<number>(0);

  const { data: deal, isLoading, error } = useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select(`*, venue:venues(*)`)
          .eq('id', id)
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        // Fallback to mock data for demo purposes
        const mockDeal = getMockDealById(id as string);
        if (mockDeal) return mockDeal;
        throw err;
      }
    },
  });

  const { data: redemption } = useQuery({
    queryKey: ['redemption', id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('redemptions')
        .select('*')
        .eq('deal_id', id)
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Countdown timer for QR code expiry
  useEffect(() => {
    if (!qrData) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiryTime = new Date(qrData.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setQrExpiry(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData]);

  const generateQRCode = async () => {
    setQrLoading(true);
    setShowQR(true);

    try {
      if (!user || !deal) {
        throw new Error('Not authenticated or deal not found');
      }

      // Generate a unique redemption code
      const redemptionCode = Math.random().toString(36).substring(2, 10).toUpperCase() +
                             Math.random().toString(36).substring(2, 10).toUpperCase();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

      // Create QR code data
      const qrCodeData = JSON.stringify({
        type: 'buzz_deal',
        dealId: id,
        venueId: deal.venue_id,
        userId: user.id,
        code: redemptionCode,
        expiresAt: expiresAt.toISOString(),
      });

      // Generate QR code as data URL using a simple approach
      // For web, we'll use a QR code service or show the code directly
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`;

      setQrData({
        qrCode: qrCodeUrl,
        redemptionCode,
        expiresAt: expiresAt.toISOString(),
        deal: {
          id: deal.id,
          title: deal.title,
          venue: {
            id: deal.venue?.id || deal.venue_id,
            name: deal.venue?.name || 'Venue',
          },
        },
      });
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(`Error\n\n${error.message || 'Failed to generate QR code'}`);
      } else {
        Alert.alert('Error', error.message || 'Failed to generate QR code');
      }
      setShowQR(false);
    } finally {
      setQrLoading(false);
    }
  };

  const formatExpiryTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const closeQRModal = () => {
    setShowQR(false);
    setQrData(null);
  };

  // Helper to check if string is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const redeemMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Check if this is a mock deal (non-UUID ID)
      if (!isValidUUID(id as string)) {
        throw new Error('This is a demo deal. Create real deals in your dashboard to enable redemption.');
      }

      // Check if deal is still active
      const now = new Date();
      if (!deal || new Date(deal.end_time) < now || new Date(deal.start_time) > now) {
        throw new Error('Deal is not currently active');
      }

      // Check if max redemptions reached
      if (deal.max_redemptions && deal.redemption_count >= deal.max_redemptions) {
        throw new Error('Deal has reached maximum redemptions');
      }

      // Check if user already redeemed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: existing } = await supabase
        .from('redemptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('deal_id', id)
        .gte('redeemed_at', today.toISOString())
        .maybeSingle();

      if (existing) {
        throw new Error('You have already redeemed this deal today');
      }

      // Create redemption directly in Supabase
      const { data: redemption, error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          user_id: user.id,
          deal_id: id,
          venue_id: deal.venue_id,
        })
        .select()
        .single();

      if (redemptionError) throw redemptionError;

      // Increment redemption count
      await supabase
        .from('deals')
        .update({ redemption_count: (deal.redemption_count || 0) + 1 })
        .eq('id', id);

      return { redemption, message: 'Deal redeemed successfully!' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemption', id] });
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      // Generate QR code after successful redemption
      generateQRCode();
      if (Platform.OS === 'web') {
        window.alert('Success!\n\nDeal redeemed successfully. Show this QR code to the staff.');
      } else {
        Alert.alert('Success!', 'Deal redeemed successfully. Show this QR code to the staff.');
      }
    },
    onError: (error: Error) => {
      if (Platform.OS === 'web') {
        window.alert(`Error\n\n${error.message}`);
      } else {
        Alert.alert('Error', error.message);
      }
    },
  });

  const showAlert = (title: string, message: string, buttons?: { text: string; onPress?: () => void; style?: string }[]) => {
    if (Platform.OS === 'web') {
      // Web: use window.confirm for simple confirmations
      if (buttons && buttons.length > 1) {
        const confirmed = window.confirm(`${title}\n\n${message}`);
        if (confirmed) {
          const confirmButton = buttons.find(b => b.style !== 'cancel');
          confirmButton?.onPress?.();
        }
      } else {
        window.alert(`${title}\n\n${message}`);
        buttons?.[0]?.onPress?.();
      }
    } else {
      // Native: use Alert.alert
      Alert.alert(title, message, buttons);
    }
  };

  const handleRedeem = () => {
    if (!user) {
      showAlert('Login Required', 'Please login to redeem this deal.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    showAlert(
      'Redeem Deal',
      'Are you sure you want to redeem this deal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Redeem', onPress: () => redeemMutation.mutate() },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !deal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Deal not found</Text>
      </View>
    );
  }

  const venue = deal.venue;
  const isExpired = new Date(deal.end_time) < new Date();
  const isMaxedOut = deal.max_redemptions && deal.redemption_count >= deal.max_redemptions;
  const canRedeem = !isExpired && !isMaxedOut && !redemption;

  const getDiscountDisplay = () => {
    switch (deal.discount_type) {
      case 'percentage':
        return `${deal.discount_value}% OFF`;
      case 'fixed':
        return `$${deal.discount_value} OFF`;
      case 'bogo':
        return 'BUY 1 GET 1';
      case 'free_item':
        return 'FREE ITEM';
      default:
        return 'SPECIAL DEAL';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: deal.image_url || venue?.cover_image_url || 'https://via.placeholder.com/400x200' }}
            style={styles.image}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{getDiscountDisplay()}</Text>
          </View>
        </View>

        {/* Deal Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{deal.title}</Text>
          <Text style={styles.description}>{deal.description}</Text>

          {/* Time Info */}
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>
                {isExpired ? 'Expired' : 'Ends in'}
              </Text>
              <Text style={[styles.timeValue, isExpired && styles.expiredText]}>
                {isExpired ? 'This deal has ended' : formatTimeRemaining(deal.end_time)}
              </Text>
            </View>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Valid:</Text>
            <Text style={styles.dateValue}>
              {formatDateTime(deal.start_time)} - {formatDateTime(deal.end_time)}
            </Text>
          </View>

          {/* Redemption Info */}
          {deal.max_redemptions && (
            <View style={styles.redemptionInfo}>
              <Ionicons name="ticket-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.redemptionText}>
                {deal.redemption_count} / {deal.max_redemptions} redeemed
              </Text>
            </View>
          )}

          {/* Terms */}
          {deal.terms && (
            <View style={styles.termsContainer}>
              <Text style={styles.termsLabel}>Terms & Conditions:</Text>
              <Text style={styles.termsText}>{deal.terms}</Text>
            </View>
          )}

          {/* Venue Card */}
          <TouchableOpacity
            style={styles.venueCard}
            onPress={() => router.push(`/venue/${venue.id}`)}
          >
            <Image
              source={{ uri: venue.logo_url || 'https://via.placeholder.com/60' }}
              style={styles.venueLogo}
            />
            <View style={styles.venueInfo}>
              <Text style={styles.venueName}>{venue.name}</Text>
              <Text style={styles.venueType}>{venue.type}</Text>
              <Text style={styles.venueAddress} numberOfLines={1}>
                {venue.address}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      {showQR && (
        <View style={styles.qrOverlay}>
          <View style={styles.qrModal}>
            <TouchableOpacity
              style={styles.closeQR}
              onPress={closeQRModal}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.qrTitle}>Show this to staff</Text>

            {qrLoading ? (
              <View style={styles.qrLoadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.qrLoadingText}>Generating QR Code...</Text>
              </View>
            ) : qrData ? (
              <>
                <Image
                  source={{ uri: qrData.qrCode }}
                  style={styles.qrImage}
                />
                {qrExpiry > 0 ? (
                  <View style={styles.expiryBadge}>
                    <Ionicons name="time-outline" size={16} color={COLORS.warning} />
                    <Text style={styles.expiryText}>
                      Expires in {formatExpiryTime(qrExpiry)}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.regenerateButton}
                    onPress={generateQRCode}
                  >
                    <Ionicons name="refresh" size={18} color="#fff" />
                    <Text style={styles.regenerateText}>Generate New Code</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.qrDeal}>{deal.title}</Text>
                <Text style={styles.qrVenue}>{venue.name}</Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeLabel}>Code</Text>
                  <Text style={styles.codeValue}>{qrData.redemptionCode}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>
      )}

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        {redemption ? (
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={generateQRCode}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.success, '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Ionicons name="qr-code" size={24} color="#fff" />
              <Text style={styles.buttonText}>Show QR Code</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.buttonWrapper, !canRedeem && styles.disabledWrapper]}
            onPress={handleRedeem}
            disabled={!canRedeem || redeemMutation.isPending}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canRedeem ? [COLORS.primary, '#D81B60'] : [COLORS.textSecondary, COLORS.textTertiary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {redeemMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={isExpired ? 'time-outline' : isMaxedOut ? 'close-circle-outline' : 'flash'}
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.buttonText}>
                    {isExpired
                      ? 'Deal Expired'
                      : isMaxedOut
                      ? 'Sold Out'
                      : 'Redeem Deal'}
                  </Text>
                  {canRedeem && <Ionicons name="arrow-forward" size={20} color="#fff" />}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width,
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  discountText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  timeInfo: {
    marginLeft: 12,
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  expiredText: {
    color: COLORS.error,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  redemptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  redemptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  termsContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  termsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
  },
  venueLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  venueInfo: {
    flex: 1,
    marginLeft: 12,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  venueType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  venueAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bottomContainer: {
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.xl,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.lg,
  },
  buttonWrapper: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  disabledWrapper: {
    opacity: 0.9,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  qrOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: width - 48,
  },
  closeQR: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  qrDeal: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  qrVenue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  qrRedeemed: {
    fontSize: 12,
    color: COLORS.success,
  },
  qrLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  qrLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight || '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  expiryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  regenerateText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  codeContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
});
