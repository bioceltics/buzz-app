import { Router } from 'express';
import { authMiddleware, venueOwnerMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

const router = Router();

// Generate a secure redemption code
function generateRedemptionCode(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

// Validate redemption code format
function isValidRedemptionCode(code: string): boolean {
  return /^[A-F0-9]{32}$/.test(code);
}

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

// Generate QR code for a deal (user requests to redeem)
router.post('/:id/generate-qr', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Get the deal
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('deals')
      .select('*, venue:venues(id, name)')
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

    // Check if user already redeemed today (for daily limits)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existingToday } = await supabaseAdmin
      .from('redemptions')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('deal_id', id)
      .gte('redeemed_at', today.toISOString())
      .single();

    if (existingToday) {
      return res.status(400).json({ error: 'You have already redeemed this deal today' });
    }

    // Generate a unique redemption code for this user/deal
    const redemptionCode = generateRedemptionCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Store pending redemption
    const { data: pendingRedemption, error: pendingError } = await supabaseAdmin
      .from('pending_redemptions')
      .insert({
        user_id: req.user!.id,
        deal_id: id,
        venue_id: deal.venue_id,
        redemption_code: redemptionCode,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (pendingError) {
      // If table doesn't exist, create inline redemption
      console.log('Pending redemptions table may not exist, using direct QR');
    }

    // Generate QR code with redemption data
    const qrData = JSON.stringify({
      type: 'buzz_deal',
      dealId: id,
      venueId: deal.venue_id,
      userId: req.user!.id,
      code: redemptionCode,
      expiresAt: expiresAt.toISOString(),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    res.json({
      qrCode: qrCodeDataUrl,
      redemptionCode,
      expiresAt: expiresAt.toISOString(),
      deal: {
        id: deal.id,
        title: deal.title,
        venue: deal.venue,
      },
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Verify and complete deal redemption (venue scans QR code)
router.post('/:id/verify', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { redemptionCode, userId } = req.body;

    if (!redemptionCode) {
      return res.status(400).json({ error: 'Redemption code is required' });
    }

    // Get the deal and verify venue ownership
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('deals')
      .select('*, venue:venues(*)')
      .eq('id', id)
      .single();

    if (dealError || !deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check if user is venue owner or staff
    const isVenueOwner = deal.venue.owner_id === req.user!.id;
    const isAdmin = req.user?.role === 'admin';

    // TODO: Add staff verification when staff table is implemented
    if (!isVenueOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to verify redemptions for this venue' });
    }

    // Check if deal is active
    const now = new Date();
    if (!deal.is_active || new Date(deal.end_time) < now || new Date(deal.start_time) > now) {
      return res.status(400).json({ error: 'Deal is not currently active', status: 'expired' });
    }

    // Check if max redemptions reached
    if (deal.max_redemptions && deal.redemption_count >= deal.max_redemptions) {
      return res.status(400).json({ error: 'Deal has reached maximum redemptions', status: 'limit_reached' });
    }

    // Verify the redemption code (check pending_redemptions if exists)
    const { data: pendingRedemption } = await supabaseAdmin
      .from('pending_redemptions')
      .select('*')
      .eq('deal_id', id)
      .eq('redemption_code', redemptionCode)
      .eq('used', false)
      .single();

    let redeemerUserId = userId;

    if (pendingRedemption) {
      // Check if expired
      if (new Date(pendingRedemption.expires_at) < now) {
        return res.status(400).json({ error: 'Redemption code has expired', status: 'code_expired' });
      }
      redeemerUserId = pendingRedemption.user_id;

      // Mark pending redemption as used
      await supabaseAdmin
        .from('pending_redemptions')
        .update({ used: true })
        .eq('id', pendingRedemption.id);
    }

    if (!redeemerUserId) {
      return res.status(400).json({ error: 'Invalid redemption code', status: 'invalid_code' });
    }

    // Check if user already redeemed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existingRedemption } = await supabaseAdmin
      .from('redemptions')
      .select('id')
      .eq('user_id', redeemerUserId)
      .eq('deal_id', id)
      .gte('redeemed_at', today.toISOString())
      .single();

    if (existingRedemption) {
      return res.status(400).json({ error: 'User has already redeemed this deal today', status: 'already_redeemed' });
    }

    // Create the redemption record
    const { data: redemption, error: redemptionError } = await supabaseAdmin
      .from('redemptions')
      .insert({
        user_id: redeemerUserId,
        deal_id: id,
        venue_id: deal.venue_id,
        verified_by: req.user!.id,
        redemption_code: redemptionCode,
      })
      .select()
      .single();

    if (redemptionError) throw redemptionError;

    // Increment redemption count
    await supabaseAdmin
      .from('deals')
      .update({ redemption_count: (deal.redemption_count || 0) + 1 })
      .eq('id', id);

    // Get user details for confirmation
    const { data: redeemer } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .eq('id', redeemerUserId)
      .single();

    res.json({
      success: true,
      status: 'verified',
      message: 'Deal redeemed successfully!',
      redemption: {
        id: redemption.id,
        deal: {
          id: deal.id,
          title: deal.title,
          discount_type: deal.discount_type,
          discount_value: deal.discount_value,
        },
        user: redeemer ? {
          name: redeemer.full_name,
          email: redeemer.email,
        } : null,
        redeemed_at: redemption.redeemed_at,
      },
    });
  } catch (error) {
    console.error('Verify redemption error:', error);
    res.status(500).json({ error: 'Failed to verify redemption' });
  }
});

// Redeem a deal (legacy endpoint - direct redemption without QR)
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

    // Check if user already redeemed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existing } = await supabaseAdmin
      .from('redemptions')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('deal_id', id)
      .gte('redeemed_at', today.toISOString())
      .single();

    if (existing) {
      return res.status(400).json({ error: 'You have already redeemed this deal today' });
    }

    // Create redemption
    const redemptionCode = generateRedemptionCode();
    const { data: redemption, error: redemptionError } = await supabaseAdmin
      .from('redemptions')
      .insert({
        user_id: req.user!.id,
        deal_id: id,
        venue_id: deal.venue_id,
        redemption_code: redemptionCode,
      })
      .select()
      .single();

    if (redemptionError) throw redemptionError;

    // Increment redemption count
    await supabaseAdmin
      .from('deals')
      .update({ redemption_count: (deal.redemption_count || 0) + 1 })
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
