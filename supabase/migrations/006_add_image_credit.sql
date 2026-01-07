-- Add image_credit column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_credit TEXT;
