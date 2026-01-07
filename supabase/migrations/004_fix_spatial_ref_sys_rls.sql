-- Fix RLS warning for spatial_ref_sys table
-- This table is part of PostGIS extension and needs RLS enabled

-- Enable RLS on spatial_ref_sys (PostGIS table)
ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Allow public read access (this is reference data)
CREATE POLICY IF NOT EXISTS "Anyone can view spatial reference systems"
  ON public.spatial_ref_sys FOR SELECT
  USING (TRUE);
