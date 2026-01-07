-- Fix Security Warnings
-- Migration to address Supabase linter security warnings

-- ============================================================================
-- FIX 1: Function Search Path Mutable
-- Set search_path for functions to prevent search path injection attacks
-- ============================================================================

-- Fix update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix increment_blog_views function
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$;

-- ============================================================================
-- FIX 2: RLS Policies - Make service role policies more specific
-- The current policies use auth.jwt() which doesn't work for service role
-- Service role bypasses RLS by default, so we need different approach
-- ============================================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Service role can manage all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Service role can manage blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Service role can manage generation logs" ON public.blog_generation_log;

-- For blog_posts: Allow authenticated users with admin role to manage
-- Service role automatically bypasses RLS, so no policy needed for it
CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- For blog_categories: Same approach
CREATE POLICY "Admins can manage blog categories"
  ON public.blog_categories FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- For blog_generation_log: Only service role should access this (which bypasses RLS)
-- No public policy needed - service role handles all operations
CREATE POLICY "Admins can view generation logs"
  ON public.blog_generation_log FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- NOTE: Extension in Public (postgis)
-- This requires moving the extension to a different schema, which is complex
-- and may break existing functionality. This is a low-risk warning.
-- Recommendation: Create an 'extensions' schema for future extensions
-- ============================================================================

-- Create extensions schema for future use (optional, doesn't move postgis)
CREATE SCHEMA IF NOT EXISTS extensions;

-- ============================================================================
-- NOTE: Leaked Password Protection
-- This is an Auth setting that needs to be enabled in the Supabase Dashboard:
-- Authentication > Settings > Enable "Leaked password protection"
-- ============================================================================
