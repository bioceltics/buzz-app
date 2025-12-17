// Demand Forecasting Service for Venue Owners
// Predicts slow periods and suggests optimal times to create deals

import { DemandForecast, DealPerformancePrediction } from './types';

interface HistoricalData {
  date: Date;
  hour: number;
  dayOfWeek: number;
  traffic: number; // 0-100 scale
  weather?: string;
  isHoliday?: boolean;
  activeDeals?: number;
  redemptions?: number;
}

interface Deal {
  id: string;
  title: string;
  category: string;
  discountPercent: number;
  startTime: string;
  endTime: string;
  maxRedemptions: number;
  description: string;
}

// Feature engineering for time-series prediction
function extractTimeFeatures(date: Date): Record<string, number> {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();
  const month = date.getMonth();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return {
    dayOfWeek,
    hour,
    month,
    isWeekend: isWeekend ? 1 : 0,
    hourSin: Math.sin((2 * Math.PI * hour) / 24),
    hourCos: Math.cos((2 * Math.PI * hour) / 24),
    daySin: Math.sin((2 * Math.PI * dayOfWeek) / 7),
    dayCos: Math.cos((2 * Math.PI * dayOfWeek) / 7),
  };
}

// Simple exponential smoothing for trend
function exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) return [];
  const smoothed: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
  }
  return smoothed;
}

// Calculate seasonal indices
function calculateSeasonalIndices(
  data: HistoricalData[],
  period: 'hourly' | 'daily'
): Map<number, number> {
  const indices = new Map<number, { sum: number; count: number }>();

  data.forEach((d) => {
    const key = period === 'hourly' ? d.hour : d.dayOfWeek;
    const existing = indices.get(key) || { sum: 0, count: 0 };
    existing.sum += d.traffic;
    existing.count++;
    indices.set(key, existing);
  });

  const avgTraffic = data.reduce((sum, d) => sum + d.traffic, 0) / data.length;
  const seasonalIndices = new Map<number, number>();

  indices.forEach((value, key) => {
    const avgForPeriod = value.sum / value.count;
    seasonalIndices.set(key, avgForPeriod / avgTraffic);
  });

  return seasonalIndices;
}

export class DemandForecastingService {
  private historicalData: Map<string, HistoricalData[]> = new Map();
  private hourlySeasonalIndices: Map<string, Map<number, number>> = new Map();
  private dailySeasonalIndices: Map<string, Map<number, number>> = new Map();

  // Generate demand forecast for a venue
  async forecastDemand(
    venueId: string,
    targetDate: Date,
    historicalDays: number = 30
  ): Promise<DemandForecast> {
    const venueData = this.historicalData.get(venueId) || this.generateMockData(venueId);

    // Calculate seasonal patterns
    const hourlyIndices = calculateSeasonalIndices(venueData, 'hourly');
    const dailyIndices = calculateSeasonalIndices(venueData, 'daily');

    this.hourlySeasonalIndices.set(venueId, hourlyIndices);
    this.dailySeasonalIndices.set(venueId, dailyIndices);

    // Calculate base trend
    const recentTraffic = venueData.slice(-7).map((d) => d.traffic);
    const smoothedTrend = exponentialSmoothing(recentTraffic);
    const baseTrend = smoothedTrend[smoothedTrend.length - 1] || 50;

    // Calculate weekly trend
    const thisWeekAvg = recentTraffic.reduce((a, b) => a + b, 0) / recentTraffic.length;
    const lastWeekAvg = venueData.slice(-14, -7).reduce((sum, d) => sum + d.traffic, 0) / 7;
    const weeklyTrend: 'increasing' | 'stable' | 'decreasing' =
      thisWeekAvg > lastWeekAvg * 1.1 ? 'increasing' :
      thisWeekAvg < lastWeekAvg * 0.9 ? 'decreasing' : 'stable';

    // Generate hourly predictions
    const targetDayOfWeek = targetDate.getDay();
    const dailyIndex = dailyIndices.get(targetDayOfWeek) || 1;

    const hourlyPredictions: DemandForecast['hourlyPredictions'] = [];

    for (let hour = 0; hour < 24; hour++) {
      const hourlyIndex = hourlyIndices.get(hour) || 1;

      // Calculate predicted traffic
      let predictedTraffic = baseTrend * dailyIndex * hourlyIndex;

      // Add some randomness for realism
      const noise = (Math.random() - 0.5) * 10;
      predictedTraffic = Math.max(0, Math.min(100, predictedTraffic + noise));

      // Determine recommendation
      let recommendation: 'create_deal' | 'normal' | 'busy' = 'normal';
      let suggestedDealType: string | undefined;

      if (predictedTraffic < 30) {
        recommendation = 'create_deal';
        if (hour >= 11 && hour < 14) {
          suggestedDealType = 'Lunch Special - High discount to drive traffic';
        } else if (hour >= 16 && hour < 19) {
          suggestedDealType = 'Happy Hour - 2-for-1 drinks or appetizers';
        } else if (hour >= 20) {
          suggestedDealType = 'Late Night Deal - Free item with purchase';
        }
      } else if (predictedTraffic > 70) {
        recommendation = 'busy';
      }

      // Calculate confidence based on data availability
      const confidence = Math.min(0.95, 0.6 + (venueData.length / 100) * 0.35);

      hourlyPredictions.push({
        hour,
        predictedTraffic: Math.round(predictedTraffic),
        confidence,
        recommendation,
        suggestedDealType,
      });
    }

    // Identify seasonal factors
    const seasonalFactors: string[] = [];
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

    if (targetDayOfWeek === 0 || targetDayOfWeek === 6) {
      seasonalFactors.push('Weekend - typically higher traffic');
    }
    if (targetDayOfWeek === 1) {
      seasonalFactors.push('Monday - often slower start to week');
    }
    if (targetDayOfWeek === 4 || targetDayOfWeek === 5) {
      seasonalFactors.push('End of week - increasing social activity');
    }

    return {
      venueId,
      date: targetDate,
      hourlyPredictions,
      weeklyTrend,
      seasonalFactors,
    };
  }

  // Predict deal performance before it goes live
  async predictDealPerformance(
    venueId: string,
    deal: Deal
  ): Promise<DealPerformancePrediction> {
    const venueData = this.historicalData.get(venueId) || this.generateMockData(venueId);

    // Extract deal features
    const startHour = parseInt(deal.startTime.split(':')[0]);
    const endHour = parseInt(deal.endTime.split(':')[0]);
    const duration = endHour - startHour;

    // Base predictions from historical data
    const avgDealViews = 150; // baseline
    const avgDealSaves = 30;
    const avgDealRedemptions = 20;

    // Adjust based on discount percentage
    const discountMultiplier = 1 + (deal.discountPercent - 20) * 0.02;

    // Adjust based on time slot
    const hourlyIndices = this.hourlySeasonalIndices.get(venueId);
    let timeMultiplier = 1;
    if (hourlyIndices) {
      const avgIndex = Array.from({ length: duration }, (_, i) =>
        hourlyIndices.get(startHour + i) || 1
      ).reduce((a, b) => a + b, 0) / duration;
      timeMultiplier = avgIndex;
    }

    // Adjust based on category
    const categoryMultipliers: Record<string, number> = {
      'drinks': 1.2,
      'food': 1.0,
      'entry': 0.9,
      'combo': 1.1,
    };
    const categoryMultiplier = categoryMultipliers[deal.category.toLowerCase()] || 1;

    // Calculate predictions
    const predictedViews = Math.round(avgDealViews * discountMultiplier * timeMultiplier * categoryMultiplier);
    const conversionRate = 0.12 + (deal.discountPercent / 100) * 0.08;
    const predictedSaves = Math.round(predictedViews * 0.2);
    const predictedRedemptions = Math.min(
      deal.maxRedemptions,
      Math.round(predictedViews * conversionRate)
    );

    // Estimate revenue impact
    const avgOrderValue = 35; // baseline
    const predictedRevenue = predictedRedemptions * avgOrderValue * (1 - deal.discountPercent / 100);

    // Generate suggestions
    const suggestions: string[] = [];

    if (deal.discountPercent < 20) {
      suggestions.push('Consider increasing discount to 20%+ for better conversion');
    }
    if (deal.discountPercent > 50) {
      suggestions.push('High discount may impact profitability - consider limiting redemptions');
    }
    if (startHour < 11 || startHour > 20) {
      suggestions.push('Peak deal performance is typically 11AM-8PM');
    }
    if (duration < 2) {
      suggestions.push('Longer deal duration (3-4 hours) typically performs better');
    }
    if (deal.maxRedemptions < predictedRedemptions * 1.5) {
      suggestions.push('Consider increasing redemption limit to capture more demand');
    }

    // Risk factors
    const riskFactors: string[] = [];
    if (deal.discountPercent > 40) {
      riskFactors.push('High discount may attract deal-seekers with low repeat rate');
    }
    if (timeMultiplier < 0.7) {
      riskFactors.push('Time slot has historically lower traffic');
    }

    // Optimal time slot suggestion
    let optimalStart = '17:00';
    let optimalEnd = '20:00';
    if (hourlyIndices) {
      let maxTraffic = 0;
      hourlyIndices.forEach((value, hour) => {
        if (hour >= 11 && hour <= 20 && value > maxTraffic) {
          maxTraffic = value;
          optimalStart = `${hour.toString().padStart(2, '0')}:00`;
          optimalEnd = `${Math.min(hour + 3, 23).toString().padStart(2, '0')}:00`;
        }
      });
    }

    return {
      dealId: deal.id,
      predictedViews,
      predictedSaves,
      predictedRedemptions,
      predictedRevenue: Math.round(predictedRevenue),
      confidence: 0.75,
      suggestions,
      optimalTimeSlot: { start: optimalStart, end: optimalEnd },
      riskFactors,
    };
  }

  // Generate mock historical data for demo
  private generateMockData(venueId: string): HistoricalData[] {
    const data: HistoricalData[] = [];
    const now = new Date();

    for (let day = 30; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);

      for (let hour = 0; hour < 24; hour++) {
        // Base traffic pattern
        let baseTraffic = 20;

        // Time-of-day pattern
        if (hour >= 11 && hour < 14) baseTraffic = 60; // lunch
        else if (hour >= 17 && hour < 20) baseTraffic = 80; // dinner/happy hour
        else if (hour >= 20 && hour < 23) baseTraffic = 70; // evening
        else if (hour < 6) baseTraffic = 5; // late night

        // Day-of-week adjustment
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6) baseTraffic *= 1.3; // weekend
        if (dayOfWeek === 0) baseTraffic *= 0.9; // Sunday
        if (dayOfWeek === 1) baseTraffic *= 0.8; // Monday

        // Add noise
        const noise = (Math.random() - 0.5) * 20;
        const traffic = Math.max(0, Math.min(100, baseTraffic + noise));

        data.push({
          date: new Date(date.setHours(hour)),
          hour,
          dayOfWeek,
          traffic: Math.round(traffic),
        });
      }
    }

    this.historicalData.set(venueId, data);
    return data;
  }

  // Load historical data
  loadHistoricalData(venueId: string, data: HistoricalData[]): void {
    this.historicalData.set(venueId, data);
  }
}

export const demandForecastingService = new DemandForecastingService();
