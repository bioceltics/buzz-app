-- Buzz Database Schema
-- Initial migration for Supabase

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom types
CREATE TYPE user_role AS ENUM ('user', 'venue_owner', 'admin');
CREATE TYPE venue_type AS ENUM ('restaurant', 'bar', 'club', 'hotel', 'cafe', 'lounge');
CREATE TYPE venue_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE deal_type AS ENUM ('happy_hour', 'flash_deal', 'daily_special', 'event_special', 'recurring');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed', 'bogo', 'free_item');
CREATE TYPE event_type AS ENUM ('live_music', 'dj', 'comedy', 'trivia', 'sports', 'themed', 'special', 'other');
CREATE TYPE sender_type AS ENUM ('user', 'venue');
CREATE TYPE notification_type AS ENUM ('deal_nearby', 'deal_expiring', 'event_reminder', 'new_message', 'venue_approved', 'venue_rejected', 'review_response', 'promo', 'system');

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  location GEOGRAPHY(POINT, 4326),
  push_token TEXT,
  notification_preferences JSONB DEFAULT '{"deals": true, "events": true, "messages": true, "nearby_alerts": true, "marketing": true}'::jsonb,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VENUES TABLE
-- ============================================================================
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type venue_type NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Canada',
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  images TEXT[] DEFAULT '{}',
  hours JSONB,
  amenities TEXT[] DEFAULT '{}',
  price_range INTEGER DEFAULT 2 CHECK (price_range >= 1 AND price_range <= 4),
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status venue_status DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT FALSE,
  profile_views INTEGER DEFAULT 0,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES users(id),
  suspended_at TIMESTAMPTZ,
  suspended_by UUID REFERENCES users(id),
  suspension_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for geospatial queries
CREATE INDEX venues_location_idx ON venues USING GIST (location);
CREATE INDEX venues_status_idx ON venues (status);
CREATE INDEX venues_type_idx ON venues (type);
CREATE INDEX venues_owner_idx ON venues (owner_id);

-- ============================================================================
-- DEALS TABLE
-- ============================================================================
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type deal_type NOT NULL,
  discount_type discount_type NOT NULL,
  discount_value NUMERIC(10,2),
  original_price NUMERIC(10,2),
  discounted_price NUMERIC(10,2),
  terms TEXT,
  image_url TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_redemptions INTEGER,
  redemption_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  qr_code_url TEXT,
  recurring_days INTEGER[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX deals_venue_idx ON deals (venue_id);
CREATE INDEX deals_active_idx ON deals (is_active, start_time, end_time);
CREATE INDEX deals_type_idx ON deals (type);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type event_type NOT NULL,
  image_url TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  cover_charge NUMERIC(10,2),
  is_free BOOLEAN DEFAULT TRUE,
  age_restriction INTEGER,
  dress_code TEXT,
  capacity INTEGER,
  rsvp_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX events_venue_idx ON events (venue_id);
CREATE INDEX events_active_idx ON events (is_active, start_time);
CREATE INDEX events_type_idx ON events (type);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  is_verified_visit BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

CREATE INDEX reviews_venue_idx ON reviews (venue_id);
CREATE INDEX reviews_user_idx ON reviews (user_id);

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

CREATE INDEX favorites_user_idx ON favorites (user_id);

-- ============================================================================
-- REDEMPTIONS TABLE
-- ============================================================================
CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, deal_id)
);

CREATE INDEX redemptions_user_idx ON redemptions (user_id);
CREATE INDEX redemptions_deal_idx ON redemptions (deal_id);
CREATE INDEX redemptions_venue_idx ON redemptions (venue_id);

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

CREATE INDEX conversations_user_idx ON conversations (user_id);
CREATE INDEX conversations_venue_idx ON conversations (venue_id);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type sender_type NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX messages_conversation_idx ON messages (conversation_id, created_at);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX notifications_user_idx ON notifications (user_id, is_read, created_at);

-- ============================================================================
-- VENUE ANALYTICS TABLE
-- ============================================================================
CREATE TABLE venue_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  profile_views INTEGER DEFAULT 0,
  deal_views INTEGER DEFAULT 0,
  deal_redemptions INTEGER DEFAULT 0,
  favorites_added INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  UNIQUE(venue_id, date)
);

CREATE INDEX venue_analytics_venue_date_idx ON venue_analytics (venue_id, date);

-- ============================================================================
-- EVENT RSVPS TABLE
-- ============================================================================
CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

CREATE INDEX event_rsvps_event_idx ON event_rsvps (event_id);

-- ============================================================================
-- SUBSCRIPTIONS TABLE (for future premium features)
-- ============================================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX subscriptions_venue_idx ON subscriptions (venue_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get nearby venues
CREATE OR REPLACE FUNCTION get_nearby_venues(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  name TEXT,
  slug TEXT,
  type venue_type,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  images TEXT[],
  hours JSONB,
  amenities TEXT[],
  price_range INTEGER,
  rating NUMERIC,
  review_count INTEGER,
  status venue_status,
  is_featured BOOLEAN,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.owner_id,
    v.name,
    v.slug,
    v.type,
    v.description,
    v.address,
    v.city,
    v.province,
    v.postal_code,
    v.country,
    ST_Y(v.location::geometry) as latitude,
    ST_X(v.location::geometry) as longitude,
    v.phone,
    v.email,
    v.website,
    v.logo_url,
    v.cover_image_url,
    v.images,
    v.hours,
    v.amenities,
    v.price_range,
    v.rating,
    v.review_count,
    v.status,
    v.is_featured,
    ST_Distance(
      v.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance
  FROM venues v
  WHERE v.status = 'approved'
    AND ST_DWithin(
      v.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- Function to increment venue views
CREATE OR REPLACE FUNCTION increment_venue_views(venue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE venues SET profile_views = profile_views + 1 WHERE id = venue_id;

  INSERT INTO venue_analytics (venue_id, date, profile_views)
  VALUES (venue_id, CURRENT_DATE, 1)
  ON CONFLICT (venue_id, date)
  DO UPDATE SET profile_views = venue_analytics.profile_views + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to increment deal views
CREATE OR REPLACE FUNCTION increment_deal_views(deal_id UUID)
RETURNS VOID AS $$
DECLARE
  v_id UUID;
BEGIN
  UPDATE deals SET view_count = view_count + 1 WHERE id = deal_id RETURNING venue_id INTO v_id;

  INSERT INTO venue_analytics (venue_id, date, deal_views)
  VALUES (v_id, CURRENT_DATE, 1)
  ON CONFLICT (venue_id, date)
  DO UPDATE SET deal_views = venue_analytics.deal_views + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to increment helpful count on reviews
CREATE OR REPLACE FUNCTION increment_helpful_count(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for users
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for venues
CREATE TRIGGER venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for deals
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for events
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for reviews
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for conversations
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for subscriptions
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage all users"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Venues policies
CREATE POLICY "Anyone can view approved venues"
  ON venues FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Owners can view their own venues"
  ON venues FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can update their own venues"
  ON venues FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create venues"
  ON venues FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage all venues"
  ON venues FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Deals policies
CREATE POLICY "Anyone can view active deals"
  ON deals FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Venue owners can manage their deals"
  ON deals FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all deals"
  ON deals FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Events policies
CREATE POLICY "Anyone can view active events"
  ON events FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Venue owners can manage their events"
  ON events FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all events"
  ON events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all reviews"
  ON reviews FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own favorites"
  ON favorites FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all favorites"
  ON favorites FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Redemptions policies
CREATE POLICY "Users can view their own redemptions"
  ON redemptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Venue owners can view their venue redemptions"
  ON redemptions FOR SELECT
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create redemptions"
  ON redemptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all redemptions"
  ON redemptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Venue owners can view their venue conversations"
  ON conversations FOR SELECT
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all conversations"
  ON conversations FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Messages policies
CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
      UNION
      SELECT c.id FROM conversations c
      JOIN venues v ON c.venue_id = v.id
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
      UNION
      SELECT c.id FROM conversations c
      JOIN venues v ON c.venue_id = v.id
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all messages"
  ON messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all notifications"
  ON notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Venue analytics policies
CREATE POLICY "Venue owners can view their analytics"
  ON venue_analytics FOR SELECT
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all analytics"
  ON venue_analytics FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Event RSVPs policies
CREATE POLICY "Anyone can view event RSVPs count"
  ON event_rsvps FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can manage their own RSVPs"
  ON event_rsvps FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all RSVPs"
  ON event_rsvps FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Subscriptions policies
CREATE POLICY "Venue owners can view their subscriptions"
  ON subscriptions FOR SELECT
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- REALTIME
-- ============================================================================

-- Enable realtime for messages (for live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
