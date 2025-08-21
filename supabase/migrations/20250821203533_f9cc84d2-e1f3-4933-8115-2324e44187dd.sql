-- Drop the existing view that has security definer behavior
DROP VIEW IF EXISTS public.public_blog_posts;

-- Recreate the view without security definer properties
-- This view will now respect the permissions of the querying user
CREATE VIEW public.public_blog_posts 
WITH (security_invoker = true) AS
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
    COALESCE(p.display_name, 'Anonymous'::text) AS author_name
FROM blog_posts bp
LEFT JOIN profiles p ON bp.author_id = p.user_id
WHERE bp.published = true;

-- Ensure proper permissions on the view
-- Since this view is for public blog posts, we can allow public access
-- but only to published posts as filtered by the view definition
GRANT SELECT ON public.public_blog_posts TO anon;
GRANT SELECT ON public.public_blog_posts TO authenticated;