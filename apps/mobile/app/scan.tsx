import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

interface ScanResult {
  success: boolean;
  deal?: {
    id: string;
    title: string;
  };
  user?: {
    id: string;
    full_name: string;
  };
  redemption?: {
    id: string;
    redeemed_at: string;
  };
  error?: string;
}

export default function ScanScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const verifyMutation = useMutation({
    mutationFn: async (qrData: string): Promise<ScanResult> => {
      // Parse QR data - expected format: buzz://redeem/{dealId}/{redemptionCode}
      const match = qrData.match(/buzz:\/\/redeem\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid QR code format');
      }

      const [, dealId, redemptionCode] = match;

      const session = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/deals/${dealId}/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
          body: JSON.stringify({ redemption_code: redemptionCode }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify redemption');
      }

      return data;
    },
    onSuccess: (result) => {
      Vibration.vibrate(200);
      setScanResult(result);
    },
    onError: (error: Error) => {
      Vibration.vibrate([0, 100, 100, 100]);
      setScanResult({
        success: false,
        error: error.message,
      });
    },
  });

  useEffect(() => {
    if (permission?.granted === false) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned || verifyMutation.isPending) return;

    setScanned(true);
    verifyMutation.mutate(data);
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanResult(null);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          To scan QR codes for deal redemption, please allow camera access.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Ionicons
              name={flashOn ? 'flash' : 'flash-off'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Scan Area */}
        <View style={styles.scanAreaContainer}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Position the QR code within the frame to verify the deal redemption
          </Text>
        </View>

        {/* Loading Overlay */}
        {verifyMutation.isPending && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Verifying...</Text>
          </View>
        )}

        {/* Result Overlay */}
        {scanResult && (
          <View style={styles.resultOverlay}>
            <View
              style={[
                styles.resultCard,
                scanResult.success ? styles.successCard : styles.errorCard,
              ]}
            >
              <Ionicons
                name={scanResult.success ? 'checkmark-circle' : 'close-circle'}
                size={64}
                color={scanResult.success ? Colors.success : Colors.error}
              />
              <Text style={styles.resultTitle}>
                {scanResult.success ? 'Redemption Verified!' : 'Verification Failed'}
              </Text>

              {scanResult.success && scanResult.deal && (
                <>
                  <Text style={styles.dealTitle}>{scanResult.deal.title}</Text>
                  {scanResult.user && (
                    <Text style={styles.customerName}>
                      Customer: {scanResult.user.full_name || 'Guest'}
                    </Text>
                  )}
                  {scanResult.redemption?.redeemed_at && (
                    <Text style={styles.redeemTime}>
                      Redeemed: {new Date(scanResult.redemption.redeemed_at).toLocaleString()}
                    </Text>
                  )}
                </>
              )}

              {!scanResult.success && (
                <Text style={styles.errorMessage}>
                  {scanResult.error || 'Unable to verify this QR code'}
                </Text>
              )}

              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={handleScanAgain}
              >
                <Ionicons name="scan-outline" size={20} color="#fff" />
                <Text style={styles.scanAgainText}>Scan Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  instructions: {
    padding: 24,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  successCard: {
    borderTopWidth: 4,
    borderTopColor: Colors.success,
  },
  errorCard: {
    borderTopWidth: 4,
    borderTopColor: Colors.error,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  redeemTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
    gap: 8,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
