// Pricing Optimization Service
// Suggests optimal discount percentages and deal structures

import { PricingRecommendation } from './types';

interface HistoricalDeal {
  id: string;
  venueId: string;
  category: string;
  originalPrice: number;
  discountPercent: number;
  discountType: 'percentage' | 'fixed';
  views: number;
  saves: number;
  redemptions: number;
  revenue: number;
  duration: number; // hours
  dayOfWeek: number;
  timeSlot: 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night';
}

interface CompetitorData {
  venueId: string;
  category: string;
  avgDiscount: number;
  avgRedemptions: number;
}

// Price elasticity model
function calculatePriceElasticity(
  historicalDeals: HistoricalDeal[],
  category: string
): number {
  const categoryDeals = historicalDeals.filter((d) => d.category === category);
  if (categoryDeals.length < 3) return -1.5; // default elasticity

  // Simple elasticity calculation: % change in quantity / % change in price
  const sorted = categoryDeals.sort((a, b) => a.discountPercent - b.discountPercent);
  const low = sorted[0];
  const high = sorted[sorted.length - 1];

  if (low.discountPercent === high.discountPercent) return -1.5;

  const priceChangePercent = (high.discountPercent - low.discountPercent) / low.discountPercent;
  const quantityChangePercent = (high.redemptions - low.redemptions) / Math.max(low.redemptions, 1);

  return quantityChangePercent / priceChangePercent;
}

// Calculate optimal discount using elasticity
function calculateOptimalDiscount(
  elasticity: number,
  currentMargin: number,
  targetRedemptions: number,
  currentRedemptions: number
): number {
  // Using elasticity to find discount that maximizes profit
  // Simplified model: optimal discount = (1 + 1/elasticity) * margin
  const baseOptimal = Math.abs((1 + 1 / elasticity) * currentMargin * 100);

  // Adjust based on target vs current redemptions
  const redemptionGap = (targetRedemptions - currentRedemptions) / Math.max(currentRedemptions, 1);
  const adjustment = redemptionGap * 5; // 5% adjustment per 100% gap

  return Math.max(10, Math.min(50, baseOptimal + adjustment));
}

export class PricingOptimizationService {
  private historicalDeals: Map<string, HistoricalDeal[]> = new Map();
  private competitorData: Map<string, CompetitorData[]> = new Map();

  // Get pricing recommendation for a deal
  async getRecommendation(
    venueId: string,
    category: string,
    currentPrice: number,
    targetRedemptions?: number
  ): Promise<PricingRecommendation> {
    const venueDealHistory = this.historicalDeals.get(venueId) || this.generateMockHistory(venueId);
    const categoryDeals = venueDealHistory.filter((d) => d.category === category);

    // Calculate price elasticity for this category
    const elasticity = calculatePriceElasticity(venueDealHistory, category);

    // Get competitor data
    const competitors = this.competitorData.get(category) || [];
    const competitorAvgDiscount = competitors.length > 0
      ? competitors.reduce((sum, c) => sum + c.avgDiscount, 0) / competitors.length
      : 25; // default

    // Calculate historical best performance
    const sortedByRedemption = [...categoryDeals].sort((a, b) => b.redemptions - a.redemptions);
    const historicalBest = sortedByRedemption[0]?.discountPercent || 25;

    // Current average performance
    const avgRedemptions = categoryDeals.length > 0
      ? categoryDeals.reduce((sum, d) => sum + d.redemptions, 0) / categoryDeals.length
      : 15;

    // Calculate optimal discount
    const currentMargin = 0.6; // assume 60% margin
    const target = targetRedemptions || Math.round(avgRedemptions * 1.3);
    const optimalDiscount = calculateOptimalDiscount(
      elasticity,
      currentMargin,
      target,
      avgRedemptions
    );

    // Determine discount type
    const discountType: 'percentage' | 'fixed' = currentPrice > 30 ? 'percentage' : 'fixed';
    const recommendedDiscount = discountType === 'percentage'
      ? Math.round(optimalDiscount)
      : Math.round(currentPrice * optimalDiscount / 100);

    // Predict outcomes
    const discountImpact = (recommendedDiscount - 20) / 20; // baseline 20%
    const predictedRedemptions = Math.round(avgRedemptions * (1 + discountImpact * Math.abs(elasticity)));
    const discountedPrice = currentPrice * (1 - recommendedDiscount / 100);
    const predictedRevenue = Math.round(predictedRedemptions * discountedPrice);

    // Calculate confidence
    const dataPoints = categoryDeals.length;
    const confidence = Math.min(0.95, 0.5 + (dataPoints / 50) * 0.45);

    // Generate reasoning
    const reasoning: string[] = [];

    if (optimalDiscount > competitorAvgDiscount + 5) {
      reasoning.push(`Higher than market average (${Math.round(competitorAvgDiscount)}%) to drive more traffic`);
    } else if (optimalDiscount < competitorAvgDiscount - 5) {
      reasoning.push(`Lower than market average - your brand commands premium pricing`);
    } else {
      reasoning.push(`Aligned with market average discount of ${Math.round(competitorAvgDiscount)}%`);
    }

    if (Math.abs(optimalDiscount - historicalBest) < 5) {
      reasoning.push(`Similar to your best-performing deals historically`);
    }

    if (elasticity < -2) {
      reasoning.push(`High price sensitivity in ${category} - customers respond well to discounts`);
    } else if (elasticity > -1) {
      reasoning.push(`Lower price sensitivity - focus on value proposition over deep discounts`);
    }

    // Category-specific reasoning
    const categoryInsights: Record<string, string> = {
      drinks: 'Drink deals perform best during happy hours (4-7PM)',
      food: 'Food deals see highest redemption during lunch (11AM-2PM)',
      entry: 'Entry deals work best on slower weeknights (Tue-Thu)',
      combo: 'Combo deals have highest perceived value - consider bundling',
    };

    if (categoryInsights[category.toLowerCase()]) {
      reasoning.push(categoryInsights[category.toLowerCase()]);
    }

    return {
      venueId,
      category,
      currentPrice,
      recommendedDiscount,
      discountType,
      predictedRedemptions,
      predictedRevenue,
      confidence,
      reasoning,
      comparisons: {
        competitorAvg: Math.round(competitorAvgDiscount),
        historicalBest,
      },
    };
  }

  // A/B test analysis
  async analyzeABTest(
    dealAId: string,
    dealBId: string,
    venueId: string
  ): Promise<{
    winner: 'A' | 'B' | 'inconclusive';
    confidence: number;
    insights: string[];
    recommendation: string;
  }> {
    const history = this.historicalDeals.get(venueId) || [];
    const dealA = history.find((d) => d.id === dealAId);
    const dealB = history.find((d) => d.id === dealBId);

    if (!dealA || !dealB) {
      return {
        winner: 'inconclusive',
        confidence: 0,
        insights: ['Insufficient data for analysis'],
        recommendation: 'Run more deals to gather data',
      };
    }

    // Calculate conversion rates
    const conversionA = dealA.redemptions / Math.max(dealA.views, 1);
    const conversionB = dealB.redemptions / Math.max(dealB.views, 1);

    // Calculate revenue per view
    const revenuePerViewA = dealA.revenue / Math.max(dealA.views, 1);
    const revenuePerViewB = dealB.revenue / Math.max(dealB.views, 1);

    // Statistical significance (simplified z-test)
    const pooledConversion = (dealA.redemptions + dealB.redemptions) / (dealA.views + dealB.views);
    const standardError = Math.sqrt(
      pooledConversion * (1 - pooledConversion) * (1 / dealA.views + 1 / dealB.views)
    );
    const zScore = (conversionA - conversionB) / standardError;
    const confidence = Math.min(0.99, Math.abs(zScore) / 3);

    const insights: string[] = [];
    let winner: 'A' | 'B' | 'inconclusive' = 'inconclusive';

    if (Math.abs(zScore) > 1.96) {
      winner = zScore > 0 ? 'A' : 'B';
      insights.push(`Deal ${winner} has significantly better conversion rate`);
    }

    if (revenuePerViewA > revenuePerViewB * 1.1) {
      insights.push('Deal A generates more revenue per view');
      if (winner === 'inconclusive') winner = 'A';
    } else if (revenuePerViewB > revenuePerViewA * 1.1) {
      insights.push('Deal B generates more revenue per view');
      if (winner === 'inconclusive') winner = 'B';
    }

    // Analyze what made the difference
    if (dealA.discountPercent !== dealB.discountPercent) {
      const betterDiscount = conversionA > conversionB ? dealA.discountPercent : dealB.discountPercent;
      insights.push(`${betterDiscount}% discount drove better results`);
    }

    const recommendation = winner !== 'inconclusive'
      ? `Continue with Deal ${winner}'s pricing strategy for future deals`
      : 'Consider running longer tests with larger sample sizes';

    return { winner, confidence, insights, recommendation };
  }

  // Generate mock historical data
  private generateMockHistory(venueId: string): HistoricalDeal[] {
    const categories = ['drinks', 'food', 'entry', 'combo'];
    const history: HistoricalDeal[] = [];

    categories.forEach((category) => {
      for (let i = 0; i < 10; i++) {
        const discountPercent = 15 + Math.random() * 35;
        const views = Math.round(100 + Math.random() * 200);
        const conversionBase = 0.1 + (discountPercent / 100) * 0.15;
        const redemptions = Math.round(views * conversionBase * (0.8 + Math.random() * 0.4));
        const originalPrice = category === 'entry' ? 20 : 30 + Math.random() * 30;

        history.push({
          id: `mock-${venueId}-${category}-${i}`,
          venueId,
          category,
          originalPrice,
          discountPercent,
          discountType: 'percentage',
          views,
          saves: Math.round(views * 0.15),
          redemptions,
          revenue: redemptions * originalPrice * (1 - discountPercent / 100),
          duration: 2 + Math.floor(Math.random() * 4),
          dayOfWeek: Math.floor(Math.random() * 7),
          timeSlot: ['lunch', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 4)] as any,
        });
      }
    });

    this.historicalDeals.set(venueId, history);

    // Generate competitor data
    categories.forEach((category) => {
      const competitors: CompetitorData[] = [];
      for (let i = 0; i < 5; i++) {
        competitors.push({
          venueId: `competitor-${i}`,
          category,
          avgDiscount: 20 + Math.random() * 15,
          avgRedemptions: 15 + Math.random() * 20,
        });
      }
      this.competitorData.set(category, competitors);
    });

    return history;
  }

  // Load actual historical data
  loadHistoricalData(venueId: string, deals: HistoricalDeal[]): void {
    this.historicalDeals.set(venueId, deals);
  }
}

export const pricingOptimizationService = new PricingOptimizationService();
