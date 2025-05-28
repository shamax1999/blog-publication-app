-- Postly Enhanced Database Schema for Long Titles and Rich Content
-- Copy and paste this into your Supabase SQL Editor

-- Ensure the posts table can handle unlimited content and long titles
ALTER TABLE public.posts 
ALTER COLUMN title TYPE TEXT;

ALTER TABLE public.posts 
ALTER COLUMN content TYPE TEXT;

ALTER TABLE public.posts 
ALTER COLUMN excerpt TYPE TEXT;

ALTER TABLE public.posts 
ALTER COLUMN slug TYPE TEXT;

-- Remove any existing length constraints
DROP INDEX IF EXISTS posts_slug_key;
CREATE UNIQUE INDEX posts_slug_unique_idx ON public.posts(slug);

-- Add better indexing for long titles and content
CREATE INDEX IF NOT EXISTS posts_title_search_idx ON public.posts 
USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS posts_content_search_idx ON public.posts 
USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || left(content, 1000)));

-- Add index for better performance with large content
CREATE INDEX IF NOT EXISTS posts_content_length_idx ON public.posts(length(content));
CREATE INDEX IF NOT EXISTS posts_title_length_idx ON public.posts(length(title));

-- Update the create post function to handle long titles and unlimited content
CREATE OR REPLACE FUNCTION create_postly_post(
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
  max_slug_length INTEGER := 100;
BEGIN
  -- Handle long titles by creating a reasonable slug
  base_slug := p_slug;
  
  -- If slug is too long, truncate it intelligently
  IF length(base_slug) > max_slug_length THEN
    base_slug := left(base_slug, max_slug_length);
  END IF;
  
  -- Remove trailing hyphens
  base_slug := rtrim(base_slug,

  -- Remove trailing hyphens
  base_slug := rtrim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Ensure slug is unique
  WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
    
    -- Ensure the final slug doesn't exceed length limit
    IF length(final_slug) > max_slug_length THEN
      base_slug := left(base_slug, max_slug_length - length('-' || counter));
      final_slug := base_slug || '-' || counter;
    END IF;
  END LOOP;
  
  -- Insert the post with unlimited content and long title support
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
GRANT EXECUTE ON FUNCTION create_postly_post TO authenticated;

-- Add a function to get content statistics for Postly
CREATE OR REPLACE FUNCTION get_postly_stats(post_id UUID)
RETURNS TABLE(
  word_count INTEGER,
  character_count INTEGER,
  reading_time_minutes INTEGER,
  emoji_count INTEGER,
  icon_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    array_length(string_to_array(regexp_replace(content, '<[^>]*>', '', 'g'), ' '), 1) as word_count,
    length(regexp_replace(content, '<[^>]*>', '', 'g')) as character_count,
    GREATEST(1, ROUND(array_length(string_to_array(regexp_replace(content, '<[^>]*>', '', 'g'), ' '), 1) / 200.0)) as reading_time_minutes,
    (length(content) - length(regexp_replace(content, '[😀-🿿]', '', 'g'))) as emoji_count,
    (length(content) - length(regexp_replace(content, 'class="postly-icon"', '', 'g'))) / length('class="postly-icon"') as icon_count
  FROM public.posts 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_postly_stats TO authenticated, anon;

-- Create a view for published posts with enhanced metadata
CREATE OR REPLACE VIEW postly_published_posts AS
SELECT 
  p.*,
  length(p.title) as title_length,
  length(p.content) as content_length,
  array_length(string_to_array(regexp_replace(p.content, '<[^>]*>', '', 'g'), ' '), 1) as word_count,
  GREATEST(1, ROUND(array_length(string_to_array(regexp_replace(p.content, '<[^>]*>', '', 'g'), ' '), 1) / 200.0)) as reading_time
FROM public.posts p
WHERE p.published = true
ORDER BY p.created_at DESC;

-- Grant access to the view
GRANT SELECT ON postly_published_posts TO anon, authenticated;
