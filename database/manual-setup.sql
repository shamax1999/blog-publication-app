-- Manual Database Setup for Blog App
-- Copy and paste this into your Supabase SQL Editor

-- Create the posts table with simplified structure
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  author_id UUID NOT NULL,
  author_email TEXT NOT NULL,
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Authors can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON public.posts;

-- Create RLS policies for posts
CREATE POLICY "Published posts are viewable by everyone" 
ON public.posts FOR SELECT 
USING (published = true);

CREATE POLICY "Authors can view their own posts" 
ON public.posts FOR SELECT 
USING (auth.uid()::text = author_id::text);

CREATE POLICY "Authors can insert their own posts" 
ON public.posts FOR INSERT 
WITH CHECK (auth.uid()::text = author_id::text);

CREATE POLICY "Authors can update their own posts" 
ON public.posts FOR UPDATE 
USING (auth.uid()::text = author_id::text);

CREATE POLICY "Authors can delete their own posts" 
ON public.posts FOR DELETE 
USING (auth.uid()::text = author_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts(slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts(published);
CREATE INDEX IF NOT EXISTS posts_author_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_premium_idx ON public.posts(is_premium);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.posts TO anon, authenticated;
