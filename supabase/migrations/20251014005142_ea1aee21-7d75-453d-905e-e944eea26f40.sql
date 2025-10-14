-- Create outfit_wear_logs table
CREATE TABLE public.outfit_wear_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What was worn
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE SET NULL,
  items_worn JSONB NOT NULL,
  
  -- When & Where
  worn_date DATE NOT NULL DEFAULT CURRENT_DATE,
  worn_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  location TEXT,
  
  -- Context
  weather_temp NUMERIC,
  weather_condition TEXT,
  occasion TEXT,
  mood_tags TEXT[],
  
  -- User Feedback
  comfort_rating INTEGER CHECK (comfort_rating BETWEEN 1 AND 5),
  style_satisfaction INTEGER CHECK (style_satisfaction BETWEEN 1 AND 5),
  would_wear_again BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for fast queries
CREATE INDEX idx_outfit_wear_logs_user_date 
  ON public.outfit_wear_logs(user_id, worn_date DESC);
CREATE INDEX idx_outfit_wear_logs_occasion 
  ON public.outfit_wear_logs(occasion) 
  WHERE occasion IS NOT NULL;
CREATE INDEX idx_outfit_wear_logs_items 
  ON public.outfit_wear_logs USING gin(items_worn);

-- Enable RLS
ALTER TABLE public.outfit_wear_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own wear logs
CREATE POLICY "Users can manage their own wear logs"
ON public.outfit_wear_logs FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_outfit_wear_logs_updated_at
  BEFORE UPDATE ON public.outfit_wear_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Function to increment wear count and update last_worn on wardrobe items
CREATE OR REPLACE FUNCTION public.increment_item_wear_count(
  item_id UUID,
  worn_date TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.wardrobe_items
  SET 
    wear_count = COALESCE(wear_count, 0) + 1,
    last_worn = worn_date,
    updated_at = now()
  WHERE id = item_id;
END;
$$;