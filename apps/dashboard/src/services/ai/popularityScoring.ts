// Deal Popularity Scoring Service
// Calculates real-time popularity scores for deals

import { DealPopularityScore } from './types';

interface DealMetrics {
  dealId: string;
  venueId: string;
  venueName: string;
  title: string;
  category: string;
  views: number;
  saves: number;
  redemptions: number;
  shares: number;
  maxRedemptions: number;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  // Time-series data
  hourlyViews: number[]; // last 24 hours
  hourlyRedemptions: number[]; // last 24 hours
}

// Calculate engagement score (weighted combination of interactions)
function calculateEngagementScore(metrics: DealMetrics): number {
  const weights = {
    view: 1,
    save: 5,
    share: 8,
    redemption: 10,
  };

  const totalEngagement =
    metrics.views * weights.view +
    metrics.saves * weights.save +
    metrics.shares * weights.share +
    metrics.redemptions * weights.redemption;

  // Normalize to 0-100 scale (assuming max reasonable engagement)
  const maxExpectedEngagement = 10000;
  return Math.min(100, (totalEngagement / maxExpectedEngagement) * 100);
}

// Calculate trending score (rate of change)
function calculateTrendingScore(metrics: DealMetrics): number {
  const hourlyViews = metrics.hourlyViews || [];
  const hourlyRedemptions = metrics.hourlyRedemptions || [];

  if (hourlyViews.length < 2) return 50;

  // Calculate velocity (recent vs older activity)
  const recentHours = 6;
  const recentViews = hourlyViews.slice(-recentHours).reduce((a, b) => a + b, 0);
  const olderViews = hourlyViews.slice(0, -recentHours).reduce((a, b) => a + b, 0);

  const recentRedemptions = hourlyRedemptions.slice(-recentHours).reduce((a, b) => a + b, 0);
  const olderRedemptions = hourlyRedemptions.slice(0, -recentHours).reduce((a, b) => a + b, 0);

  // Calculate growth rate
  const viewGrowth = olderViews > 0 ? (recentViews - olderViews / 3) / olderViews : recentViews > 0 ? 1 : 0;
  const redemptionGrowth = olderRedemptions > 0 ? (recentRedemptions - olderRedemptions / 3) / olderRedemptions : recentRedemptions > 0 ? 1 : 0;

  // Weighted trending score
  const trendScore = (viewGrowth * 0.4 + redemptionGrowth * 0.6) * 50 + 50;

  return Math.max(0, Math.min(100, trendScore));
}

// Calculate conversion score
function calculateConversionScore(metrics: DealMetrics): number {
  if (metrics.views === 0) return 0;

  const conversionRate = metrics.redemptions / metrics.views;
  const saveRate = metrics.saves / metrics.views;

  // Benchmark conversion rates
  const avgConversionRate = 0.1; // 10%
  const avgSaveRate = 0.15; // 15%

  const conversionScore = Math.min(100, (conversionRate / avgConversionRate) * 50);
  const saveScore = Math.min(100, (saveRate / avgSaveRate) * 50);

  return conversionScore * 0.7 + saveScore * 0.3;
}

// Calculate velocity score (how fast deal is being redeemed)
function calculateVelocityScore(metrics: DealMetrics): number {
  const hourlyRedemptions = metrics.hourlyRedemptions || [];
  if (hourlyRedemptions.length === 0) return 0;

  // Calculate redemption velocity
  const recentRedemptions = hourlyRedemptions.slice(-3).reduce((a, b) => a + b, 0);
  const remainingSlots = metrics.maxRedemptions - metrics.redemptions;
  const hoursRemaining = Math.max(1, (metrics.endTime.getTime() - Date.now()) / (1000 * 60 * 60));

  // If deal is filling up fast
  const fillRate = recentRedemptions / Math.max(1, hourlyRedemptions.length / 8);
  const projectedFill = fillRate * hoursRemaining;

  if (projectedFill > remainingSlots) {
    // Deal likely to sell out
    return Math.min(100, 70 + (projectedFill / remainingSlots) * 30);
  }

  return Math.min(100, (fillRate / 5) * 100); // Normalize to expected rate
}

// Determine badges for deal
function determineBadges(
  metrics: DealMetrics,
  scores: { trending: number; engagement: number; conversion: number; velocity: number }
): DealPopularityScore['badges'] {
  const badges: DealPopularityScore['badges'] = [];

  // Hot: High overall activity
  if (scores.engagement > 70 && scores.conversion > 60) {
    badges.push('hot');
  }

  // Trending: Rapidly growing
  if (scores.trending > 75) {
    badges.push('trending');
  }

  // Popular: High engagement
  if (scores.engagement > 60) {
    badges.push('popular');
  }

  // New: Created within last 2 hours
  const hoursOld = (Date.now() - metrics.createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursOld < 2) {
    badges.push('new');
  }

  // Ending Soon: Less than 1 hour remaining
  const hoursRemaining = (metrics.endTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursRemaining < 1 && hoursRemaining > 0) {
    badges.push('ending_soon');
  }

  return badges;
}

// Predict peak time for deal
function predictPeakTime(metrics: DealMetrics): Date {
  const hourlyViews = metrics.hourlyViews || [];
  if (hourlyViews.length === 0) {
    // Default to 2 hours before end
    return new Date(metrics.endTime.getTime() - 2 * 60 * 60 * 1000);
  }

  // Find hour with highest activity
  let maxViews = 0;
  let peakHourOffset = 0;
  hourlyViews.forEach((views, index) => {
    if (views > maxViews) {
      maxViews = views;
      peakHourOffset = index;
    }
  });

  // Project to today
  const peakTime = new Date();
  peakTime.setHours(peakTime.getHours() - (hourlyViews.length - peakHourOffset - 1));

  // If peak already passed, predict next peak
  if (peakTime < new Date()) {
    peakTime.setDate(peakTime.getDate() + 1);
  }

  // Cap at deal end time
  if (peakTime > metrics.endTime) {
    return new Date(metrics.endTime.getTime() - 30 * 60 * 1000);
  }

  return peakTime;
}

export class PopularityScoringService {
  private dealMetrics: Map<string, DealMetrics> = new Map();
  private scores: Map<string, DealPopularityScore> = new Map();
  private rankings: string[] = []; // ordered deal IDs

  // Calculate popularity score for a deal
  async calculateScore(dealId: string): Promise<DealPopularityScore> {
    const metrics = this.dealMetrics.get(dealId);
    if (!metrics) {
      return this.getDefaultScore(dealId);
    }

    // Calculate component scores
    const engagementScore = calculateEngagementScore(metrics);
    const trendingScore = calculateTrendingScore(metrics);
    const conversionScore = calculateConversionScore(metrics);
    const velocityScore = calculateVelocityScore(metrics);

    // Calculate overall score (weighted average)
    const overallScore =
      engagementScore * 0.25 +
      trendingScore * 0.30 +
      conversionScore * 0.25 +
      velocityScore * 0.20;

    // Determine badges
    const badges = determineBadges(metrics, {
      trending: trendingScore,
      engagement: engagementScore,
      conversion: conversionScore,
      velocity: velocityScore,
    });

    // Calculate rank
    this.updateRankings();
    const rank = this.rankings.indexOf(dealId) + 1;

    // Predict peak time
    const predictedPeakTime = predictPeakTime(metrics);

    const score: DealPopularityScore = {
      dealId,
      overallScore: Math.round(overallScore),
      trendingScore: Math.round(trendingScore),
      engagementScore: Math.round(engagementScore),
      conversionScore: Math.round(conversionScore),
      velocityScore: Math.round(velocityScore),
      rank,
      badges,
      predictedPeakTime,
    };

    this.scores.set(dealId, score);
    return score;
  }

  // Get top deals by popularity
  async getTopDeals(limit: number = 10): Promise<DealPopularityScore[]> {
    this.updateRankings();

    const topScores: DealPopularityScore[] = [];
    for (const dealId of this.rankings.slice(0, limit)) {
      const score = this.scores.get(dealId) || await this.calculateScore(dealId);
      topScores.push(score);
    }

    return topScores;
  }

  // Get trending deals (highest velocity)
  async getTrendingDeals(limit: number = 10): Promise<DealPopularityScore[]> {
    const allScores = await Promise.all(
      Array.from(this.dealMetrics.keys()).map((id) => this.calculateScore(id))
    );

    return allScores
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);
  }

  // Get deals ending soon with high activity
  async getUrgentDeals(limit: number = 10): Promise<DealPopularityScore[]> {
    const now = Date.now();
    const urgentDeals: Array<{ score: DealPopularityScore; urgency: number }> = [];

    for (const [dealId, metrics] of this.dealMetrics) {
      const hoursRemaining = (metrics.endTime.getTime() - now) / (1000 * 60 * 60);

      if (hoursRemaining > 0 && hoursRemaining < 3) {
        const score = await this.calculateScore(dealId);
        const urgency = score.velocityScore * (3 - hoursRemaining);
        urgentDeals.push({ score, urgency });
      }
    }

    return urgentDeals
      .sort((a, b) => b.urgency - a.urgency)
      .slice(0, limit)
      .map((d) => d.score);
  }

  // Update deal metrics
  recordInteraction(
    dealId: string,
    interactionType: 'view' | 'save' | 'share' | 'redemption'
  ): void {
    const metrics = this.dealMetrics.get(dealId);
    if (!metrics) return;

    // Update counts
    switch (interactionType) {
      case 'view':
        metrics.views++;
        break;
      case 'save':
        metrics.saves++;
        break;
      case 'share':
        metrics.shares++;
        break;
      case 'redemption':
        metrics.redemptions++;
        break;
    }

    // Update hourly data
    const currentHour = new Date().getHours();
    const hourIndex = currentHour % 24;

    if (!metrics.hourlyViews) metrics.hourlyViews = new Array(24).fill(0);
    if (!metrics.hourlyRedemptions) metrics.hourlyRedemptions = new Array(24).fill(0);

    if (interactionType === 'view') {
      metrics.hourlyViews[hourIndex]++;
    } else if (interactionType === 'redemption') {
      metrics.hourlyRedemptions[hourIndex]++;
    }

    this.dealMetrics.set(dealId, metrics);
  }

  // Private methods
  private updateRankings(): void {
    const allScores = Array.from(this.scores.entries());
    allScores.sort((a, b) => b[1].overallScore - a[1].overallScore);
    this.rankings = allScores.map(([id]) => id);
  }

  private getDefaultScore(dealId: string): DealPopularityScore {
    return {
      dealId,
      overallScore: 50,
      trendingScore: 50,
      engagementScore: 0,
      conversionScore: 0,
      velocityScore: 0,
      rank: 0,
      badges: ['new'],
      predictedPeakTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    };
  }

  // Load deal metrics
  loadDealMetrics(metrics: DealMetrics[]): void {
    metrics.forEach((m) => this.dealMetrics.set(m.dealId, m));
  }

  // Generate mock data for demo
  generateMockData(): void {
    const categories = ['drinks', 'food', 'entry', 'combo'];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      const createdAt = new Date(now.getTime() - Math.random() * 12 * 60 * 60 * 1000);
      const endTime = new Date(now.getTime() + Math.random() * 6 * 60 * 60 * 1000);
      const views = Math.floor(50 + Math.random() * 500);
      const redemptions = Math.floor(views * (0.05 + Math.random() * 0.15));

      const metrics: DealMetrics = {
        dealId: `deal-${i}`,
        venueId: `venue-${i % 5}`,
        venueName: `Venue ${i % 5}`,
        title: `Deal ${i}`,
        category: categories[i % categories.length],
        views,
        saves: Math.floor(views * 0.1 + Math.random() * 20),
        redemptions,
        shares: Math.floor(Math.random() * 10),
        maxRedemptions: 50 + Math.floor(Math.random() * 100),
        startTime: createdAt,
        endTime,
        createdAt,
        hourlyViews: Array.from({ length: 24 }, () => Math.floor(Math.random() * views / 24)),
        hourlyRedemptions: Array.from({ length: 24 }, () => Math.floor(Math.random() * redemptions / 24)),
      };

      this.dealMetrics.set(metrics.dealId, metrics);
    }
  }
}

export const popularityScoringService = new PopularityScoringService();
