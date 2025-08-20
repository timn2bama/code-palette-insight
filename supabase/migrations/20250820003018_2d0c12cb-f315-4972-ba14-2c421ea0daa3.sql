-- Drop the existing policy that allows email-based access
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Create a new secure policy that only allows user_id-based access
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid());