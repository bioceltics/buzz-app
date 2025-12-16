import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { sendNewMessageNotification } from '../services/push.js';

const router = Router();

// Get user's conversations
router.get('/conversations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        venue:venues(id, name, logo_url),
        messages:messages(
          id,
          content,
          sender_type,
          created_at,
          read_at
        )
      `)
      .eq('user_id', req.user!.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Add unread count and last message to each conversation
    const conversations = (data || []).map((conv: any) => {
      const messages = conv.messages || [];
      const unreadCount = messages.filter(
        (m: any) => m.sender_type === 'venue' && !m.read_at
      ).length;
      const lastMessage = messages[messages.length - 1] || null;

      return {
        ...conv,
        unread_count: unreadCount,
        last_message: lastMessage,
        messages: undefined, // Remove full messages array
      };
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get venue's conversations (for dashboard)
router.get('/venue/:venueId/conversations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { venueId } = req.params;

    // Verify venue ownership
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id')
      .eq('id', venueId)
      .eq('owner_id', req.user!.id)
      .single();

    if (!venue && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        user:users(id, full_name, avatar_url),
        messages:messages(
          id,
          content,
          sender_type,
          created_at,
          read_at
        )
      `)
      .eq('venue_id', venueId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const conversations = (data || []).map((conv: any) => {
      const messages = conv.messages || [];
      const unreadCount = messages.filter(
        (m: any) => m.sender_type === 'user' && !m.read_at
      ).length;
      const lastMessage = messages[messages.length - 1] || null;

      return {
        ...conv,
        unread_count: unreadCount,
        last_message: lastMessage,
        messages: undefined,
      };
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Get venue conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get or create conversation
router.post('/conversations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { venue_id } = req.body;

    // Check if conversation exists
    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('venue_id', venue_id)
      .single();

    if (existing) {
      return res.json({ conversation: existing });
    }

    // Create new conversation
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        user_id: req.user!.id,
        venue_id,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ conversation: data });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, before } = req.query;

    // Verify access
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('user_id, venue_id')
      .eq('id', id)
      .single();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if user is participant or venue owner
    const isUser = conversation.user_id === req.user!.id;
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id')
      .eq('id', conversation.venue_id)
      .eq('owner_id', req.user!.id)
      .single();

    if (!isUser && !venue && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let query = supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Mark messages as read
    const senderType = isUser ? 'venue' : 'user';
    await supabaseAdmin
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .eq('sender_type', senderType)
      .is('read_at', null);

    res.json({ messages: (data || []).reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message
router.post('/conversations/:id/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Verify access and get conversation
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('user_id, venue_id')
      .eq('id', id)
      .single();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isUser = conversation.user_id === req.user!.id;
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id')
      .eq('id', conversation.venue_id)
      .eq('owner_id', req.user!.id)
      .single();

    if (!isUser && !venue && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const senderType = isUser ? 'user' : 'venue';
    const senderId = isUser ? req.user!.id : venue?.id;

    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: id,
        sender_id: senderId,
        sender_type: senderType,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation updated_at
    await supabaseAdmin
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    // Send push notification to recipient
    try {
      if (isUser) {
        // User sent message, notify venue owner
        const { data: venueData } = await supabaseAdmin
          .from('venues')
          .select('owner_id, name')
          .eq('id', conversation.venue_id)
          .single();

        if (venueData?.owner_id) {
          const { data: owner } = await supabaseAdmin
            .from('users')
            .select('push_token, full_name')
            .eq('id', venueData.owner_id)
            .single();

          if (owner?.push_token) {
            const { data: sender } = await supabaseAdmin
              .from('users')
              .select('full_name')
              .eq('id', req.user!.id)
              .single();

            await sendNewMessageNotification(
              owner.push_token,
              sender?.full_name || 'A customer',
              content,
              id
            );
          }
        }
      } else {
        // Venue sent message, notify user
        const { data: recipient } = await supabaseAdmin
          .from('users')
          .select('push_token')
          .eq('id', conversation.user_id)
          .single();

        if (recipient?.push_token) {
          const { data: venueInfo } = await supabaseAdmin
            .from('venues')
            .select('name')
            .eq('id', conversation.venue_id)
            .single();

          await sendNewMessageNotification(
            recipient.push_token,
            venueInfo?.name || 'A venue',
            content,
            id
          );
        }
      }
    } catch (pushError) {
      console.error('Push notification error:', pushError);
      // Don't fail the request if push fails
    }

    res.status(201).json({ message: data });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
