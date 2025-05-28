-- Enhanced Database Schema for Unlimited Content
-- Copy and paste this into your Supabase SQL Editor

-- Ensure the posts table can handle unlimited content
ALTER TABLE public.posts 
ALTER COLUMN content TYPE TEXT;

-- Remove any length constraints
ALTER TABLE public.posts 
ALTER COLUMN title TYPE TEXT;

ALTER TABLE public.posts 
ALTER COLUMN excerpt TYPE TEXT;

-- Add better indexing for large content
DROP INDEX IF EXISTS posts_content_search_idx;
CREATE INDEX posts_content_search_idx ON public.posts 
USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || left(content, 1000)));

-- Add index for better performance with large content
CREATE INDEX IF NOT EXISTS posts_content_length_idx ON public.posts(length(content));

-- Update the create post function to handle large content
CREATE OR REPLACE FUNCTION create_post_with_unlimited_content(
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
  
  -- Insert the post with unlimited content
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
GRANT EXECUTE ON FUNCTION create_post_with_unlimited_content TO authenticated;

-- Add a function to get content statistics
CREATE OR REPLACE FUNCTION get_post_stats(post_id UUID)
RETURNS TABLE(
  word_count INTEGER,
  character_count INTEGER,
  reading_time_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    array_length(string_to_array(regexp_replace(content, '<[^>]*>', '', 'g'), ' '), 1) as word_count,
    length(regexp_replace(content, '<[^>]*>', '', 'g')) as character_count,
    GREATEST(1, ROUND(array_length(string_to_array(regexp_replace(content, '<[^>]*>', '', 'g'), ' '), 1) / 200.0)) as reading_time_minutes
  FROM public.posts 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_post_stats TO authenticated, anon;
