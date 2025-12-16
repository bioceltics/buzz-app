import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Note: Most auth is handled directly by Supabase on the client side
// These endpoints are for additional server-side auth needs

// Verify token and return user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get additional user data
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get user's venue if they own one
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        ...userData,
      },
      venue,
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
});

// Create or update user profile after signup
router.post('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { full_name, avatar_url } = req.body;

    const { data, error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        phone: user.phone,
        full_name,
        avatar_url,
        auth_provider: user.app_metadata?.provider || 'email',
      })
      .select()
      .single();

    if (upsertError) {
      throw upsertError;
    }

    res.json({ user: data });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
