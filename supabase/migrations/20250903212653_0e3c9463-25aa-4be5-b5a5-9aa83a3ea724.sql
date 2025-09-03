-- Create analytics and business intelligence tables

-- Wardrobe analytics for ROI tracking
CREATE TABLE public.wardrobe_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  cost_per_wear DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  wear_count INTEGER DEFAULT 0,
  last_calculated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seasonal usage patterns
CREATE TABLE public.seasonal_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season TEXT NOT NULL, -- spring, summer, fall, winter
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  top_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shopping recommendations
CREATE TABLE public.shopping_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- gap_analysis, trend_based, seasonal
  category TEXT NOT NULL,
  priority INTEGER DEFAULT 1, -- 1-5 scale
  reason TEXT,
  suggested_items JSONB DEFAULT '[]'::jsonb,
  external_links JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enhanced subscription tiers
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage tracking for billing
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL, -- ai_recommendations, photo_uploads, outfit_generations
  usage_count INTEGER DEFAULT 1,
  billing_period_start TIMESTAMPTZ NOT NULL,
  billing_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Personal stylist consultations
CREATE TABLE public.stylist_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultation_type TEXT NOT NULL, -- virtual, in_person, wardrobe_audit
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
  scheduled_date TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  notes TEXT,
  stylist_feedback JSONB DEFAULT '{}'::jsonb,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Integration settings
CREATE TABLE public.integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL, -- amazon, calendar, social_media
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- External shopping links
CREATE TABLE public.external_shopping_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wardrobe_item_id UUID REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- amazon, nordstrom, etc
  product_url TEXT NOT NULL,
  price DECIMAL(10,2),
  available BOOLEAN DEFAULT true,
  last_checked TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.wardrobe_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylist_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_shopping_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wardrobe_analytics
CREATE POLICY "Users can view their own analytics" ON public.wardrobe_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analytics" ON public.wardrobe_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analytics" ON public.wardrobe_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for seasonal_analytics
CREATE POLICY "Users can view their own seasonal analytics" ON public.seasonal_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own seasonal analytics" ON public.seasonal_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own seasonal analytics" ON public.seasonal_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for shopping_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.shopping_recommendations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recommendations" ON public.shopping_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recommendations" ON public.shopping_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for subscription_tiers (public read)
CREATE POLICY "Anyone can view subscription tiers" ON public.subscription_tiers
  FOR SELECT USING (true);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view their own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own usage" ON public.usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for stylist_consultations
CREATE POLICY "Users can manage their own consultations" ON public.stylist_consultations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for integration_settings
CREATE POLICY "Users can manage their own integrations" ON public.integration_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for external_shopping_links (can be viewed by item owner)
CREATE POLICY "Users can view links for their items" ON public.external_shopping_links
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM wardrobe_items wi 
    WHERE wi.id = external_shopping_links.wardrobe_item_id 
    AND wi.user_id = auth.uid()
  ));

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (tier_name, price_monthly, price_yearly, features, limits) VALUES
('Free', 0.00, 0.00, 
 '{"wardrobe_items": true, "basic_outfits": true, "weather_integration": true}',
 '{"max_items_per_category": 4, "ai_recommendations_per_month": 5, "photo_uploads_per_month": 10}'),
('Premium', 9.99, 99.99,
 '{"unlimited_wardrobe": true, "ai_recommendations": true, "outfit_sharing": true, "analytics": true}',
 '{"max_items_per_category": -1, "ai_recommendations_per_month": 100, "photo_uploads_per_month": 500}'),
('Enterprise', 29.99, 299.99,
 '{"everything_premium": true, "personal_stylist": true, "priority_support": true, "advanced_analytics": true}',
 '{"max_items_per_category": -1, "ai_recommendations_per_month": -1, "photo_uploads_per_month": -1, "stylist_consultations_per_month": 2}');

-- Create functions for analytics calculations
CREATE OR REPLACE FUNCTION public.calculate_cost_per_wear(item_id UUID)
RETURNS DECIMAL AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at columns
CREATE TRIGGER update_wardrobe_analytics_updated_at
  BEFORE UPDATE ON public.wardrobe_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seasonal_analytics_updated_at
  BEFORE UPDATE ON public.seasonal_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_settings_updated_at
  BEFORE UPDATE ON public.integration_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();