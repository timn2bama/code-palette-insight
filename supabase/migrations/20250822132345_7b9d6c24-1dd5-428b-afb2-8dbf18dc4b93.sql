-- Enable RLS on public_blog_posts table
ALTER TABLE public.public_blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all blog posts (since this is a public blog table)
CREATE POLICY "Allow public read access to blog posts" 
ON public.public_blog_posts 
FOR SELECT 
TO public
USING (true);

-- Prevent any write operations from unauthorized users
-- Only service role should be able to insert/update/delete
CREATE POLICY "Prevent unauthorized writes" 
ON public.public_blog_posts 
FOR INSERT 
TO public
WITH CHECK (false);

CREATE POLICY "Prevent unauthorized updates" 
ON public.public_blog_posts 
FOR UPDATE 
TO public
USING (false);

CREATE POLICY "Prevent unauthorized deletes" 
ON public.public_blog_posts 
FOR DELETE 
TO public
USING (false);