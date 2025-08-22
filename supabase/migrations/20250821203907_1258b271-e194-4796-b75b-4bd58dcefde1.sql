-- Enable RLS on the public_blog_posts view
ALTER VIEW public.public_blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to published blog posts
-- This view already filters for published = true, so we can safely allow public access
CREATE POLICY "Public can view published blog posts" 
ON public.public_blog_posts 
FOR SELECT 
TO public
USING (true);

-- Also allow authenticated users to access the view
CREATE POLICY "Authenticated users can view published blog posts" 
ON public.public_blog_posts 
FOR SELECT 
TO authenticated
USING (true);

-- Allow anonymous users to access the view
CREATE POLICY "Anonymous users can view published blog posts" 
ON public.public_blog_posts 
FOR SELECT 
TO anon
USING (true);