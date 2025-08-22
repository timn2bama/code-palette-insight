-- Fix blog_posts privacy vulnerability
-- Create a public view that shows author display names instead of user IDs

-- Create a view for public blog posts that doesn't expose author_id
CREATE OR REPLACE VIEW public.public_blog_posts AS
SELECT 
  bp.id,
  bp.title,
  bp.slug,
  bp.content,
  bp.excerpt,
  bp.featured_image_url,
  bp.tags,
  bp.published,
  bp.published_at,
  bp.created_at,
  bp.updated_at,
  COALESCE(p.display_name, 'Anonymous') as author_name
FROM public.blog_posts bp
LEFT JOIN public.profiles p ON bp.author_id = p.user_id
WHERE bp.published = true;

-- Enable RLS on the view (though views inherit from base tables)
ALTER VIEW public.public_blog_posts SET (security_barrier = true);

-- Grant public access to the view
GRANT SELECT ON public.public_blog_posts TO anon;
GRANT SELECT ON public.public_blog_posts TO authenticated;

-- Update the existing policy to be more restrictive
-- Remove public access to the main table
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;

-- Create a policy that only allows authenticated users to see published posts with author_id
-- (for admin interfaces, etc.)
CREATE POLICY "Authenticated users can view published blog posts with author info" ON public.blog_posts
FOR SELECT
TO authenticated
USING (published = true);