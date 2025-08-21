-- Since views cannot have RLS, we ensure security through the view definition
-- and by checking that underlying tables have proper RLS policies

-- First, let's check the existing policies on blog_posts table
-- We need to ensure there's a policy that allows public access to published posts

-- Add a policy to allow public read access to published blog posts
-- This will allow the view to work properly for public access
CREATE POLICY "Public can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
TO public
USING (published = true);

-- Allow anonymous users to view published blog posts
CREATE POLICY "Anonymous can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
TO anon
USING (published = true);

-- Ensure the view has proper grants for public access
GRANT SELECT ON public.public_blog_posts TO public;
GRANT SELECT ON public.public_blog_posts TO anon;