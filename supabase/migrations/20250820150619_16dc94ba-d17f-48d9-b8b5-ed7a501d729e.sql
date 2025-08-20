-- Fix profiles table security vulnerability
-- Currently any authenticated user can view all profiles, which is a privacy risk

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view only their own profile" ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);