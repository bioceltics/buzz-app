import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get current user profile
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
router.put('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { full_name, avatar_url, notification_preferences } = req.body;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        full_name,
        avatar_url,
        notification_preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Update user location
router.put('/me/location', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { latitude, longitude } = req.body;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        location_lat: latitude,
        location_lng: longitude,
      })
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Update push token
router.put('/me/push-token', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { push_token } = req.body;

    const { error } = await supabaseAdmin
      .from('users')
      .update({ push_token })
      .eq('id', req.user!.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Update push token error:', error);
    res.status(500).json({ error: 'Failed to update push token' });
  }
});

// Delete user account
router.delete('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Delete from users table (cascades to related data)
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', req.user!.id);

    if (dbError) throw dbError;

    // Delete from auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      req.user!.id
    );

    if (authError) throw authError;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
