import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

const { width } = Dimensions.get('window');

interface Redemption {
  id: string;
  deal_id: string;
  redeemed_at: string;
  redemption_code: string;
  deal: {
    id: string;
    title: string;
    description: string;
    discount_type: string;
    discount_value: number;
    image_url: string;
    end_time: string;
    venue: {
      id: string;
      name: string;
      logo_url: string;
      address: string;
    };
  };
}

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

export default function RedemptionsScreen() {
  const { user, session } = useAuth();
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrExpiry, setQrExpiry] = useState<number>(0);

  const {
    data: redemptions,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['userRedemptions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('redemptions')
        .select(`
          id,
          deal_id,
          redeemed_at,
          redemption_code,
          deal:deals(
            id,
            title,
            description,
            discount_type,
            discount_value,
            image_url,
            end_time,
            venue:venues(id, name, logo_url, address)
          )
        `)
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Redemption[];
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

  const generateQRCode = async (redemption: Redemption) => {
    setQrLoading(true);
    setSelectedRedemption(redemption);
    setQrModalVisible(true);

    try {
      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/deals/${redemption.deal_id}/generate-qr`,
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
      setQrModalVisible(false);
    } finally {
      setQrLoading(false);
    }
  };

  const closeQRModal = () => {
    setQrModalVisible(false);
    setQrData(null);
    setSelectedRedemption(null);
  };

  const formatExpiryTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDiscountDisplay = (redemption: Redemption) => {
    const deal = redemption.deal;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>My Redemptions</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyTitle}>Sign in to view redemptions</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Redemptions</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : redemptions && redemptions.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={COLORS.primary}
            />
          }
        >
          <Text style={styles.sectionTitle}>
            {redemptions.length} Redeemed Deal{redemptions.length !== 1 ? 's' : ''}
          </Text>

          {redemptions.map((redemption) => (
            <TouchableOpacity
              key={redemption.id}
              style={styles.redemptionCard}
              onPress={() => generateQRCode(redemption)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Image
                  source={{
                    uri: redemption.deal.venue?.logo_url || 'https://via.placeholder.com/50',
                  }}
                  style={styles.venueLogo}
                />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.venueName}>{redemption.deal.venue?.name}</Text>
                  <Text style={styles.redeemedDate}>
                    Redeemed {formatDate(redemption.redeemed_at)}
                  </Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{getDiscountDisplay(redemption)}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.dealTitle}>{redemption.deal.title}</Text>
                {redemption.deal.description && (
                  <Text style={styles.dealDescription} numberOfLines={2}>
                    {redemption.deal.description}
                  </Text>
                )}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.qrPrompt}>
                  <Ionicons name="qr-code-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.qrPromptText}>Tap to show QR code</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="ticket-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Redemptions Yet</Text>
          <Text style={styles.emptySubtitle}>
            Redeem deals from your favorite venues and they'll appear here
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.browseButtonText}>Browse Deals</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QR Code Modal */}
      <Modal
        visible={qrModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeQRModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Show to Staff</Text>
            <TouchableOpacity onPress={closeQRModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {qrLoading ? (
              <View style={styles.qrLoadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.qrLoadingText}>Generating QR Code...</Text>
              </View>
            ) : qrData ? (
              <>
                <View style={styles.qrContainer}>
                  <Image source={{ uri: qrData.qrCode }} style={styles.qrImage} />
                </View>

                {qrExpiry > 0 ? (
                  <View style={styles.expiryContainer}>
                    <Ionicons name="time-outline" size={20} color={COLORS.warning} />
                    <Text style={styles.expiryText}>
                      Expires in {formatExpiryTime(qrExpiry)}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.regenerateButton}
                    onPress={() => selectedRedemption && generateQRCode(selectedRedemption)}
                  >
                    <Ionicons name="refresh" size={20} color={COLORS.white} />
                    <Text style={styles.regenerateButtonText}>Generate New Code</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.dealInfoContainer}>
                  <Text style={styles.dealInfoTitle}>{qrData.deal.title}</Text>
                  <Text style={styles.dealInfoVenue}>{qrData.deal.venue.name}</Text>
                </View>

                <View style={styles.codeContainer}>
                  <Text style={styles.codeLabel}>Redemption Code</Text>
                  <Text style={styles.codeText}>{qrData.redemptionCode}</Text>
                </View>

                <View style={styles.instructionsContainer}>
                  <View style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>1</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      Show this QR code to the venue staff
                    </Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>2</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      They will scan it to verify your deal
                    </Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>3</Text>
                    </View>
                    <Text style={styles.instructionText}>Enjoy your discount!</Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.base,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  redemptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  venueLogo: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundTertiary,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  venueName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  redeemedDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  discountBadge: {
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  discountText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  cardBody: {
    padding: SPACING.base,
  },
  dealTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dealDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundTertiary,
  },
  qrPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrPromptText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    ...SHADOWS.button,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.lg,
    ...SHADOWS.button,
  },
  signInButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.base,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.xl,
  },
  qrLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLoadingText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  qrContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    ...SHADOWS.lg,
    marginBottom: SPACING.lg,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
  },
  expiryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
  },
  regenerateButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  dealInfoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dealInfoTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  dealInfoVenue: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  codeContainer: {
    backgroundColor: COLORS.backgroundTertiary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  instructionNumberText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  instructionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
});
