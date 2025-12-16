import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get upcoming events
router.get('/', async (req, res) => {
  try {
    const { type, venue_id, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('events')
      .select(`
        *,
        venue:venues(id, name, type, logo_url, address)
      `)
      .eq('is_active', true)
      .gte('start_time', new Date().toISOString())
      .order('start_time')
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (type) {
      query = query.eq('type', type);
    }

    if (venue_id) {
      query = query.eq('venue_id', venue_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ events: data || [] });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        venue:venues(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event: data });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// Create event (venue owner)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const eventData = req.body;

    // Verify user owns the venue
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id')
      .eq('id', eventData.venue_id)
      .eq('owner_id', req.user!.id)
      .single();

    if (!venue) {
      return res.status(403).json({ error: 'Not authorized to create event for this venue' });
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ event: data });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ event: data });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
