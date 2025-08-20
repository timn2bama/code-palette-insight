-- Fix API keys security vulnerability

-- First, ensure the sanitize_api_key trigger is properly attached
DROP TRIGGER IF EXISTS sanitize_api_key_trigger ON public.api_keys;
CREATE TRIGGER sanitize_api_key_trigger
  BEFORE INSERT OR UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_api_key();

-- Hash any existing plaintext API keys
UPDATE public.api_keys 
SET 
  key_hash = encode(digest(api_key, 'sha256'), 'hex'),
  api_key = null
WHERE api_key IS NOT NULL AND key_hash IS NULL;

-- Add constraint to prevent plaintext API keys from being stored
ALTER TABLE public.api_keys 
ADD CONSTRAINT check_no_plaintext_api_key 
CHECK (api_key IS NULL OR key_hash IS NOT NULL);

-- Drop existing overly permissive SELECT policy if it exists
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;

-- Create stricter SELECT policy that ensures only active keys for the authenticated user
CREATE POLICY "Users can view only their own active API keys" ON public.api_keys
FOR SELECT
USING (auth.uid() = user_id AND is_active = true);

-- Ensure other policies are restrictive
DROP POLICY IF EXISTS "Users can create their own API keys" ON public.api_keys;
CREATE POLICY "Users can create their own API keys" ON public.api_keys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own API keys" ON public.api_keys;
CREATE POLICY "Users can update their own API keys" ON public.api_keys
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own API keys" ON public.api_keys;
CREATE POLICY "Users can delete their own API keys" ON public.api_keys
FOR DELETE
USING (auth.uid() = user_id);