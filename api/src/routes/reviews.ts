import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get reviews for a venue
router.get('/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        user:users(id, full_name, avatar_url)
      `)
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({ reviews: data || [] });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Create review
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { venue_id, rating, comment, images } = req.body;

    // Check if user has redeemed a deal at this venue (verified visit)
    const { data: redemption } = await supabaseAdmin
      .from('redemptions')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('venue_id', venue_id)
      .limit(1)
      .single();

    const isVerifiedVisit = !!redemption;

    // Check if user already reviewed this venue
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('venue_id', venue_id)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this venue' });
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        user_id: req.user!.id,
        venue_id,
        rating,
        comment,
        images,
        is_verified_visit: isVerifiedVisit,
      })
      .select(`
        *,
        user:users(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Update venue rating (could also be done via database trigger)
    await updateVenueRating(venue_id);

    res.status(201).json({ review: data });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update review
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;

    // Verify ownership
    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('user_id, venue_id')
      .eq('id', id)
      .single();

    if (!review || review.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({
        rating,
        comment,
        images,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update venue rating
    await updateVenueRating(review.venue_id);

    res.json({ review: data });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('user_id, venue_id')
      .eq('id', id)
      .single();

    if (!review || review.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);

    if (error) throw error;

    // Update venue rating
    await updateVenueRating(review.venue_id);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Mark review as helpful
router.post('/:id/helpful', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin.rpc('increment_helpful_count', {
      review_id: id,
    });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ error: 'Failed to mark as helpful' });
  }
});

// Helper function to update venue rating
async function updateVenueRating(venueId: string) {
  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('venue_id', venueId);

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await supabaseAdmin
      .from('venues')
      .update({
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviews.length,
      })
      .eq('id', venueId);
  }
}

export default router;
