// AI Recommendation Engine for Buzz Platform
// Handles personalized deal recommendations for users

import {
  UserPreferences,
  DealRecommendation,
  NotificationPrediction,
  LocationPrediction,
} from './types';

// Simulated user behavior data (in production, this comes from database)
interface Deal {
  id: string;
  venueId: string;
  venueName: string;
  title: string;
  category: string;
  discountPercent: number;
  originalPrice: number;
  cuisine?: string;
  venueType: string;
  location: { lat: number; lng: number };
  startTime: Date;
  endTime: Date;
  redemptions: number;
  maxRedemptions: number;
  views: number;
  saves: number;
}

interface UserActivity {
  dealId: string;
  action: 'view' | 'save' | 'redeem' | 'share';
  timestamp: Date;
  duration?: number; // time spent viewing in seconds
}

// Feature extraction utilities
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// Collaborative Filtering: Find similar users
function findSimilarUsers(
  userId: string,
  allUserActivities: Map<string, UserActivity[]>,
  userPreferences: Map<string, UserPreferences>
): string[] {
  const currentUserActivities = allUserActivities.get(userId) || [];
  const currentUserDeals = new Set(currentUserActivities.map((a) => a.dealId));

  const similarities: Array<{ userId: string; score: number }> = [];

  allUserActivities.forEach((activities, otherUserId) => {
    if (otherUserId === userId) return;

    const otherDeals = new Set(activities.map((a) => a.dealId));
    const intersection = new Set(
      [...currentUserDeals].filter((d) => otherDeals.has(d))
    );
    const union = new Set([...currentUserDeals, ...otherDeals]);

    // Jaccard similarity
    const similarity = intersection.size / union.size;
    if (similarity > 0.1) {
      similarities.push({ userId: otherUserId, score: similarity });
    }
  });

  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => s.userId);
}

// Content-Based Filtering: Score deals based on user preferences
function contentBasedScore(
  deal: Deal,
  preferences: UserPreferences
): { score: number; matchedPreferences: string[] } {
  let score = 0;
  const matchedPreferences: string[] = [];

  // Cuisine preference (0-0.25)
  if (deal.cuisine && preferences.cuisinePreferences[deal.cuisine]) {
    const cuisineScore = preferences.cuisinePreferences[deal.cuisine] * 0.25;
    score += cuisineScore;
    if (cuisineScore > 0.1) {
      matchedPreferences.push(`Loves ${deal.cuisine} cuisine`);
    }
  }

  // Price range (0-0.2)
  const dealPrice = deal.originalPrice * (1 - deal.discountPercent / 100);
  if (
    dealPrice >= preferences.priceRange.min &&
    dealPrice <= preferences.priceRange.max
  ) {
    score += 0.2;
    matchedPreferences.push('Within budget');
  }

  // Venue type preference (0-0.15)
  if (preferences.favoriteVenueTypes.includes(deal.venueType)) {
    score += 0.15;
    matchedPreferences.push(`Favorite venue type: ${deal.venueType}`);
  }

  // Location proximity (0-0.2)
  const distance = calculateDistance(
    preferences.locationPreferences.lat,
    preferences.locationPreferences.lng,
    deal.location.lat,
    deal.location.lng
  );
  if (distance <= preferences.locationPreferences.radius) {
    const proximityScore = 0.2 * (1 - distance / preferences.locationPreferences.radius);
    score += proximityScore;
    if (proximityScore > 0.1) {
      matchedPreferences.push(`Only ${distance.toFixed(1)}km away`);
    }
  }

  // Time preference (0-0.1)
  const dealTime = getTimeOfDay(deal.startTime);
  if (preferences.preferredTimes.includes(dealTime)) {
    score += 0.1;
    matchedPreferences.push(`Preferred ${dealTime} timing`);
  }

  // Day preference (0-0.1)
  const dealDay = deal.startTime.toLocaleDateString('en-US', { weekday: 'long' });
  if (preferences.preferredDays.includes(dealDay)) {
    score += 0.1;
    matchedPreferences.push(`Preferred day: ${dealDay}`);
  }

  return { score: Math.min(score, 1), matchedPreferences };
}

// Popularity-based boosting
function popularityBoost(deal: Deal): number {
  const redemptionRate = deal.redemptions / Math.max(deal.views, 1);
  const saveRate = deal.saves / Math.max(deal.views, 1);
  const scarcityFactor = 1 - deal.redemptions / deal.maxRedemptions;

  return (redemptionRate * 0.4 + saveRate * 0.3 + scarcityFactor * 0.3) * 0.2;
}

// Main Recommendation Engine
export class RecommendationEngine {
  private userPreferences: Map<string, UserPreferences> = new Map();
  private userActivities: Map<string, UserActivity[]> = new Map();
  private deals: Deal[] = [];

  // Generate personalized recommendations
  async getRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<DealRecommendation[]> {
    const preferences = this.userPreferences.get(userId);
    if (!preferences) {
      // Return trending deals for new users (cold start)
      return this.getTrendingDeals(limit);
    }

    const recommendations: DealRecommendation[] = [];
    const similarUsers = findSimilarUsers(
      userId,
      this.userActivities,
      this.userPreferences
    );

    // Get deals from similar users (collaborative filtering)
    const collaborativeDeals = new Set<string>();
    similarUsers.forEach((similarUserId) => {
      const activities = this.userActivities.get(similarUserId) || [];
      activities
        .filter((a) => a.action === 'redeem' || a.action === 'save')
        .forEach((a) => collaborativeDeals.add(a.dealId));
    });

    // Score each deal
    for (const deal of this.deals) {
      // Skip expired or fully redeemed deals
      if (deal.endTime < new Date() || deal.redemptions >= deal.maxRedemptions) {
        continue;
      }

      // Content-based score
      const { score: contentScore, matchedPreferences } = contentBasedScore(
        deal,
        preferences
      );

      // Collaborative filtering boost
      const collaborativeBoost = collaborativeDeals.has(deal.id) ? 0.15 : 0;

      // Popularity boost
      const popularityScore = popularityBoost(deal);

      // Recency boost (newer deals get slight boost)
      const hoursOld =
        (Date.now() - deal.startTime.getTime()) / (1000 * 60 * 60);
      const recencyBoost = Math.max(0, 0.1 - hoursOld * 0.01);

      // Final score
      const finalScore = Math.min(
        contentScore + collaborativeBoost + popularityScore + recencyBoost,
        1
      );

      // Generate reasons
      const reasons: string[] = [...matchedPreferences];
      if (collaborativeBoost > 0) {
        reasons.push('Similar users loved this');
      }
      if (popularityScore > 0.1) {
        reasons.push('Trending right now');
      }
      if (recencyBoost > 0.05) {
        reasons.push('Just posted');
      }

      // Predict redemption probability
      const predictedRedemptionProbability =
        (contentScore * 0.6 + popularityScore * 0.4) *
        (preferences.engagementHistory.totalRedemptions /
          Math.max(preferences.engagementHistory.totalViews, 1) +
          0.1);

      recommendations.push({
        dealId: deal.id,
        score: finalScore,
        reasons,
        predictedRedemptionProbability: Math.min(predictedRedemptionProbability, 0.9),
        matchedPreferences,
      });
    }

    // Sort by score and return top N
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Get trending deals (for cold start / new users)
  private getTrendingDeals(limit: number): DealRecommendation[] {
    return this.deals
      .filter(
        (deal) =>
          deal.endTime > new Date() && deal.redemptions < deal.maxRedemptions
      )
      .map((deal) => ({
        dealId: deal.id,
        score: popularityBoost(deal),
        reasons: ['Trending in your area'],
        predictedRedemptionProbability: 0.3,
        matchedPreferences: [],
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Predict optimal notification time
  async predictNotificationTime(userId: string): Promise<NotificationPrediction> {
    const activities = this.userActivities.get(userId) || [];

    // Analyze when user is most active
    const hourCounts: number[] = new Array(24).fill(0);
    activities.forEach((activity) => {
      hourCounts[activity.timestamp.getHours()]++;
    });

    // Find peak hours
    let maxHour = 12; // default to noon
    let maxCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        maxHour = hour;
      }
    });

    // Calculate engagement probability based on historical data
    const totalActions = activities.length;
    const redeemActions = activities.filter((a) => a.action === 'redeem').length;
    const engagementProbability = totalActions > 0 ? redeemActions / totalActions : 0.2;

    // Determine frequency preference
    const daysSinceLastActive = activities.length > 0
      ? (Date.now() - activities[activities.length - 1].timestamp.getTime()) / (1000 * 60 * 60 * 24)
      : 7;

    let frequency: 'high' | 'medium' | 'low' = 'medium';
    if (daysSinceLastActive < 1 && totalActions > 50) frequency = 'high';
    else if (daysSinceLastActive > 7 || totalActions < 10) frequency = 'low';

    // Set optimal time
    const optimalTime = new Date();
    optimalTime.setHours(maxHour, 0, 0, 0);
    if (optimalTime < new Date()) {
      optimalTime.setDate(optimalTime.getDate() + 1);
    }

    return {
      userId,
      optimalSendTime: optimalTime,
      engagementProbability,
      recommendedChannel: engagementProbability > 0.3 ? 'push' : 'email',
      frequency,
    };
  }

  // Predict user location for proactive recommendations
  async predictLocation(userId: string): Promise<LocationPrediction> {
    const preferences = this.userPreferences.get(userId);
    const activities = this.userActivities.get(userId) || [];

    // Analyze activity patterns
    const locationPatterns: Map<string, { count: number; times: Date[] }> = new Map();

    // In production, this would use actual location data
    // For now, we use venue locations from redeemed deals
    const redeemedDeals = activities
      .filter((a) => a.action === 'redeem')
      .map((a) => this.deals.find((d) => d.id === a.dealId))
      .filter(Boolean) as Deal[];

    // Group by time of day
    const predictions: LocationPrediction['predictedLocations'] = [];

    if (preferences) {
      // Morning prediction
      predictions.push({
        location: {
          lat: preferences.locationPreferences.lat + (Math.random() - 0.5) * 0.01,
          lng: preferences.locationPreferences.lng + (Math.random() - 0.5) * 0.01,
        },
        probability: 0.7,
        timeWindow: {
          start: new Date(new Date().setHours(11, 0, 0, 0)),
          end: new Date(new Date().setHours(14, 0, 0, 0)),
        },
        nearbyVenues: redeemedDeals.slice(0, 3).map((d) => d.venueId),
      });

      // Evening prediction
      predictions.push({
        location: {
          lat: preferences.locationPreferences.lat + (Math.random() - 0.5) * 0.02,
          lng: preferences.locationPreferences.lng + (Math.random() - 0.5) * 0.02,
        },
        probability: 0.6,
        timeWindow: {
          start: new Date(new Date().setHours(17, 0, 0, 0)),
          end: new Date(new Date().setHours(21, 0, 0, 0)),
        },
        nearbyVenues: redeemedDeals.slice(0, 5).map((d) => d.venueId),
      });
    }

    return {
      userId,
      predictedLocations: predictions,
    };
  }

  // Update user preferences based on activity
  updateUserPreferences(userId: string, activity: UserActivity): void {
    const existing = this.userActivities.get(userId) || [];
    existing.push(activity);
    this.userActivities.set(userId, existing);

    // Update preferences based on activity
    const deal = this.deals.find((d) => d.id === activity.dealId);
    if (!deal) return;

    let preferences = this.userPreferences.get(userId);
    if (!preferences) {
      // Initialize preferences for new user
      preferences = {
        userId,
        cuisinePreferences: {},
        priceRange: { min: 0, max: 100 },
        preferredTimes: [],
        preferredDays: [],
        favoriteVenueTypes: [],
        locationPreferences: {
          lat: deal.location.lat,
          lng: deal.location.lng,
          radius: 5,
        },
        engagementHistory: {
          totalViews: 0,
          totalSaves: 0,
          totalRedemptions: 0,
          lastActive: new Date(),
        },
      };
    }

    // Update based on action
    preferences.engagementHistory.lastActive = new Date();
    if (activity.action === 'view') preferences.engagementHistory.totalViews++;
    if (activity.action === 'save') preferences.engagementHistory.totalSaves++;
    if (activity.action === 'redeem') {
      preferences.engagementHistory.totalRedemptions++;
      // Strong signal - update cuisine preferences
      if (deal.cuisine) {
        const current = preferences.cuisinePreferences[deal.cuisine] || 0;
        preferences.cuisinePreferences[deal.cuisine] = Math.min(current + 0.1, 1);
      }
      // Update venue type preferences
      if (!preferences.favoriteVenueTypes.includes(deal.venueType)) {
        preferences.favoriteVenueTypes.push(deal.venueType);
      }
    }

    this.userPreferences.set(userId, preferences);
  }

  // Load data (in production, this fetches from database)
  loadData(deals: Deal[], preferences: Map<string, UserPreferences>): void {
    this.deals = deals;
    this.userPreferences = preferences;
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
