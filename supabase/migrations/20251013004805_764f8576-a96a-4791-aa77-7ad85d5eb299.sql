-- Security Fix Migration: Address all identified vulnerabilities
-- 1. Fix SECURITY DEFINER functions to prevent search_path attacks
-- 2. Implement Role-Based Access Control (RBAC) system
-- 3. Remove orphaned blog database objects

-- ==========================================
-- 1. FIX SECURITY DEFINER FUNCTIONS
-- ==========================================

-- Fix calculate_cost_per_wear function
CREATE OR REPLACE FUNCTION public.calculate_cost_per_wear(item_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  total_cost DECIMAL;
  wear_count INTEGER;
BEGIN
  SELECT purchase_date, wear_count INTO total_cost, wear_count
  FROM wardrobe_items WHERE id = item_id;
  
  IF wear_count = 0 OR total_cost IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN total_cost / wear_count;
END;
$function$;

-- Fix set_updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix enforce_challenge_active_for_entry function
CREATE OR REPLACE FUNCTION public.enforce_challenge_active_for_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  s timestamptz;
  e timestamptz;
BEGIN
  SELECT start_at, end_at INTO s, e
  FROM public.challenges
  WHERE id = NEW.challenge_id;

  IF s IS NULL THEN
    RAISE EXCEPTION 'Challenge % not found', NEW.challenge_id;
  END IF;

  IF now() < s OR now() > e THEN
    RAISE EXCEPTION 'Submissions are closed for this challenge';
  END IF;

  RETURN NEW;
END;
$function$;

-- Fix enforce_challenge_active_for_vote function
CREATE OR REPLACE FUNCTION public.enforce_challenge_active_for_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  s timestamptz;
  e timestamptz;
  entry_challenge uuid;
BEGIN
  SELECT e.challenge_id INTO entry_challenge
  FROM public.challenge_entries e
  WHERE e.id = NEW.entry_id;

  IF entry_challenge IS NULL THEN
    RAISE EXCEPTION 'Entry % not found', NEW.entry_id;
  END IF;

  -- Ensure the vote challenge_id matches the entry's challenge_id
  IF NEW.challenge_id <> entry_challenge THEN
    RAISE EXCEPTION 'Vote challenge_id does not match entry''s challenge';
  END IF;

  SELECT c.start_at, c.end_at INTO s, e
  FROM public.challenges c
  WHERE c.id = NEW.challenge_id;

  IF s IS NULL THEN
    RAISE EXCEPTION 'Challenge % not found', NEW.challenge_id;
  END IF;

  IF now() < s OR now() > e THEN
    RAISE EXCEPTION 'Voting is closed for this challenge';
  END IF;

  RETURN NEW;
END;
$function$;

-- Fix update_blog_posts_updated_at function
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- ==========================================
-- 2. IMPLEMENT RBAC SYSTEM
-- ==========================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'moderator', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  granted_at timestamptz DEFAULT now(),
  granted_by uuid,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- 3. REMOVE ORPHANED BLOG DATABASE OBJECTS
-- ==========================================

-- Drop dependent objects in correct order
DROP TRIGGER IF EXISTS update_blog_posts_timestamp ON public.blog_posts;
DROP VIEW IF EXISTS public.public_blog_posts;
DROP TABLE IF EXISTS public.blog_posts CASCADE;

-- Now drop functions (no longer referenced)
DROP FUNCTION IF EXISTS public.update_blog_posts_updated_at();
DROP FUNCTION IF EXISTS public.log_blog_access_attempt();