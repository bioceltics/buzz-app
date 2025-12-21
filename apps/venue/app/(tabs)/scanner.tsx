import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

// Conditionally import camera for native platforms
let BarCodeScanner: any = null;
if (Platform.OS !== 'web') {
  try {
    BarCodeScanner = require('expo-barcode-scanner').BarCodeScanner;
  } catch (e) {
    console.log('BarCodeScanner not available');
  }
}

interface QRData {
  type: string;
  dealId: string;
  venueId: string;
  userId: string;
  code: string;
  expiresAt: string;
}

interface VerificationResult {
  success: boolean;
  message: string;
  deal?: {
    title: string;
    discount_type: string;
    discount_value: number;
  };
  user?: {
    name: string;
  };
}

export default function ScannerScreen() {
  const { venue } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS !== 'web' && BarCodeScanner) {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, []);

  const verifyRedemption = async (data: string) => {
    setIsVerifying(true);
    setResult(null);

    try {
      // Parse QR code data
      let qrData: QRData;
      try {
        qrData = JSON.parse(data);
      } catch {
        throw new Error('Invalid QR code format');
      }

      if (qrData.type !== 'buzz_deal') {
        throw new Error('Invalid QR code type');
      }

      // Check if QR code is expired
      if (new Date(qrData.expiresAt) < new Date()) {
        throw new Error('This QR code has expired. Ask the customer to generate a new one.');
      }

      // Verify this is for our venue
      if (venue && qrData.venueId !== venue.id) {
        throw new Error('This deal is for a different venue');
      }

      // Get the deal
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', qrData.dealId)
        .single();

      if (dealError || !deal) {
        throw new Error('Deal not found');
      }

      // Check if deal is active
      const now = new Date();
      if (!deal.is_active || new Date(deal.end_time) < now) {
        throw new Error('This deal is no longer active');
      }

      // Check if already redeemed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: existingRedemption } = await supabase
        .from('redemptions')
        .select('id')
        .eq('user_id', qrData.userId)
        .eq('deal_id', qrData.dealId)
        .gte('redeemed_at', today.toISOString())
        .maybeSingle();

      if (existingRedemption) {
        setResult({
          success: true,
          message: 'Already verified today',
          deal: {
            title: deal.title,
            discount_type: deal.discount_type,
            discount_value: deal.discount_value,
          },
        });
        return;
      }

      // Create new redemption record
      await supabase
        .from('redemptions')
        .insert({
          user_id: qrData.userId,
          deal_id: qrData.dealId,
          venue_id: venue?.id,
        });

      // Increment redemption count
      await supabase
        .from('deals')
        .update({ redemption_count: (deal.redemption_count || 0) + 1 })
        .eq('id', qrData.dealId);

      // Get user info
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', qrData.userId)
        .single();

      setResult({
        success: true,
        message: 'Redemption verified!',
        deal: {
          title: deal.title,
          discount_type: deal.discount_type,
          discount_value: deal.discount_value,
        },
        user: userData ? { name: userData.full_name } : undefined,
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Verification failed',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    verifyRedemption(data);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a code');
      } else {
        Alert.alert('Error', 'Please enter a code');
      }
      return;
    }
    verifyRedemption(manualCode.trim());
  };

  const resetScanner = () => {
    setScanned(false);
    setResult(null);
    setManualCode('');
  };

  const getDiscountDisplay = (deal: VerificationResult['deal']) => {
    if (!deal) return '';
    switch (deal.discount_type) {
      case 'percentage':
        return `${deal.discount_value}% OFF`;
      case 'fixed':
        return `$${deal.discount_value} OFF`;
      case 'bogo':
        return 'Buy 1 Get 1 Free';
      case 'free_item':
        return 'Free Item';
      default:
        return 'Special Deal';
    }
  };

  // Web fallback - manual code entry
  if (Platform.OS === 'web' || showManualEntry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Verify Redemption</Text>
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              onPress={() => setShowManualEntry(false)}
              style={styles.headerButton}
            >
              <Ionicons name="camera" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.manualEntryContainer}>
          {!result ? (
            <View style={styles.scannerCard}>
              <View style={styles.scannerIconWrapper}>
                <View style={styles.scannerIconBg}>
                  <Ionicons name="qr-code" size={56} color={COLORS.primary} />
                </View>
                <View style={styles.scannerPulse} />
              </View>

              <Text style={styles.scannerTitle}>Enter Redemption Code</Text>
              <Text style={styles.instructionText}>
                Ask the customer to show their QR code and enter the code displayed below it
              </Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="XXXX-XXXX-XXXX"
                  placeholderTextColor={COLORS.textTertiary}
                  value={manualCode}
                  onChangeText={setManualCode}
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity
                style={[styles.verifyButton, isVerifying && styles.verifyingButton]}
                onPress={handleManualSubmit}
                disabled={isVerifying}
                activeOpacity={0.8}
              >
                {isVerifying ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={22} color={COLORS.white} />
                    <Text style={styles.verifyButtonText}>Verify Redemption</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.helpSection}>
                <Ionicons name="information-circle" size={18} color={COLORS.textTertiary} />
                <Text style={styles.helpText}>
                  Codes are case-insensitive and expire after 5 minutes
                </Text>
              </View>
            </View>
          ) : (
            <View style={[
              styles.resultCard,
              result.success ? styles.successCard : styles.errorCard,
            ]}>
              <View style={[
                styles.resultIconWrapper,
                { backgroundColor: result.success ? COLORS.success + '15' : COLORS.error + '15' }
              ]}>
                <Ionicons
                  name={result.success ? 'checkmark-circle' : 'close-circle'}
                  size={64}
                  color={result.success ? COLORS.success : COLORS.error}
                />
              </View>
              <Text style={[
                styles.resultMessage,
                { color: result.success ? COLORS.success : COLORS.error }
              ]}>
                {result.message}
              </Text>
              {result.deal && (
                <View style={styles.dealInfo}>
                  <Text style={styles.dealTitle}>{result.deal.title}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.dealDiscount}>{getDiscountDisplay(result.deal)}</Text>
                  </View>
                </View>
              )}
              {result.user && (
                <View style={styles.userInfo}>
                  <Ionicons name="person" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.userName}>{result.user.name}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.resetButton} onPress={resetScanner} activeOpacity={0.8}>
                <Ionicons name="refresh" size={20} color={COLORS.white} />
                <Text style={styles.resetButtonText}>Verify Another</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Native camera scanner
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="camera-off" size={64} color={COLORS.textTertiary} />
          <Text style={styles.errorTitle}>Camera Access Required</Text>
          <Text style={styles.errorSubtitle}>
            Please enable camera access in settings to scan QR codes
          </Text>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => setShowManualEntry(true)}
          >
            <Text style={styles.manualButtonText}>Enter Code Manually</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity onPress={() => setShowManualEntry(true)}>
          <Ionicons name="keypad" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.scannerContainer}>
        {BarCodeScanner && (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      {isVerifying && (
        <View style={styles.verifyingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={styles.verifyingText}>Verifying...</Text>
        </View>
      )}

      {result && (
        <View style={[
          styles.resultOverlay,
          result.success ? styles.successOverlay : styles.errorOverlay,
        ]}>
          <Ionicons
            name={result.success ? 'checkmark-circle' : 'close-circle'}
            size={64}
            color={COLORS.white}
          />
          <Text style={styles.resultOverlayMessage}>{result.message}</Text>
          {result.deal && (
            <Text style={styles.resultDeal}>
              {result.deal.title} - {getDiscountDisplay(result.deal)}
            </Text>
          )}
          <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
            <Text style={styles.scanAgainText}>Scan Another</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.hint}>
        Point your camera at a customer's QR code to verify their deal
      </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  errorSubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  manualButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  manualButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    backgroundColor: 'transparent',
  },
  hint: {
    textAlign: 'center',
    padding: SPACING.lg,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyingText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    marginTop: SPACING.md,
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successOverlay: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
  },
  errorOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  resultOverlayMessage: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  resultDeal: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  scanAgainButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  scanAgainText: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualEntryContainer: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS['2xl'],
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  scannerIconWrapper: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  scannerIconBg: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerPulse: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  scannerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  codeInput: {
    width: '100%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    fontSize: 20,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 4,
    color: COLORS.text,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
  },
  verifyingButton: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  helpText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
  },
  resultCard: {
    width: '100%',
    maxWidth: 400,
    padding: SPACING['2xl'],
    borderRadius: RADIUS['2xl'],
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  resultIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  successCard: {
    backgroundColor: COLORS.white,
  },
  errorCard: {
    backgroundColor: COLORS.white,
  },
  resultMessage: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  dealInfo: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  dealTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  discountBadge: {
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  dealDiscount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    ...SHADOWS.sm,
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    padding: SPACING.md,
  },
  switchButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
