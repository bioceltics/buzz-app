import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user role from database
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: userData?.role || 'user',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export async function venueOwnerMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const venueId = req.params.venueId || req.params.id;

    if (!venueId) {
      return res.status(400).json({ error: 'Venue ID required' });
    }

    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('owner_id')
      .eq('id', venueId)
      .single();

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    if (venue.owner_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (error) {
    console.error('Venue owner middleware error:', error);
    res.status(500).json({ error: 'Authorization error' });
  }
}
