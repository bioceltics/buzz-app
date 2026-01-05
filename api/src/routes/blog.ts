import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { blogScheduler } from '../services/blogScheduler.js';
import { generateAndSavePost, fetchTrendingTopics } from '../services/blogGenerator.js';

const router = Router();

/**
 * GET /api/blog/posts
 * Get all published blog posts (paginated)
 */
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image, author, category, tags, published_at, view_count', { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Blog posts fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch blog posts' });
    }

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Blog posts error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

/**
 * GET /api/blog/posts/:slug
 * Get a single blog post by slug
 */
router.get('/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Increment view count asynchronously (fire and forget)
    try {
      supabaseAdmin.rpc('increment_blog_views', { p_post_id: post.id });
    } catch (e) {
      // Ignore view count errors
    }

    res.json({ post });
  } catch (error) {
    console.error('Blog post fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

/**
 * GET /api/blog/categories
 * Get all blog categories
 */
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('blog_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Categories fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    res.json({ categories });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/blog/featured
 * Get featured/latest blog posts for homepage
 */
router.get('/featured', async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image, category, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error('Featured posts fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch featured posts' });
    }

    res.json({ posts });
  } catch (error) {
    console.error('Featured posts error:', error);
    res.status(500).json({ error: 'Failed to fetch featured posts' });
  }
});

/**
 * POST /api/blog/posts (Admin only)
 * Create a new blog post manually
 */
router.post('/posts', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      author,
      category,
      tags,
      meta_title,
      meta_description,
      is_published,
    } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content are required' });
    }

    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title,
        slug,
        excerpt,
        content,
        featured_image,
        author: author || 'Buzzee Team',
        category: category || 'general',
        tags: tags || [],
        meta_title,
        meta_description,
        is_published: is_published || false,
        published_at: is_published ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      return res.status(500).json({ error: 'Failed to create blog post' });
    }

    res.status(201).json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

/**
 * PUT /api/blog/posts/:id (Admin only)
 * Update a blog post
 */
router.put('/posts/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const updates = req.body;

    // If publishing for first time, set published_at
    if (updates.is_published && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update post error:', error);
      return res.status(500).json({ error: 'Failed to update blog post' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

/**
 * DELETE /api/blog/posts/:id (Admin only)
 * Delete a blog post
 */
router.delete('/posts/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete post error:', error);
      return res.status(500).json({ error: 'Failed to delete blog post' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

/**
 * GET /api/blog/related/:slug
 * Get related posts based on category and tags
 */
router.get('/related/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 3 } = req.query;

    // First get the current post to find its category and tags
    const { data: currentPost } = await supabaseAdmin
      .from('blog_posts')
      .select('id, category, tags')
      .eq('slug', slug)
      .single();

    if (!currentPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Find related posts in same category
    const { data: relatedPosts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image, category, published_at')
      .eq('is_published', true)
      .eq('category', currentPost.category)
      .neq('id', currentPost.id)
      .order('published_at', { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error('Related posts error:', error);
      return res.status(500).json({ error: 'Failed to fetch related posts' });
    }

    res.json({ posts: relatedPosts });
  } catch (error) {
    console.error('Related posts error:', error);
    res.status(500).json({ error: 'Failed to fetch related posts' });
  }
});

// ============================================================================
// ADMIN AUTOMATION ENDPOINTS
// ============================================================================

/**
 * GET /api/blog/scheduler/status (Admin only)
 * Get scheduler status and stats
 */
router.get('/scheduler/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const status = blogScheduler.getStatus();
    const stats = await blogScheduler.getStats();

    res.json({ status, stats });
  } catch (error) {
    console.error('Scheduler status error:', error);
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
});

/**
 * POST /api/blog/scheduler/start (Admin only)
 * Start the blog scheduler
 */
router.post('/scheduler/start', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    blogScheduler.start();
    res.json({ success: true, message: 'Scheduler started' });
  } catch (error) {
    console.error('Scheduler start error:', error);
    res.status(500).json({ error: 'Failed to start scheduler' });
  }
});

/**
 * POST /api/blog/scheduler/stop (Admin only)
 * Stop the blog scheduler
 */
router.post('/scheduler/stop', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    blogScheduler.stop();
    res.json({ success: true, message: 'Scheduler stopped' });
  } catch (error) {
    console.error('Scheduler stop error:', error);
    res.status(500).json({ error: 'Failed to stop scheduler' });
  }
});

/**
 * POST /api/blog/scheduler/run-now (Admin only)
 * Manually trigger blog generation
 */
router.post('/scheduler/run-now', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Run in background, don't wait for completion
    blogScheduler.runDailyGeneration().catch(console.error);

    res.json({ success: true, message: 'Blog generation started in background' });
  } catch (error) {
    console.error('Manual generation error:', error);
    res.status(500).json({ error: 'Failed to trigger generation' });
  }
});

/**
 * POST /api/blog/generate (Admin only)
 * Generate a single blog post with optional topic
 */
router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { topic, category, autoPublish = true } = req.body;

    const result = await generateAndSavePost(topic, category, autoPublish);

    if (result.success) {
      res.json({ success: true, post: result.post });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Generate post error:', error);
    res.status(500).json({ error: 'Failed to generate post' });
  }
});

/**
 * GET /api/blog/trending-topics (Admin only)
 * Get current trending topics for blog generation
 */
router.get('/trending-topics', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const topics = await fetchTrendingTopics();
    res.json({ topics });
  } catch (error) {
    console.error('Trending topics error:', error);
    res.status(500).json({ error: 'Failed to fetch trending topics' });
  }
});

/**
 * PUT /api/blog/scheduler/config (Admin only)
 * Update scheduler configuration
 */
router.put('/scheduler/config', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { enabled, postsPerDay, cronSchedule, timezone } = req.body;

    blogScheduler.updateConfig({
      ...(enabled !== undefined && { enabled }),
      ...(postsPerDay !== undefined && { postsPerDay }),
      ...(cronSchedule !== undefined && { cronSchedule }),
      ...(timezone !== undefined && { timezone }),
    });

    res.json({ success: true, status: blogScheduler.getStatus() });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

/**
 * GET /api/blog/test-ai
 * Test if AI generation is working using fetch directly
 */
router.get('/test-ai', async (req, res) => {
  try {
    const hasKey = !!process.env.GROQ_API_KEY;
    const keyPrefix = process.env.GROQ_API_KEY?.substring(0, 10) || 'not set';

    if (!hasKey) {
      return res.json({ error: 'GROQ_API_KEY not set', keyPrefix });
    }

    // Test with the SAME model used in blogGenerator
    const model = 'llama-3.3-70b-versatile';

    const prompt = `Write a short 200-word blog post about "Best Happy Hour Tips".

Return ONLY valid JSON (no markdown) with this structure:
{
  "title": "Short catchy title",
  "content": "<p>Your content here with HTML tags</p>",
  "excerpt": "Short summary"
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: 'You are a blog writer. Return only valid JSON, no markdown code blocks.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data: any = await response.json();

    if (!response.ok) {
      return res.json({ error: 'API error', status: response.status, model, data });
    }

    const content = data.choices?.[0]?.message?.content;

    // Try to parse JSON
    let parsed = null;
    try {
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e: any) {
      return res.json({ success: false, parseError: e.message, model, rawContent: content?.substring(0, 1000) });
    }

    res.json({ success: true, keyPrefix, model, parsed, rawContentLength: content?.length });
  } catch (error: any) {
    res.json({ error: error.message, stack: error.stack?.substring(0, 500) });
  }
});

/**
 * GET /api/blog/debug-generate
 * Debug endpoint to test blog generation with full logging
 */
router.get('/debug-generate', async (req, res) => {
  try {
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;

    // Capture all console output
    console.log = (...args) => {
      logs.push('[LOG] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      originalLog.apply(console, args);
    };
    console.error = (...args) => {
      logs.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      originalError.apply(console, args);
    };

    const result = await generateAndSavePost('Best Happy Hour Tips', 'happy-hour', true);

    // Restore console
    console.log = originalLog;
    console.error = originalError;

    res.json({
      result,
      logs,
      envCheck: {
        hasGroqKey: !!process.env.GROQ_API_KEY,
        groqKeyPrefix: process.env.GROQ_API_KEY?.substring(0, 10) || 'not set',
        hasUnsplashKey: !!process.env.UNSPLASH_ACCESS_KEY,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message, stack: error.stack?.substring(0, 1000) });
  }
});

/**
 * GET /api/blog/cron/generate
 * Vercel Cron endpoint for automated daily blog generation
 * This is called by Vercel Cron at 9 AM daily
 */
router.get('/cron/generate', async (req, res) => {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Cron job triggered: generating daily blog post');

    const result = await generateAndSavePost(undefined, undefined, true);

    if (result.success) {
      console.log('Blog post generated successfully:', result.post?.title);
      res.json({ success: true, post: { id: result.post?.id, title: result.post?.title } });
    } else {
      console.error('Blog generation failed:', result.error);
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Cron generation error:', error);
    res.status(500).json({ error: 'Failed to generate blog post' });
  }
});

export default router;
