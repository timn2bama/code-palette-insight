-- Drop the existing policy that allows public access to all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that restricts profile viewing to authenticated users only
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');