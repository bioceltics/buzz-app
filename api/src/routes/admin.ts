import { Router } from 'express';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// All routes require admin access
router.use(authMiddleware, adminMiddleware);

// Get all venues (with filtering)
router.get('/venues', async (req: AuthRequest, res) => {
  try {
    const { status, type, search, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('venues')
      .select(`
        *,
        owner:users(id, email, full_name)
      `)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get counts by status
    const { data: counts } = await supabaseAdmin
      .from('venues')
      .select('status')
      .then(({ data }) => {
        const statusCounts = {
          pending: 0,
          approved: 0,
          rejected: 0,
          suspended: 0,
        };
        data?.forEach((v: any) => {
          if (statusCounts.hasOwnProperty(v.status)) {
            statusCounts[v.status as keyof typeof statusCounts]++;
          }
        });
        return { data: statusCounts };
      });

    res.json({ venues: data || [], counts });
  } catch (error) {
    console.error('Admin get venues error:', error);
    res.status(500).json({ error: 'Failed to get venues' });
  }
});

// Approve venue
router.post('/venues/:id/approve', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('venues')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: req.user!.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Send notification to venue owner

    res.json({ venue: data, message: 'Venue approved successfully' });
  } catch (error) {
    console.error('Approve venue error:', error);
    res.status(500).json({ error: 'Failed to approve venue' });
  }
});

// Reject venue
router.post('/venues/:id/reject', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabaseAdmin
      .from('venues')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
        rejected_by: req.user!.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Send notification to venue owner

    res.json({ venue: data, message: 'Venue rejected' });
  } catch (error) {
    console.error('Reject venue error:', error);
    res.status(500).json({ error: 'Failed to reject venue' });
  }
});

// Suspend venue
router.post('/venues/:id/suspend', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabaseAdmin
      .from('venues')
      .update({
        status: 'suspended',
        suspension_reason: reason,
        suspended_at: new Date().toISOString(),
        suspended_by: req.user!.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ venue: data, message: 'Venue suspended' });
  } catch (error) {
    console.error('Suspend venue error:', error);
    res.status(500).json({ error: 'Failed to suspend venue' });
  }
});

// Get all users
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ users: data || [] });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user role
router.put('/users/:id/role', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'venue_owner', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Suspend user
router.post('/users/:id/suspend', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        is_suspended: true,
        suspension_reason: reason,
        suspended_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ user: data, message: 'User suspended' });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

// Unsuspend user
router.post('/users/:id/unsuspend', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        is_suspended: false,
        suspension_reason: null,
        suspended_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ user: data, message: 'User unsuspended' });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ error: 'Failed to unsuspend user' });
  }
});

// Get platform analytics
router.get('/analytics', async (req: AuthRequest, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get user counts
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: newUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get venue counts
    const { count: totalVenues } = await supabaseAdmin
      .from('venues')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { count: pendingVenues } = await supabaseAdmin
      .from('venues')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get deal counts
    const { count: activeDeals } = await supabaseAdmin
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('end_time', new Date().toISOString());

    // Get redemption counts
    const { count: totalRedemptions } = await supabaseAdmin
      .from('redemptions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    res.json({
      analytics: {
        users: {
          total: totalUsers || 0,
          new: newUsers || 0,
        },
        venues: {
          total: totalVenues || 0,
          pending: pendingVenues || 0,
        },
        deals: {
          active: activeDeals || 0,
        },
        redemptions: {
          period: totalRedemptions || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get all deals (for moderation)
router.get('/deals', async (req: AuthRequest, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabaseAdmin
      .from('deals')
      .select(`
        *,
        venue:venues(id, name, type)
      `)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({ deals: data || [] });
  } catch (error) {
    console.error('Admin get deals error:', error);
    res.status(500).json({ error: 'Failed to get deals' });
  }
});

// Delete deal (admin override)
router.delete('/deals/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin.from('deals').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Deal deleted' });
  } catch (error) {
    console.error('Admin delete deal error:', error);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

// Get all reviews (for moderation)
router.get('/reviews', async (req: AuthRequest, res) => {
  try {
    const { reported, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('reviews')
      .select(`
        *,
        user:users(id, full_name, email),
        venue:venues(id, name)
      `)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (reported === 'true') {
      query = query.eq('is_reported', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ reviews: data || [] });
  } catch (error) {
    console.error('Admin get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Delete review (admin override)
router.delete('/reviews/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
