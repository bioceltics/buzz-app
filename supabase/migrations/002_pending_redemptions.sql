-- Migration: Add pending_redemptions table and update redemptions
-- This supports the QR code verification flow

-- ============================================================================
-- PENDING REDEMPTIONS TABLE (for QR code flow)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pending_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  redemption_code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX pending_redemptions_code_idx ON pending_redemptions (redemption_code);
CREATE INDEX pending_redemptions_deal_idx ON pending_redemptions (deal_id);
CREATE INDEX pending_redemptions_user_idx ON pending_redemptions (user_id);
CREATE INDEX pending_redemptions_expires_idx ON pending_redemptions (expires_at);

-- Add cleanup function for expired pending redemptions
CREATE OR REPLACE FUNCTION cleanup_expired_pending_redemptions()
RETURNS void AS $$
BEGIN
  DELETE FROM pending_redemptions
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATE REDEMPTIONS TABLE
-- ============================================================================
-- Remove unique constraint on user_id, deal_id to allow daily redemptions
ALTER TABLE redemptions DROP CONSTRAINT IF EXISTS redemptions_user_id_deal_id_key;

-- Add new columns to redemptions table
ALTER TABLE redemptions
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS redemption_code TEXT;

-- Add default value for redeemed_at if it's null
UPDATE redemptions SET redeemed_at = created_at WHERE redeemed_at IS NULL;
ALTER TABLE redemptions ALTER COLUMN redeemed_at SET DEFAULT NOW();

-- Create index for daily redemption checks
CREATE INDEX IF NOT EXISTS redemptions_user_deal_date_idx
  ON redemptions (user_id, deal_id, DATE(redeemed_at));

-- ============================================================================
-- FUNCTION: Increment deal views (if not exists)
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_deal_views(deal_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE deals SET view_count = COALESCE(view_count, 0) + 1 WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get nearby venues with active deals
-- ============================================================================
CREATE OR REPLACE FUNCTION get_nearby_venues_with_deals(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  venue_id UUID,
  venue_name TEXT,
  venue_type venue_type,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_meters DOUBLE PRECISION,
  active_deal_count BIGINT,
  rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id as venue_id,
    v.name as venue_name,
    v.type as venue_type,
    ST_Y(v.location::geometry) as latitude,
    ST_X(v.location::geometry) as longitude,
    ST_Distance(
      v.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters,
    COUNT(d.id) as active_deal_count,
    v.rating
  FROM venues v
  LEFT JOIN deals d ON d.venue_id = v.id
    AND d.is_active = true
    AND d.start_time <= NOW()
    AND d.end_time >= NOW()
  WHERE v.status = 'approved'
    AND ST_DWithin(
      v.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  GROUP BY v.id
  ORDER BY distance_meters ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
