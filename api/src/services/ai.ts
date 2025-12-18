/**
 * AI Service - Powered by Groq API
 *
 * This service provides AI-powered features for the Buzz platform:
 * - Deal content generation
 * - Smart recommendations
 * - Demand forecasting
 * - Pricing optimization
 * - Customer insights
 */

import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const AI_MODEL = 'mixtral-8x7b-32768'; // Fast and cost-effective for production
const AI_MODEL_ADVANCED = 'llama-3.1-70b-versatile'; // For complex analysis

// ============================================================================
// TYPES
// ============================================================================

export interface DealContentInput {
  venueType: 'bar' | 'restaurant' | 'club' | 'cafe' | 'hotel';
  venueName: string;
  dealType: 'discount' | 'bogo' | 'freeItem' | 'combo' | 'happyHour' | 'event';
  category: 'drinks' | 'food' | 'entry' | 'experience';
  discountValue?: number;
  discountType?: 'percentage' | 'fixed';
  itemName?: string;
  timeSlot?: 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night' | 'lateNight';
  targetAudience?: string;
}

export interface GeneratedContent {
  titles: string[];
  descriptions: string[];
  hashtags: string[];
  callToAction: string[];
  tips: string[];
  estimatedEngagement: 'low' | 'medium' | 'high';
}

export interface DemandPrediction {
  hour: number;
  predictedTraffic: number; // 0-100
  confidence: number;
  factors: string[];
}

export interface PricingRecommendation {
  suggestedDiscount: number;
  optimalTimeSlot: string;
  expectedRedemptions: number;
  confidence: number;
  reasoning: string;
}

export interface CustomerInsight {
  segment: string;
  description: string;
  preferences: string[];
  bestDealTypes: string[];
  optimalTiming: string;
}

// ============================================================================
// AI SERVICE CLASS
// ============================================================================

class AIService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!process.env.GROQ_API_KEY;
    if (!this.isConfigured) {
      console.warn('GROQ_API_KEY not configured. AI features will use fallback responses.');
    }
  }

  /**
   * Generate compelling deal content using AI
   */
  async generateDealContent(input: DealContentInput): Promise<GeneratedContent> {
    if (!this.isConfigured) {
      return this.getFallbackContent(input);
    }

    try {
      const prompt = this.buildContentPrompt(input);

      const response = await groq.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.choices[0]?.message?.content;
      if (!textContent) {
        throw new Error('No response from AI');
      }

      return this.parseContentResponse(textContent);
    } catch (error) {
      console.error('AI content generation error:', error);
      return this.getFallbackContent(input);
    }
  }

  /**
   * Generate demand predictions for a venue
   */
  async predictDemand(
    venueId: string,
    venueType: string,
    historicalData?: any[]
  ): Promise<DemandPrediction[]> {
    if (!this.isConfigured) {
      return this.getFallbackDemandPredictions(venueType);
    }

    try {
      const prompt = `You are an AI analyst for a venue deals platform. Predict hourly customer traffic for a ${venueType} for the next 24 hours.

Consider:
- Day of week patterns
- Typical ${venueType} peak hours
- Weather and seasonal factors

Return JSON array with objects containing: hour (0-23), predictedTraffic (0-100), confidence (0-1), factors (array of strings explaining the prediction).

Only return valid JSON, no other text.`;

      const response = await groq.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.choices[0]?.message?.content;
      if (!textContent) {
        throw new Error('No response from AI');
      }

      return JSON.parse(textContent);
    } catch (error) {
      console.error('AI demand prediction error:', error);
      return this.getFallbackDemandPredictions(venueType);
    }
  }

  /**
   * Get pricing optimization recommendations
   */
  async optimizePricing(
    dealType: string,
    category: string,
    venueType: string,
    competitorData?: any
  ): Promise<PricingRecommendation> {
    if (!this.isConfigured) {
      return this.getFallbackPricingRecommendation(dealType, category);
    }

    try {
      const prompt = `You are a pricing optimization AI for a venue deals platform.

Analyze optimal pricing for:
- Deal type: ${dealType}
- Category: ${category}
- Venue type: ${venueType}

Return JSON with:
- suggestedDiscount (number, percentage)
- optimalTimeSlot (string)
- expectedRedemptions (number per day)
- confidence (0-1)
- reasoning (string explaining the recommendation)

Only return valid JSON, no other text.`;

      const response = await groq.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.choices[0]?.message?.content;
      if (!textContent) {
        throw new Error('No response from AI');
      }

      return JSON.parse(textContent);
    } catch (error) {
      console.error('AI pricing optimization error:', error);
      return this.getFallbackPricingRecommendation(dealType, category);
    }
  }

  /**
   * Analyze customer segments and provide insights
   */
  async analyzeCustomerSegments(
    redemptionData: any[],
    venueType: string
  ): Promise<CustomerInsight[]> {
    if (!this.isConfigured) {
      return this.getFallbackCustomerInsights(venueType);
    }

    try {
      const prompt = `You are a customer analytics AI for a ${venueType}.

Based on typical customer behavior patterns for this venue type, identify 4 key customer segments.

For each segment, provide:
- segment (string, name)
- description (string)
- preferences (array of strings)
- bestDealTypes (array of strings)
- optimalTiming (string)

Return as JSON array. Only return valid JSON, no other text.`;

      const response = await groq.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.choices[0]?.message?.content;
      if (!textContent) {
        throw new Error('No response from AI');
      }

      return JSON.parse(textContent);
    } catch (error) {
      console.error('AI customer analysis error:', error);
      return this.getFallbackCustomerInsights(venueType);
    }
  }

  /**
   * Generate personalized deal recommendations for a user
   */
  async getPersonalizedRecommendations(
    userPreferences: any,
    availableDeals: any[],
    location?: { lat: number; lng: number }
  ): Promise<string[]> {
    if (!this.isConfigured || availableDeals.length === 0) {
      return availableDeals.slice(0, 5).map((d) => d.id);
    }

    try {
      const dealSummaries = availableDeals.slice(0, 20).map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        venueType: d.venue?.type,
        discount: d.discount_value,
      }));

      const prompt = `You are a recommendation AI for a deals platform.

User preferences: ${JSON.stringify(userPreferences || {})}
Available deals: ${JSON.stringify(dealSummaries)}

Return JSON array of deal IDs ranked by relevance. Top 5 only.
Only return valid JSON array of strings, no other text.`;

      const response = await groq.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.choices[0]?.message?.content;
      if (!textContent) {
        throw new Error('No response from AI');
      }

      return JSON.parse(textContent);
    } catch (error) {
      console.error('AI recommendation error:', error);
      return availableDeals.slice(0, 5).map((d) => d.id);
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private buildContentPrompt(input: DealContentInput): string {
    const discountText = input.discountValue
      ? `${input.discountValue}${input.discountType === 'percentage' ? '%' : '$'} off`
      : 'special offer';

    return `You are a marketing copywriter for a deals platform. Create compelling content for a ${input.venueType} deal.

Deal details:
- Venue: ${input.venueName}
- Deal type: ${input.dealType}
- Category: ${input.category}
- Discount: ${discountText}
- Item: ${input.itemName || 'various items'}
- Time slot: ${input.timeSlot || 'all day'}

Generate JSON with:
- titles: array of 5 catchy, short titles (max 50 chars each)
- descriptions: array of 3 engaging descriptions (max 150 chars each)
- hashtags: array of 6 relevant hashtags (with #)
- callToAction: array of 3 CTAs
- tips: array of 3 tips for the venue owner
- estimatedEngagement: "low", "medium", or "high"

Make content exciting, use action words, create urgency. Only return valid JSON.`;
  }

  private parseContentResponse(text: string): GeneratedContent {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch {
      return this.getFallbackContent({} as DealContentInput);
    }
  }

  private getFallbackContent(input: DealContentInput): GeneratedContent {
    const venueType = input.venueType || 'venue';
    const discountText = input.discountValue
      ? `${input.discountValue}${input.discountType === 'percentage' ? '%' : '$'} off`
      : 'special offer';

    return {
      titles: [
        `${discountText.toUpperCase()} Today Only!`,
        `Don't Miss This Deal!`,
        `Limited Time Offer`,
        `Exclusive ${venueType} Special`,
        `Your Favorite Deal Awaits`,
      ],
      descriptions: [
        `Enjoy amazing savings at ${input.venueName || 'our venue'}. ${discountText} on ${input.category || 'select items'}.`,
        `Treat yourself to something special. Limited availability - grab this deal now!`,
        `The perfect excuse to visit. Save big on ${input.itemName || 'your favorites'}.`,
      ],
      hashtags: [
        '#deals',
        '#savings',
        '#foodie',
        '#nightlife',
        '#localdeals',
        '#buzzdeal',
      ],
      callToAction: [
        'Grab This Deal',
        'Claim Offer Now',
        'Get Deal',
      ],
      tips: [
        'Post this deal during peak browsing hours (6-8 PM)',
        'Add high-quality photos to increase engagement',
        'Consider extending deal duration for better results',
      ],
      estimatedEngagement: 'medium',
    };
  }

  private getFallbackDemandPredictions(venueType: string): DemandPrediction[] {
    const predictions: DemandPrediction[] = [];
    const isBar = venueType === 'bar' || venueType === 'club';
    const isRestaurant = venueType === 'restaurant';
    const isCafe = venueType === 'cafe';

    for (let hour = 0; hour < 24; hour++) {
      let traffic = 20;
      const factors: string[] = [];

      if (isCafe && hour >= 7 && hour <= 10) {
        traffic = 70 + Math.random() * 20;
        factors.push('Morning rush');
      } else if (isRestaurant && hour >= 11 && hour <= 14) {
        traffic = 75 + Math.random() * 15;
        factors.push('Lunch rush');
      } else if (isRestaurant && hour >= 18 && hour <= 21) {
        traffic = 85 + Math.random() * 10;
        factors.push('Dinner service');
      } else if (isBar && hour >= 17 && hour <= 20) {
        traffic = 60 + Math.random() * 20;
        factors.push('Happy hour');
      } else if (isBar && hour >= 21 && hour <= 23) {
        traffic = 85 + Math.random() * 15;
        factors.push('Peak nightlife');
      } else if (hour >= 2 && hour <= 6) {
        traffic = 5 + Math.random() * 10;
        factors.push('Off-peak hours');
      }

      predictions.push({
        hour,
        predictedTraffic: Math.round(traffic),
        confidence: 0.7 + Math.random() * 0.2,
        factors,
      });
    }

    return predictions;
  }

  private getFallbackPricingRecommendation(dealType: string, category: string): PricingRecommendation {
    const discounts: Record<string, number> = {
      happyHour: 25,
      discount: 20,
      bogo: 50,
      freeItem: 100,
      combo: 15,
      event: 10,
    };

    return {
      suggestedDiscount: discounts[dealType] || 20,
      optimalTimeSlot: category === 'drinks' ? '5PM - 8PM' : '11AM - 2PM',
      expectedRedemptions: Math.round(15 + Math.random() * 30),
      confidence: 0.75,
      reasoning: `Based on typical ${dealType} performance in the ${category} category, this discount level balances customer attraction with profit margins.`,
    };
  }

  private getFallbackCustomerInsights(venueType: string): CustomerInsight[] {
    return [
      {
        segment: 'Deal Hunters',
        description: 'Price-conscious customers who actively seek discounts',
        preferences: ['High discounts', 'BOGO offers', 'Flash deals'],
        bestDealTypes: ['bogo', 'discount', 'happyHour'],
        optimalTiming: 'Weekday afternoons',
      },
      {
        segment: 'Social Groups',
        description: 'Groups looking for venues to gather and socialize',
        preferences: ['Group-friendly deals', 'Shareable items', 'Good atmosphere'],
        bestDealTypes: ['combo', 'happyHour', 'event'],
        optimalTiming: 'Friday and Saturday evenings',
      },
      {
        segment: 'Regulars',
        description: 'Frequent visitors with established loyalty',
        preferences: ['Exclusive offers', 'Loyalty rewards', 'Early access'],
        bestDealTypes: ['freeItem', 'discount'],
        optimalTiming: 'Any time',
      },
      {
        segment: 'New Explorers',
        description: 'First-time visitors discovering new venues',
        preferences: ['Introductory offers', 'Popular items', 'Low commitment'],
        bestDealTypes: ['discount', 'freeItem'],
        optimalTiming: 'Weekends',
      },
    ];
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export individual functions for convenience
export const generateDealContent = (input: DealContentInput) =>
  aiService.generateDealContent(input);

export const predictDemand = (venueId: string, venueType: string, historicalData?: any[]) =>
  aiService.predictDemand(venueId, venueType, historicalData);

export const optimizePricing = (
  dealType: string,
  category: string,
  venueType: string,
  competitorData?: any
) => aiService.optimizePricing(dealType, category, venueType, competitorData);

export const analyzeCustomerSegments = (redemptionData: any[], venueType: string) =>
  aiService.analyzeCustomerSegments(redemptionData, venueType);

export const getPersonalizedRecommendations = (
  userPreferences: any,
  availableDeals: any[],
  location?: { lat: number; lng: number }
) => aiService.getPersonalizedRecommendations(userPreferences, availableDeals, location);
