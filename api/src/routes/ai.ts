import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import {
  generateDealContent,
  predictDemand,
  optimizePricing,
  analyzeCustomerSegments,
  getPersonalizedRecommendations,
  DealContentInput,
} from '../services/ai.js';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

/**
 * POST /api/ai/generate-content
 * Generate AI-powered deal content
 */
router.post('/generate-content', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const input: DealContentInput = req.body;

    if (!input.venueType || !input.dealType || !input.category) {
      return res.status(400).json({
        error: 'Missing required fields: venueType, dealType, category',
      });
    }

    const content = await generateDealContent(input);
    res.json({ content });
  } catch (error) {
    console.error('Generate content error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

/**
 * GET /api/ai/demand-forecast/:venueId
 * Get demand predictions for a venue
 */
router.get('/demand-forecast/:venueId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { venueId } = req.params;

    // Get venue details
    const { data: venue, error: venueError } = await supabaseAdmin
      .from('venues')
      .select('id, type, owner_id')
      .eq('id', venueId)
      .single();

    if (venueError || !venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Verify ownership or admin
    if (venue.owner_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get historical redemption data (optional enhancement)
    const { data: historicalData } = await supabaseAdmin
      .from('redemptions')
      .select('redeemed_at')
      .eq('venue_id', venueId)
      .gte('redeemed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('redeemed_at', { ascending: true });

    const predictions = await predictDemand(venueId, venue.type, historicalData || []);
    res.json({ predictions, venueType: venue.type });
  } catch (error) {
    console.error('Demand forecast error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

/**
 * POST /api/ai/optimize-pricing
 * Get pricing optimization recommendations
 */
router.post('/optimize-pricing', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { dealType, category, venueId } = req.body;

    if (!dealType || !category || !venueId) {
      return res.status(400).json({
        error: 'Missing required fields: dealType, category, venueId',
      });
    }

    // Get venue details
    const { data: venue, error: venueError } = await supabaseAdmin
      .from('venues')
      .select('id, type, owner_id')
      .eq('id', venueId)
      .single();

    if (venueError || !venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Verify ownership or admin
    if (venue.owner_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const recommendation = await optimizePricing(dealType, category, venue.type);
    res.json({ recommendation });
  } catch (error) {
    console.error('Pricing optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize pricing' });
  }
});

/**
 * GET /api/ai/customer-insights/:venueId
 * Get customer segment analysis
 */
router.get('/customer-insights/:venueId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { venueId } = req.params;

    // Get venue details
    const { data: venue, error: venueError } = await supabaseAdmin
      .from('venues')
      .select('id, type, owner_id')
      .eq('id', venueId)
      .single();

    if (venueError || !venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Verify ownership or admin
    if (venue.owner_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get redemption data for analysis
    const { data: redemptionData } = await supabaseAdmin
      .from('redemptions')
      .select(`
        *,
        user:users(id, full_name),
        deal:deals(type, discount_type, discount_value)
      `)
      .eq('venue_id', venueId)
      .order('redeemed_at', { ascending: false })
      .limit(500);

    const insights = await analyzeCustomerSegments(redemptionData || [], venue.type);
    res.json({ insights, totalRedemptions: redemptionData?.length || 0 });
  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({ error: 'Failed to analyze customers' });
  }
});

/**
 * GET /api/ai/recommendations
 * Get personalized deal recommendations for the current user
 */
router.get('/recommendations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { lat, lng, limit = 10 } = req.query;

    // Get user preferences from their history
    const { data: userRedemptions } = await supabaseAdmin
      .from('redemptions')
      .select(`
        deal:deals(type, venue:venues(type))
      `)
      .eq('user_id', req.user!.id)
      .order('redeemed_at', { ascending: false })
      .limit(20);

    // Derive preferences from redemption history
    const preferences: any = {};
    if (userRedemptions && userRedemptions.length > 0) {
      const dealTypes: Record<string, number> = {};
      const venueTypes: Record<string, number> = {};

      userRedemptions.forEach((r: any) => {
        if (r.deal?.type) {
          dealTypes[r.deal.type] = (dealTypes[r.deal.type] || 0) + 1;
        }
        if (r.deal?.venue?.type) {
          venueTypes[r.deal.venue.type] = (venueTypes[r.deal.venue.type] || 0) + 1;
        }
      });

      preferences.preferredDealTypes = Object.entries(dealTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type);

      preferences.preferredVenueTypes = Object.entries(venueTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type);
    }

    // Get available deals
    let dealsQuery = supabaseAdmin
      .from('deals')
      .select(`
        id,
        title,
        type,
        discount_type,
        discount_value,
        venue:venues(id, name, type, location)
      `)
      .eq('is_active', true)
      .lte('start_time', new Date().toISOString())
      .gte('end_time', new Date().toISOString())
      .limit(50);

    const { data: availableDeals } = await dealsQuery;

    if (!availableDeals || availableDeals.length === 0) {
      return res.json({ deals: [], message: 'No active deals available' });
    }

    // Get AI recommendations
    const location = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
    const recommendedIds = await getPersonalizedRecommendations(
      preferences,
      availableDeals,
      location
    );

    // Order deals by recommendation
    const orderedDeals = recommendedIds
      .map((id) => availableDeals.find((d) => d.id === id))
      .filter(Boolean)
      .slice(0, Number(limit));

    // Add any remaining deals not in recommendations
    const remainingDeals = availableDeals
      .filter((d) => !recommendedIds.includes(d.id))
      .slice(0, Number(limit) - orderedDeals.length);

    res.json({
      deals: [...orderedDeals, ...remainingDeals],
      preferences,
      totalAvailable: availableDeals.length,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * POST /api/ai/analyze-deal
 * Analyze a deal and provide improvement suggestions
 */
router.post('/analyze-deal', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { dealId } = req.body;

    if (!dealId) {
      return res.status(400).json({ error: 'Deal ID required' });
    }

    // Get deal details
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('deals')
      .select(`
        *,
        venue:venues(id, type, name, owner_id)
      `)
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Verify ownership
    if (deal.venue.owner_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get performance metrics
    const { data: redemptions } = await supabaseAdmin
      .from('redemptions')
      .select('id')
      .eq('deal_id', dealId);

    const redemptionCount = redemptions?.length || 0;
    const viewCount = deal.view_count || 0;
    const conversionRate = viewCount > 0 ? (redemptionCount / viewCount) * 100 : 0;

    // Generate analysis
    const analysis = {
      performance: {
        views: viewCount,
        redemptions: redemptionCount,
        conversionRate: conversionRate.toFixed(2) + '%',
        rating: conversionRate > 5 ? 'excellent' : conversionRate > 2 ? 'good' : 'needs improvement',
      },
      suggestions: [] as string[],
      optimizations: [] as { field: string; current: any; suggested: any; reason: string }[],
    };

    // Add suggestions based on performance
    if (conversionRate < 2) {
      analysis.suggestions.push('Consider increasing the discount value to attract more customers');
      analysis.suggestions.push('Add compelling images to your deal');
    }

    if (!deal.image_url) {
      analysis.suggestions.push('Deals with images get 3x more engagement');
    }

    if (deal.discount_value && deal.discount_value < 15) {
      analysis.optimizations.push({
        field: 'discount_value',
        current: deal.discount_value,
        suggested: 20,
        reason: 'Higher discounts typically see better redemption rates',
      });
    }

    res.json({ analysis, deal: { id: deal.id, title: deal.title } });
  } catch (error) {
    console.error('Deal analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze deal' });
  }
});

export default router;
