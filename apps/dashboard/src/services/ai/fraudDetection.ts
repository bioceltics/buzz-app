// Fraud Detection Service
// Detects suspicious activities on the platform

import { FraudAlert } from './types';

interface RedemptionEvent {
  id: string;
  dealId: string;
  userId: string;
  venueId: string;
  timestamp: Date;
  ipAddress?: string;
  deviceId?: string;
  location?: { lat: number; lng: number };
}

interface UserProfile {
  id: string;
  createdAt: Date;
  email: string;
  redemptionCount: number;
  accountAge: number; // days
  uniqueVenuesVisited: number;
  averageTimeBetweenRedemptions: number; // hours
  flagCount: number;
}

interface VenueProfile {
  id: string;
  totalRedemptions: number;
  avgDailyRedemptions: number;
  uniqueCustomers: number;
  suspiciousActivityCount: number;
}

// Anomaly detection using statistical methods
function detectAnomaly(value: number, mean: number, stdDev: number, threshold: number = 2): boolean {
  if (stdDev === 0) return false;
  const zScore = Math.abs((value - mean) / stdDev);
  return zScore > threshold;
}

// Calculate velocity (actions per time unit)
function calculateVelocity(timestamps: Date[], windowHours: number = 24): number {
  const now = Date.now();
  const windowMs = windowHours * 60 * 60 * 1000;
  const recentCount = timestamps.filter((t) => now - t.getTime() < windowMs).length;
  return recentCount;
}

// Detect geographic impossibility
function detectImpossibleTravel(
  location1: { lat: number; lng: number; timestamp: Date },
  location2: { lat: number; lng: number; timestamp: Date }
): boolean {
  // Calculate distance
  const R = 6371; // Earth's radius in km
  const dLat = ((location2.lat - location1.lat) * Math.PI) / 180;
  const dLng = ((location2.lng - location1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((location1.lat * Math.PI) / 180) *
      Math.cos((location2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Calculate time difference in hours
  const timeDiff = Math.abs(location2.timestamp.getTime() - location1.timestamp.getTime()) / (1000 * 60 * 60);

  // Max reasonable travel speed: 800 km/h (plane)
  const maxPossibleDistance = timeDiff * 800;

  return distance > maxPossibleDistance;
}

export class FraudDetectionService {
  private redemptionHistory: Map<string, RedemptionEvent[]> = new Map(); // userId -> events
  private venueRedemptions: Map<string, RedemptionEvent[]> = new Map(); // venueId -> events
  private userProfiles: Map<string, UserProfile> = new Map();
  private venueProfiles: Map<string, VenueProfile> = new Map();
  private alerts: FraudAlert[] = [];

  // Analyze a redemption event for fraud
  async analyzeRedemption(event: RedemptionEvent): Promise<FraudAlert | null> {
    const alerts: FraudAlert[] = [];

    // Get user's redemption history
    const userHistory = this.redemptionHistory.get(event.userId) || [];
    const userProfile = this.userProfiles.get(event.userId) || this.createDefaultUserProfile(event.userId);

    // Get venue's redemption history
    const venueHistory = this.venueRedemptions.get(event.venueId) || [];

    // Check 1: Velocity anomaly (too many redemptions in short time)
    const recentRedemptions = calculateVelocity(
      userHistory.map((e) => e.timestamp),
      24
    );
    if (recentRedemptions > 10) {
      alerts.push(this.createAlert(
        'suspicious_redemption',
        recentRedemptions > 20 ? 'high' : 'medium',
        'user',
        event.userId,
        `User made ${recentRedemptions} redemptions in 24 hours`,
        [`${recentRedemptions} redemptions in 24h`, 'Average is 1-3 per day'],
        0.7 + (recentRedemptions - 10) * 0.02
      ));
    }

    // Check 2: New account abuse
    if (userProfile.accountAge < 1 && userProfile.redemptionCount > 5) {
      alerts.push(this.createAlert(
        'fake_account',
        'medium',
        'user',
        event.userId,
        'New account with unusually high activity',
        ['Account less than 24 hours old', `${userProfile.redemptionCount} redemptions already`],
        0.65
      ));
    }

    // Check 3: Impossible travel (if location data available)
    if (event.location && userHistory.length > 0) {
      const lastEvent = userHistory[userHistory.length - 1];
      if (lastEvent.location) {
        const impossibleTravel = detectImpossibleTravel(
          { ...lastEvent.location, timestamp: lastEvent.timestamp },
          { ...event.location, timestamp: event.timestamp }
        );
        if (impossibleTravel) {
          alerts.push(this.createAlert(
            'suspicious_redemption',
            'high',
            'user',
            event.userId,
            'Geographically impossible redemption locations',
            [
              `Last redemption: ${lastEvent.location.lat.toFixed(2)}, ${lastEvent.location.lng.toFixed(2)}`,
              `Current: ${event.location.lat.toFixed(2)}, ${event.location.lng.toFixed(2)}`,
              'Impossible to travel this distance in time',
            ],
            0.9
          ));
        }
      }
    }

    // Check 4: Same deal redemption abuse
    const sameDealRedemptions = userHistory.filter((e) => e.dealId === event.dealId);
    if (sameDealRedemptions.length > 0) {
      alerts.push(this.createAlert(
        'deal_abuse',
        sameDealRedemptions.length > 2 ? 'high' : 'medium',
        'user',
        event.userId,
        'Multiple redemptions of same deal',
        [
          `${sameDealRedemptions.length + 1} redemptions of same deal`,
          'Deals typically limited to one per customer',
        ],
        0.8
      ));
    }

    // Check 5: Device/IP patterns (collusion detection)
    const sameDeviceUsers = this.findUsersWithSameDevice(event.deviceId);
    if (sameDeviceUsers.length > 3) {
      alerts.push(this.createAlert(
        'collusion',
        'high',
        'user',
        event.userId,
        'Multiple accounts from same device',
        [
          `${sameDeviceUsers.length} accounts using same device`,
          'Possible account farming',
        ],
        0.85
      ));
    }

    // Check 6: Venue-side anomaly
    const venueRecentRedemptions = calculateVelocity(
      venueHistory.map((e) => e.timestamp),
      1
    );
    const venueProfile = this.venueProfiles.get(event.venueId);
    if (venueProfile && venueRecentRedemptions > venueProfile.avgDailyRedemptions * 3) {
      alerts.push(this.createAlert(
        'suspicious_redemption',
        'medium',
        'venue',
        event.venueId,
        'Unusually high redemption volume',
        [
          `${venueRecentRedemptions} redemptions in 1 hour`,
          `Average daily: ${venueProfile.avgDailyRedemptions}`,
        ],
        0.6
      ));
    }

    // Update histories
    userHistory.push(event);
    this.redemptionHistory.set(event.userId, userHistory);

    venueHistory.push(event);
    this.venueRedemptions.set(event.venueId, venueHistory);

    // Update user profile
    userProfile.redemptionCount++;
    this.userProfiles.set(event.userId, userProfile);

    // Return highest severity alert
    if (alerts.length > 0) {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
      this.alerts.push(alerts[0]);
      return alerts[0];
    }

    return null;
  }

  // Get all pending alerts
  async getPendingAlerts(): Promise<FraudAlert[]> {
    return this.alerts.filter((a) => a.status === 'pending');
  }

  // Get alerts by severity
  async getAlertsBySeverity(severity: FraudAlert['severity']): Promise<FraudAlert[]> {
    return this.alerts.filter((a) => a.severity === severity);
  }

  // Update alert status
  async updateAlertStatus(
    alertId: string,
    status: FraudAlert['status']
  ): Promise<void> {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = status;
    }
  }

  // Get fraud analytics summary
  async getFraudAnalytics(): Promise<{
    totalAlerts: number;
    alertsBySeverity: Record<string, number>;
    alertsByType: Record<string, number>;
    estimatedSavings: number;
    topRiskUsers: Array<{ userId: string; riskScore: number; alertCount: number }>;
    topRiskVenues: Array<{ venueId: string; riskScore: number; alertCount: number }>;
  }> {
    const alertsBySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const alertsByType: Record<string, number> = {
      suspicious_redemption: 0,
      fake_account: 0,
      deal_abuse: 0,
      collusion: 0,
    };

    const userRisk = new Map<string, { count: number; totalConfidence: number }>();
    const venueRisk = new Map<string, { count: number; totalConfidence: number }>();

    this.alerts.forEach((alert) => {
      alertsBySeverity[alert.severity]++;
      alertsByType[alert.type]++;

      if (alert.entityType === 'user') {
        const existing = userRisk.get(alert.entityId) || { count: 0, totalConfidence: 0 };
        existing.count++;
        existing.totalConfidence += alert.confidenceScore;
        userRisk.set(alert.entityId, existing);
      } else if (alert.entityType === 'venue') {
        const existing = venueRisk.get(alert.entityId) || { count: 0, totalConfidence: 0 };
        existing.count++;
        existing.totalConfidence += alert.confidenceScore;
        venueRisk.set(alert.entityId, existing);
      }
    });

    // Estimate savings (avg deal value * prevented frauds)
    const avgDealValue = 25;
    const preventedFrauds = this.alerts.filter(
      (a) => a.status === 'resolved' && a.severity !== 'low'
    ).length;
    const estimatedSavings = preventedFrauds * avgDealValue;

    // Top risk users
    const topRiskUsers = Array.from(userRisk.entries())
      .map(([userId, data]) => ({
        userId,
        riskScore: data.totalConfidence / data.count,
        alertCount: data.count,
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    // Top risk venues
    const topRiskVenues = Array.from(venueRisk.entries())
      .map(([venueId, data]) => ({
        venueId,
        riskScore: data.totalConfidence / data.count,
        alertCount: data.count,
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    return {
      totalAlerts: this.alerts.length,
      alertsBySeverity,
      alertsByType,
      estimatedSavings,
      topRiskUsers,
      topRiskVenues,
    };
  }

  // Helper methods
  private createAlert(
    type: FraudAlert['type'],
    severity: FraudAlert['severity'],
    entityType: FraudAlert['entityType'],
    entityId: string,
    description: string,
    evidence: string[],
    confidenceScore: number
  ): FraudAlert {
    const suggestedActions: Record<FraudAlert['type'], string> = {
      suspicious_redemption: 'Review user activity and consider temporary suspension',
      fake_account: 'Verify account with additional authentication',
      deal_abuse: 'Block user from deal and notify venue',
      collusion: 'Investigate all linked accounts and consider mass suspension',
    };

    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      entityType,
      entityId,
      description,
      evidence,
      detectedAt: new Date(),
      status: 'pending',
      suggestedAction: suggestedActions[type],
      confidenceScore: Math.min(0.99, confidenceScore),
    };
  }

  private createDefaultUserProfile(userId: string): UserProfile {
    return {
      id: userId,
      createdAt: new Date(),
      email: '',
      redemptionCount: 0,
      accountAge: 0,
      uniqueVenuesVisited: 0,
      averageTimeBetweenRedemptions: 0,
      flagCount: 0,
    };
  }

  private findUsersWithSameDevice(deviceId?: string): string[] {
    if (!deviceId) return [];

    const users: string[] = [];
    this.redemptionHistory.forEach((events, userId) => {
      if (events.some((e) => e.deviceId === deviceId)) {
        users.push(userId);
      }
    });
    return users;
  }

  // Load user profiles
  loadUserProfiles(profiles: UserProfile[]): void {
    profiles.forEach((p) => this.userProfiles.set(p.id, p));
  }

  // Load venue profiles
  loadVenueProfiles(profiles: VenueProfile[]): void {
    profiles.forEach((p) => this.venueProfiles.set(p.id, p));
  }
}

export const fraudDetectionService = new FraudDetectionService();
