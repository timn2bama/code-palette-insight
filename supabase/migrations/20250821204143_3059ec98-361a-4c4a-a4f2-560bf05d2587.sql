-- Drop existing policies that may allow anonymous access
DROP POLICY IF EXISTS "Users can create only their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view only their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update only their own subscription" ON public.subscribers;

-- Create secure policies that explicitly restrict access to authenticated users only
-- and ensure users can only access their own data

-- Policy for SELECT: Only authenticated users can view their own subscription data
CREATE POLICY "Authenticated users can view own subscription" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Policy for INSERT: Only authenticated users can create their own subscription
CREATE POLICY "Authenticated users can create own subscription" 
ON public.subscribers 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- Policy for UPDATE: Only authenticated users can update their own subscription
CREATE POLICY "Authenticated users can update own subscription" 
ON public.subscribers 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- Policy for DELETE: Only authenticated users can delete their own subscription (if needed)
CREATE POLICY "Authenticated users can delete own subscription" 
ON public.subscribers 
FOR DELETE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Explicitly deny all access to anonymous users
CREATE POLICY "Deny anonymous access" 
ON public.subscribers 
FOR ALL 
TO anon
USING (false);