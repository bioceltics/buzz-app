import { Router } from 'express';
import { authMiddleware, venueOwnerMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get all approved venues with filters
router.get('/', async (req, res) => {
  try {
    const { type, search, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('venues')
      .select('*')
      .eq('status', 'approved')
      .order('name')
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ venues: data });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ error: 'Failed to get venues' });
  }
});

// Get nearby venues
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    // Using PostGIS ST_DWithin for proximity search
    let query = supabaseAdmin.rpc('get_nearby_venues', {
      user_lat: Number(lat),
      user_lng: Number(lng),
      radius_meters: Number(radius),
    });

    const { data, error } = await query;

    if (error) throw error;

    // Filter by type if specified
    let venues = data || [];
    if (type && type !== 'all') {
      venues = venues.filter((v: any) => v.type === type);
    }

    res.json({ venues });
  } catch (error) {
    console.error('Get nearby venues error:', error);
    res.status(500).json({ error: 'Failed to get nearby venues' });
  }
});

// Get venue by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Increment profile views
    await supabaseAdmin.rpc('increment_venue_views', { venue_id: id });

    res.json({ venue: data });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({ error: 'Failed to get venue' });
  }
});

// Get venue's active deals
router.get('/:id/deals', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('deals')
      .select('*')
      .eq('venue_id', id)
      .eq('is_active', true)
      .gte('end_time', new Date().toISOString())
      .order('start_time');

    if (error) throw error;

    res.json({ deals: data || [] });
  } catch (error) {
    console.error('Get venue deals error:', error);
    res.status(500).json({ error: 'Failed to get deals' });
  }
});

// Get venue's events
router.get('/:id/events', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('venue_id', id)
      .eq('is_active', true)
      .gte('start_time', new Date().toISOString())
      .order('start_time');

    if (error) throw error;

    res.json({ events: data || [] });
  } catch (error) {
    console.error('Get venue events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Get venue's reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        user:users(id, full_name, avatar_url)
      `)
      .eq('venue_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ reviews: data || [] });
  } catch (error) {
    console.error('Get venue reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Create new venue (requires auth)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const venueData = req.body;

    // Generate slug from name
    const slug = venueData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabaseAdmin
      .from('venues')
      .insert({
        ...venueData,
        slug,
        owner_id: req.user!.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ venue: data });
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({ error: 'Failed to create venue' });
  }
});

// Update venue (owner only)
router.put('/:id', authMiddleware, venueOwnerMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('venues')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ venue: data });
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({ error: 'Failed to update venue' });
  }
});

// Get venue analytics (owner only)
router.get('/:id/analytics', authMiddleware, venueOwnerMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const { data, error } = await supabaseAdmin
      .from('venue_analytics')
      .select('*')
      .eq('venue_id', id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date');

    if (error) throw error;

    res.json({ analytics: data || [] });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router;
