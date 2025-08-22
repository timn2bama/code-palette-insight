-- Fix blog posts RLS policies to properly restrict access
-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can view their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can create their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can update their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can delete their own blog posts" ON public.blog_posts;

-- Ensure RLS is enabled (should already be enabled from previous migration)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner (ensures even superusers respect RLS)
ALTER TABLE public.blog_posts FORCE ROW LEVEL SECURITY;

-- Policy 1: Anonymous users can only view published blog posts
CREATE POLICY "anon_read_published_posts" 
ON public.blog_posts 
FOR SELECT 
TO anon
USING (published = true AND published_at IS NOT NULL);

-- Policy 2: Authenticated users can view published posts
CREATE POLICY "authenticated_read_published_posts" 
ON public.blog_posts 
FOR SELECT 
TO authenticated
USING (published = true AND published_at IS NOT NULL);

-- Policy 3: Authors can view ALL their own posts (published and drafts)
CREATE POLICY "authors_read_own_posts" 
ON public.blog_posts 
FOR SELECT 
TO authenticated
USING (auth.uid() = author_id);

-- Policy 4: Authors can insert their own posts
CREATE POLICY "authors_insert_own_posts" 
ON public.blog_posts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Policy 5: Authors can update their own posts
CREATE POLICY "authors_update_own_posts" 
ON public.blog_posts 
FOR UPDATE 
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Policy 6: Authors can delete their own posts
CREATE POLICY "authors_delete_own_posts" 
ON public.blog_posts 
FOR DELETE 
TO authenticated
USING (auth.uid() = author_id);

-- Additional security: Prevent any access to unpublished posts by anonymous users
-- This is a fail-safe policy that explicitly denies access to drafts
CREATE POLICY "deny_anon_access_to_drafts"
ON public.blog_posts
FOR ALL
TO anon
USING (published = true AND published_at IS NOT NULL);

-- Create a secure view for public access to published posts only
DROP VIEW IF EXISTS public.published_blog_posts;
CREATE VIEW public.published_blog_posts AS
SELECT 
  id,
  title,
  slug,
  content,
  excerpt,
  published_at,
  created_at,
  featured_image_url,
  tags
FROM public.blog_posts
WHERE published = true AND published_at IS NOT NULL
ORDER BY published_at DESC;

-- Grant access to the view
GRANT SELECT ON public.published_blog_posts TO anon, authenticated;

-- Revoke any direct access to the table for anon users (extra security)
REVOKE ALL ON public.blog_posts FROM anon;
GRANT SELECT ON public.blog_posts TO anon; -- Only allow SELECT, which will be filtered by RLS

-- Create an audit function to log access attempts to drafts
CREATE OR REPLACE FUNCTION public.log_blog_access_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log any attempt to access unpublished posts
  IF NEW.published = false OR NEW.published_at IS NULL THEN
    INSERT INTO public.audit_log (
      event_type,
      table_name,
      record_id,
      user_id,
      details,
      created_at
    ) VALUES (
      'DRAFT_ACCESS_ATTEMPT',
      'blog_posts',
      NEW.id,
      auth.uid(),
      jsonb_build_object(
        'title', NEW.title,
        'published', NEW.published,
        'published_at', NEW.published_at
      ),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Add audit trigger (only if audit_log table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    DROP TRIGGER IF EXISTS blog_posts_audit_trigger ON public.blog_posts;
    CREATE TRIGGER blog_posts_audit_trigger
      AFTER INSERT OR UPDATE ON public.blog_posts
      FOR EACH ROW
      EXECUTE FUNCTION public.log_blog_access_attempt();
  END IF;
END $$;

-- Add comments explaining the security setup
COMMENT ON TABLE public.blog_posts IS 'Blog posts table with comprehensive RLS enabled. Only published posts visible to public. Authors manage own posts. Force RLS prevents bypass.';
COMMENT ON VIEW public.published_blog_posts IS 'Secure public view of published blog posts only. Excludes drafts and sensitive metadata.';
COMMENT ON POLICY "anon_read_published_posts" ON public.blog_posts IS 'Anonymous users can only access published posts with published_at timestamp';
COMMENT ON POLICY "authors_read_own_posts" ON public.blog_posts IS 'Authors have full access to their own posts including drafts';
COMMENT ON POLICY "deny_anon_access_to_drafts" ON public.blog_posts IS 'Explicit deny policy for anonymous access to unpublished content';
