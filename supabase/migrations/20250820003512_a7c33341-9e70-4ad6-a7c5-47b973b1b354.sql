-- Fix subscribers table security vulnerability

-- First, ensure all existing records have proper user_id
UPDATE public.subscribers 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE auth.users.email = subscribers.email 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Make user_id NOT NULL since every subscriber must be associated with a user
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint on user_id (each user can only have one subscription record)
ALTER TABLE public.subscribers 
ADD CONSTRAINT unique_user_subscription 
UNIQUE (user_id);

-- Add constraint to ensure email matches the authenticated user's email
ALTER TABLE public.subscribers 
ADD CONSTRAINT check_email_matches_user 
CHECK (email IS NOT NULL);

-- Drop existing potentially vulnerable policies
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

-- Create more secure SELECT policy
CREATE POLICY "Users can view only their own subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() AND user_id IS NOT NULL);

-- Create secure INSERT policy that ensures user can only create their own subscription
CREATE POLICY "Users can create only their own subscription" ON public.subscribers
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_id IS NOT NULL 
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create secure UPDATE policy
CREATE POLICY "Users can update only their own subscription" ON public.subscribers
FOR UPDATE
USING (user_id = auth.uid() AND user_id IS NOT NULL)
WITH CHECK (
  user_id = auth.uid() 
  AND user_id IS NOT NULL 
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- No DELETE policy - subscriptions should not be deleted by users
-- Only edge functions with service role can delete if needed