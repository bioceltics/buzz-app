// AI/ML Types for Buzz Platform

// ==================== USER AI TYPES ====================

export interface UserPreferences {
  userId: string;
  cuisinePreferences: Record<string, number>; // cuisine -> affinity score 0-1
  priceRange: { min: number; max: number };
  preferredTimes: string[]; // 'morning', 'afternoon', 'evening', 'night'
  preferredDays: string[];
  favoriteVenueTypes: string[];
  locationPreferences: {
    lat: number;
    lng: number;
    radius: number; // in km
  };
  engagementHistory: {
    totalViews: number;
    totalSaves: number;
    totalRedemptions: number;
    lastActive: Date;
  };
}

export interface DealRecommendation {
  dealId: string;
  score: number; // 0-1 relevance score
  reasons: string[];
  predictedRedemptionProbability: number;
  matchedPreferences: string[];
}

export interface NotificationPrediction {
  userId: string;
  optimalSendTime: Date;
  engagementProbability: number;
  recommendedChannel: 'push' | 'email' | 'sms';
  frequency: 'high' | 'medium' | 'low';
}

export interface LocationPrediction {
  userId: string;
  predictedLocations: Array<{
    location: { lat: number; lng: number };
    probability: number;
    timeWindow: { start: Date; end: Date };
    nearbyVenues: string[];
  }>;
}

// ==================== VENUE AI TYPES ====================

export interface DemandForecast {
  venueId: string;
  date: Date;
  hourlyPredictions: Array<{
    hour: number;
    predictedTraffic: number; // 0-100 scale
    confidence: number;
    recommendation: 'create_deal' | 'normal' | 'busy';
    suggestedDealType?: string;
  }>;
  weeklyTrend: 'increasing' | 'stable' | 'decreasing';
  seasonalFactors: string[];
}

export interface PricingRecommendation {
  dealId?: string;
  venueId: string;
  category: string;
  currentPrice: number;
  recommendedDiscount: number;
  discountType: 'percentage' | 'fixed';
  predictedRedemptions: number;
  predictedRevenue: number;
  confidence: number;
  reasoning: string[];
  comparisons: {
    competitorAvg: number;
    historicalBest: number;
  };
}

export interface DealPerformancePrediction {
  dealId: string;
  predictedViews: number;
  predictedSaves: number;
  predictedRedemptions: number;
  predictedRevenue: number;
  confidence: number;
  suggestions: string[];
  optimalTimeSlot: { start: string; end: string };
  riskFactors: string[];
}

export interface CustomerSegment {
  segmentId: string;
  name: string;
  description: string;
  size: number;
  characteristics: {
    avgSpend: number;
    visitFrequency: number;
    preferredDealTypes: string[];
    churnRisk: number;
    lifetimeValue: number;
  };
  customers: string[]; // customer IDs
  marketingRecommendations: string[];
}

export interface CustomerInsight {
  customerId: string;
  segment: string;
  lifetimeValue: number;
  visitCount: number;
  avgSpend: number;
  churnProbability: number;
  nextVisitPrediction: Date | null;
  preferences: string[];
  recommendations: string[];
}

// ==================== PLATFORM AI TYPES ====================

export interface FraudAlert {
  id: string;
  type: 'suspicious_redemption' | 'fake_account' | 'deal_abuse' | 'collusion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityType: 'user' | 'venue' | 'deal';
  entityId: string;
  description: string;
  evidence: string[];
  detectedAt: Date;
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  suggestedAction: string;
  confidenceScore: number;
}

export interface ContentModerationResult {
  contentId: string;
  contentType: 'image' | 'text' | 'deal_description';
  status: 'approved' | 'flagged' | 'rejected';
  issues: Array<{
    type: 'inappropriate' | 'misleading' | 'low_quality' | 'spam' | 'copyright';
    severity: number;
    details: string;
  }>;
  qualityScore: number;
  suggestions: string[];
  autoActionTaken?: string;
}

export interface DealPopularityScore {
  dealId: string;
  overallScore: number; // 0-100
  trendingScore: number;
  engagementScore: number;
  conversionScore: number;
  velocityScore: number; // how fast it's gaining traction
  rank: number;
  badges: Array<'hot' | 'trending' | 'popular' | 'new' | 'ending_soon'>;
  predictedPeakTime: Date;
}

// ==================== ML MODEL TYPES ====================

export interface ModelMetrics {
  modelId: string;
  modelType: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: Date;
  trainingDataSize: number;
  version: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  category: string;
}

// ==================== ANALYTICS TYPES ====================

export interface AIAnalyticsSummary {
  totalRecommendations: number;
  recommendationAccuracy: number;
  fraudsPrevented: number;
  fraudValueSaved: number;
  demandForecastAccuracy: number;
  userEngagementLift: number;
  venueRevenueLift: number;
  activeModels: number;
  lastUpdated: Date;
}
