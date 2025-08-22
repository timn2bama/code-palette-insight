-- Add a specific policy for public blog post view access
-- This ensures the public_blog_posts view has explicit read-only access
CREATE POLICY "Public view access to published blog posts" 
ON public.blog_posts 
FOR SELECT 
TO public
USING (published = true);

-- Add a comment to document that public_blog_posts is a secured view
COMMENT ON VIEW public.public_blog_posts IS 'Secured view of published blog posts with RLS inherited from blog_posts table. Read-only access for all users.';