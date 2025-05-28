-- Fix for Long Titles and Enhanced Content Support
-- Copy and paste this into your Supabase SQL Editor

-- Remove any length constraints on title
ALTER TABLE public.posts 
ALTER COLUMN title TYPE TEXT;

-- Ensure slug can handle longer generated slugs
ALTER TABLE public.posts 
ALTER COLUMN slug TYPE TEXT;

-- Update the unique constraint to handle longer slugs
DROP INDEX IF EXISTS posts_slug_key;
CREATE UNIQUE INDEX posts_slug_unique_idx ON public.posts(slug);

-- Add better indexing for long titles
CREATE INDEX IF NOT EXISTS posts_title_search_idx ON public.posts 
USING gin(to_tsvector('english', title));

-- Update the create post function to handle long titles
CREATE OR REPLACE FUNCTION create_post_with_long_title(
  p_title TEXT,
  p_content TEXT,
  p_excerpt TEXT,
  p_slug TEXT,
  p_is_premium BOOLEAN,
  p_published BOOLEAN,
  p_author_id UUID,
  p_author_email TEXT,
  p_author_name TEXT
) RETURNS UUID AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 1;
  new_post_id UUID;
  base_slug TEXT;
BEGIN
  -- Handle long titles by creating a reasonable slug
  base_slug := p_slug;
  
  -- If slug is too long, truncate it
  IF length(base_slug) > 100 THEN
    base_slug := left(base_slug, 100);
  END IF;
  
  -- Remove trailing hyphens
  base_slug := rtrim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Ensure slug is unique
  WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  -- Insert the post
  INSERT INTO public.posts (
    title, content, excerpt, slug, is_premium, published,
    author_id, author_email, author_name
  ) VALUES (
    p_title, p_content, p_excerpt, final_slug, p_is_premium, p_published,
    p_author_id, p_author_email, p_author_name
  ) RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_post_with_long_title TO authenticated;
