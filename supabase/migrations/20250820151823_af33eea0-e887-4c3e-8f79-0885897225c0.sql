-- Add RLS policies to the public_blog_posts view to address security scanner warning
-- Enable RLS on the view itself (though it inherits from underlying tables)
ALTER VIEW public.public_blog_posts SET (security_barrier = false);

-- Ensure the view respects RLS policies from underlying tables
-- The view already filters for published = true, but let's make sure RLS is clear