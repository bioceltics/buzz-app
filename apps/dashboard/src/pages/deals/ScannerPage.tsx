import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, QrCode, CheckCircle, XCircle, AlertTriangle, Keyboard } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface VerificationResult {
  success: boolean;
  status: 'verified' | 'expired' | 'already_redeemed' | 'invalid_code' | 'error';
  message: string;
  redemption?: {
    id: string;
    deal: {
      id: string;
      title: string;
      discount_type: string;
      discount_value: number;
    };
    user: {
      name: string;
      email: string;
    } | null;
    redeemed_at: string;
  };
}

interface QRData {
  type: string;
  dealId: string;
  venueId: string;
  userId: string;
  code: string;
  expiresAt: string;
}

export function ScannerPage() {
  const { session, venue, isDemoMode } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scannerContainerRef.current) return;

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Stop scanning immediately on successful read
          await scanner.stop();
          setIsScanning(false);
          handleQRData(decodedText);
        },
        () => {
          // QR code not found in frame - ignore
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error('Scanner error:', error);
      toast.error('Could not access camera. Please check permissions or use manual entry.');
      setShowManualEntry(true);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setIsScanning(false);
  };

  const handleQRData = async (data: string) => {
    try {
      const qrData: QRData = JSON.parse(data);

      if (qrData.type !== 'buzz_deal') {
        toast.error('Invalid QR code - not a Buzz deal');
        setVerificationResult({
          success: false,
          status: 'invalid_code',
          message: 'This QR code is not a valid Buzz deal code.',
        });
        return;
      }

      await verifyRedemption(qrData.dealId, qrData.code, qrData.userId);
    } catch (error) {
      // If JSON parsing fails, treat as a manual code
      toast.error('Invalid QR code format');
      setVerificationResult({
        success: false,
        status: 'invalid_code',
        message: 'Could not read QR code. Please try again or use manual entry.',
      });
    }
  };

  const verifyRedemption = async (dealId: string, code: string, userId?: string) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Demo mode - simulate verification
      if (isDemoMode) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setVerificationResult({
          success: true,
          status: 'verified',
          message: 'Deal redeemed successfully!',
          redemption: {
            id: 'demo-redemption',
            deal: {
              id: dealId,
              title: 'Demo Happy Hour Deal',
              discount_type: 'percentage',
              discount_value: 50,
            },
            user: {
              name: 'Demo Customer',
              email: 'customer@demo.com',
            },
            redeemed_at: new Date().toISOString(),
          },
        });
        toast.success('Demo: Deal verified successfully!');
        return;
      }

      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/deals/${dealId}/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            redemptionCode: code,
            userId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setVerificationResult({
          success: true,
          status: 'verified',
          message: data.message || 'Deal redeemed successfully!',
          redemption: data.redemption,
        });
        toast.success('Deal verified successfully!');
      } else {
        setVerificationResult({
          success: false,
          status: data.status || 'error',
          message: data.error || 'Verification failed',
        });
        toast.error(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        status: 'error',
        message: 'Failed to verify redemption. Please try again.',
      });
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error('Please enter a redemption code');
      return;
    }

    // For manual entry, we need to extract dealId from the code or use a different endpoint
    // For now, we'll use a simplified approach - the code contains dealId
    try {
      const parsed = JSON.parse(manualCode);
      await verifyRedemption(parsed.dealId, parsed.code, parsed.userId);
    } catch {
      // If not JSON, treat as a simple code that needs venue lookup
      toast.error('Please scan a valid QR code or enter a valid JSON code');
    }
  };

  const resetScanner = () => {
    setVerificationResult(null);
    setManualCode('');
    setShowManualEntry(false);
  };

  const getStatusIcon = () => {
    if (!verificationResult) return null;

    switch (verificationResult.status) {
      case 'verified':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'already_redeemed':
        return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
      default:
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (!verificationResult) return 'bg-gray-100';

    switch (verificationResult.status) {
      case 'verified':
        return 'bg-green-50 border-green-200';
      case 'already_redeemed':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/deals"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
          <p className="text-gray-600">Verify customer deal redemptions</p>
        </div>
      </div>

      {/* Verification Result */}
      {verificationResult ? (
        <div className={`card border-2 ${getStatusColor()}`}>
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {verificationResult.success ? 'Verified!' : 'Verification Failed'}
            </h2>
            <p className="text-gray-600 mb-6">{verificationResult.message}</p>

            {verificationResult.redemption && (
              <div className="bg-white rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Deal Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deal:</span>
                    <span className="font-medium text-gray-900">
                      {verificationResult.redemption.deal.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount:</span>
                    <span className="font-medium text-gray-900">
                      {verificationResult.redemption.deal.discount_type === 'percentage'
                        ? `${verificationResult.redemption.deal.discount_value}% off`
                        : `$${verificationResult.redemption.deal.discount_value} off`}
                    </span>
                  </div>
                  {verificationResult.redemption.user && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer:</span>
                      <span className="font-medium text-gray-900">
                        {verificationResult.redemption.user.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Redeemed:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(verificationResult.redemption.redeemed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button onClick={resetScanner} className="btn btn-primary">
              <QrCode className="w-5 h-5 mr-2" />
              Scan Another Code
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Scanner Area */}
          <div className="card mb-6">
            <div
              id="qr-reader"
              ref={scannerContainerRef}
              className={`bg-gray-900 rounded-lg overflow-hidden ${
                isScanning ? 'min-h-[350px]' : 'h-0'
              }`}
            />

            {!isScanning && !showManualEntry && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Scan
                </h2>
                <p className="text-gray-500 mb-6">
                  Point your camera at the customer's QR code to verify their deal.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={startScanner}
                    className="btn btn-primary"
                    disabled={isVerifying}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Scanning
                  </button>
                  <button
                    onClick={() => setShowManualEntry(true)}
                    className="btn btn-secondary"
                  >
                    <Keyboard className="w-5 h-5 mr-2" />
                    Manual Entry
                  </button>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">
                  Position the QR code within the scanner box
                </p>
                <button onClick={stopScanner} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          {showManualEntry && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Manual Code Entry</h3>
              <form onSubmit={handleManualSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Redemption Code
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter the redemption code from customer"
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ask the customer to show you their redemption code
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Instructions */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">How it works</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  1
                </span>
                <span>Customer shows their QR code from the Buzz app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  2
                </span>
                <span>Click "Start Scanning" and point camera at the QR code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  3
                </span>
                <span>Verification happens automatically once scanned</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  4
                </span>
                <span>Apply the discount shown on the verification screen</span>
              </li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
