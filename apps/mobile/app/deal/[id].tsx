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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
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
      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/deals/${id}/generate-qr`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate QR code');
      }

      const data = await response.json();
      setQrData(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate QR code');
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

  const redeemMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/deals/${id}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to redeem deal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemption', id] });
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      setShowQR(true);
      Alert.alert('Success!', 'Deal redeemed successfully. Show this QR code to the staff.');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleRedeem = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to redeem this deal.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    Alert.alert(
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
        <ActivityIndicator size="large" color={Colors.primary} />
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
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
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
              <Ionicons name="ticket-outline" size={20} color={Colors.textSecondary} />
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
            <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
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
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.qrTitle}>Show this to staff</Text>

            {qrLoading ? (
              <View style={styles.qrLoadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
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
                    <Ionicons name="time-outline" size={16} color={Colors.warning} />
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
            style={styles.showQRButton}
            onPress={generateQRCode}
          >
            <Ionicons name="qr-code" size={24} color="#fff" />
            <Text style={styles.buttonText}>Show QR Code</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.redeemButton,
              !canRedeem && styles.disabledButton,
            ]}
            onPress={handleRedeem}
            disabled={!canRedeem || redeemMutation.isPending}
          >
            {redeemMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={isExpired ? 'time-outline' : isMaxedOut ? 'close-circle-outline' : 'ticket-outline'}
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
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.textSecondary,
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
    backgroundColor: Colors.primary,
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
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  timeInfo: {
    marginLeft: 12,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  expiredText: {
    color: Colors.error,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.text,
  },
  redemptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  redemptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  termsContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  termsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
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
    color: Colors.text,
  },
  venueType: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  venueAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  showQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
    color: Colors.text,
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
    color: Colors.text,
    marginBottom: 4,
  },
  qrVenue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  qrRedeemed: {
    fontSize: 12,
    color: Colors.success,
  },
  qrLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  qrLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight || '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  expiryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'monospace',
  },
});
