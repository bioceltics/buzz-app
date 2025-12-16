import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get user's favorites
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select(`
        *,
        venue:venues(*)
      `)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ favorites: data || [] });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Add to favorites
router.post('/:venueId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { venueId } = req.params;

    // Check if already favorited
    const { data: existing } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('venue_id', venueId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already in favorites' });
    }

    const { data, error } = await supabaseAdmin
      .from('favorites')
      .insert({
        user_id: req.user!.id,
        venue_id: venueId,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ favorite: data });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove from favorites
router.delete('/:venueId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { venueId } = req.params;

    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('venue_id', venueId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Check if venue is favorited
router.get('/check/:venueId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { venueId } = req.params;

    const { data } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('venue_id', venueId)
      .single();

    res.json({ isFavorite: !!data });
  } catch (error) {
    res.json({ isFavorite: false });
  }
});

export default router;
