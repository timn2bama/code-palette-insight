-- Fix API keys plaintext storage vulnerability
-- Make api_key column nullable and key_hash NOT NULL
ALTER TABLE api_keys ALTER COLUMN api_key DROP NOT NULL;
ALTER TABLE api_keys ALTER COLUMN key_hash SET NOT NULL;

-- Update the sanitize_api_key function to properly hash and clear plaintext
CREATE OR REPLACE FUNCTION public.sanitize_api_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
begin
  if new.api_key is not null then
    new.key_hash := encode(digest(new.api_key, 'sha256'), 'hex');
    new.api_key := null; -- Clear plaintext immediately
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- Hash existing plaintext API keys
UPDATE api_keys
SET key_hash = encode(digest(api_key, 'sha256'), 'hex'),
    api_key = null
WHERE api_key IS NOT NULL;