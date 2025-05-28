-- Improved Database Schema for Better Performance with Long Content
-- Copy and paste this into your Supabase SQL Editor

-- First, let's make sure the posts table can handle long content
ALTER TABLE public.posts 
ALTER COLUMN content TYPE TEXT;

-- Add an index for better search performance
CREATE INDEX IF NOT EXISTS posts_content_search_idx ON public.posts 
USING gin(to_tsvector('english', title || ' ' || content));

-- Add an index for better filtering
CREATE INDEX IF NOT EXISTS posts_author_published_idx ON public.posts(author_id, published);

-- Update the RLS policies to be more efficient
DROP POLICY IF EXISTS "Published posts viewable by everyone" ON public.posts;
CREATE POLICY "Published posts viewable by everyone" 
ON public.posts FOR SELECT 
USING (published = true);

-- Add a function to handle post creation with better error handling
CREATE OR REPLACE FUNCTION create_post_with_unique_slug(
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
BEGIN
  final_slug := p_slug;
  
  -- Ensure slug is unique
  WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = final_slug) LOOP
    final_slug := p_slug || '-' || counter;
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
GRANT EXECUTE ON FUNCTION create_post_with_unique_slug TO authenticated;
