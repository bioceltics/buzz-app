import { Router } from 'express';
import { authMiddleware, venueOwnerMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import QRCode from 'qrcode';

const router = Router();

// Get active deals with filters
router.get('/', async (req, res) => {
  try {
    const { type, venue_id, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('deals')
      .select(`
        *,
        venue:venues(id, name, type, logo_url, address)
      `)
      .eq('is_active', true)
      .lte('start_time', new Date().toISOString())
      .gte('end_time', new Date().toISOString())
      .order('start_time')
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (venue_id) {
      query = query.eq('venue_id', venue_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ deals: data || [] });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ error: 'Failed to get deals' });
  }
});

// Get deal by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('deals')
      .select(`
        *,
        venue:venues(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Increment deal views
    await supabaseAdmin.rpc('increment_deal_views', { deal_id: id });

    res.json({ deal: data });
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({ error: 'Failed to get deal' });
  }
});

// Redeem a deal
router.post('/:id/redeem', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Get the deal
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('deals')
      .select('*')
      .eq('id', id)
      .single();

    if (dealError || !deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check if deal is active
    const now = new Date();
    if (!deal.is_active || new Date(deal.end_time) < now || new Date(deal.start_time) > now) {
      return res.status(400).json({ error: 'Deal is not currently active' });
    }

    // Check if max redemptions reached
    if (deal.max_redemptions && deal.redemption_count >= deal.max_redemptions) {
      return res.status(400).json({ error: 'Deal has reached maximum redemptions' });
    }

    // Check if user already redeemed
    const { data: existing } = await supabaseAdmin
      .from('redemptions')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('deal_id', id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'You have already redeemed this deal' });
    }

    // Create redemption
    const { data: redemption, error: redemptionError } = await supabaseAdmin
      .from('redemptions')
      .insert({
        user_id: req.user!.id,
        deal_id: id,
        venue_id: deal.venue_id,
      })
      .select()
      .single();

    if (redemptionError) throw redemptionError;

    // Increment redemption count
    await supabaseAdmin
      .from('deals')
      .update({ redemption_count: deal.redemption_count + 1 })
      .eq('id', id);

    res.json({ redemption, message: 'Deal redeemed successfully!' });
  } catch (error) {
    console.error('Redeem deal error:', error);
    res.status(500).json({ error: 'Failed to redeem deal' });
  }
});

// Create new deal (venue owner)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const dealData = req.body;

    // Verify user owns the venue
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id')
      .eq('id', dealData.venue_id)
      .eq('owner_id', req.user!.id)
      .single();

    if (!venue) {
      return res.status(403).json({ error: 'Not authorized to create deal for this venue' });
    }

    // Generate QR code
    const qrCodeData = `buzz://deal/${dealData.venue_id}`;
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

    const { data, error } = await supabaseAdmin
      .from('deals')
      .insert({
        ...dealData,
        qr_code_url: qrCodeUrl,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ deal: data });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Update deal (venue owner)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const { data: deal } = await supabaseAdmin
      .from('deals')
      .select('venue_id')
      .eq('id', id)
      .single();

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id')
      .eq('id', deal.venue_id)
      .eq('owner_id', req.user!.id)
      .single();

    if (!venue && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this deal' });
    }

    const { data, error } = await supabaseAdmin
      .from('deals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ deal: data });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// Delete deal (venue owner)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify ownership (same as update)
    const { data: deal } = await supabaseAdmin
      .from('deals')
      .select('venue_id')
      .eq('id', id)
      .single();

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id')
      .eq('id', deal.venue_id)
      .eq('owner_id', req.user!.id)
      .single();

    if (!venue && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this deal' });
    }

    const { error } = await supabaseAdmin.from('deals').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

export default router;
