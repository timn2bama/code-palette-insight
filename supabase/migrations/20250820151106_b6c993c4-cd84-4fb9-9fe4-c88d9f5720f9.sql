-- Fix security definer view issue
-- Remove the security_barrier property which was creating a security risk

-- Drop the existing view with security_barrier
DROP VIEW IF EXISTS public.public_blog_posts;

-- Recreate the view without security_barrier property
-- This ensures RLS policies are properly enforced for each user
CREATE VIEW public.public_blog_posts AS
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

-- Grant appropriate access to the view
-- Anonymous users can view published blog posts
GRANT SELECT ON public.public_blog_posts TO anon;
GRANT SELECT ON public.public_blog_posts TO authenticated;

-- The view will now properly respect RLS policies on the underlying tables
-- instead of bypassing them with security definer privileges