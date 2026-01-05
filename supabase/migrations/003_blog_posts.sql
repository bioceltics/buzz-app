-- Blog Posts Schema
-- Migration for automated blog content system

-- ============================================================================
-- BLOG POSTS TABLE
-- ============================================================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT DEFAULT 'Buzzee Team',
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  is_auto_generated BOOLEAN DEFAULT FALSE,
  source_urls TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX blog_posts_slug_idx ON blog_posts (slug);
CREATE INDEX blog_posts_published_idx ON blog_posts (is_published, published_at DESC);
CREATE INDEX blog_posts_category_idx ON blog_posts (category);

-- ============================================================================
-- BLOG CATEGORIES TABLE (for organization)
-- ============================================================================
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Local Deals & Offers', 'deals-offers', 'Tips and insights on finding the best local deals'),
  ('Restaurant Guides', 'restaurant-guides', 'Reviews and guides for local restaurants'),
  ('Nightlife & Entertainment', 'nightlife', 'Best bars, clubs, and nightlife spots'),
  ('Food & Drink Trends', 'food-trends', 'Latest trends in food and beverages'),
  ('Business Tips', 'business-tips', 'Tips for venue owners and businesses'),
  ('City Guides', 'city-guides', 'Exploring cities and local hotspots'),
  ('Happy Hour Specials', 'happy-hour', 'Best happy hour deals and tips');

-- ============================================================================
-- BLOG GENERATION LOG TABLE (for tracking automated posts)
-- ============================================================================
CREATE TABLE blog_generation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX blog_generation_log_status_idx ON blog_generation_log (status, created_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for blog_posts
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_generation_log ENABLE ROW LEVEL SECURITY;

-- Blog posts policies (public read for published, admin write)
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Service role can manage all blog posts"
  ON blog_posts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Blog categories policies (public read)
CREATE POLICY "Anyone can view blog categories"
  ON blog_categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Service role can manage blog categories"
  ON blog_categories FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Generation log policies (admin only)
CREATE POLICY "Service role can manage generation logs"
  ON blog_generation_log FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- FUNCTION TO INCREMENT BLOG VIEW COUNT
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
