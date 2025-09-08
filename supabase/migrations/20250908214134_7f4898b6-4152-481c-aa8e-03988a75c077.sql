-- Marketplace tables for buy/sell pre-loved fashion items
CREATE TABLE public.marketplace_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('excellent', 'very_good', 'good', 'fair')),
  size TEXT,
  brand TEXT,
  category TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  shipping_included BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sold_at TIMESTAMP WITH TIME ZONE,
  buyer_id UUID,
  photos JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  sustainability_score INTEGER DEFAULT 0 CHECK (sustainability_score BETWEEN 0 AND 100)
);

-- Rental platform integration
CREATE TABLE public.rental_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  daily_rate DECIMAL(8,2) NOT NULL,
  weekly_rate DECIMAL(8,2),
  deposit_amount DECIMAL(8,2) NOT NULL,
  size TEXT,
  brand TEXT,
  category TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  photos JSONB DEFAULT '[]'::jsonb,
  rental_terms TEXT,
  care_instructions TEXT
);

CREATE TABLE public.rental_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_item_id UUID NOT NULL REFERENCES public.rental_items(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(8,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  special_instructions TEXT,
  return_condition TEXT,
  review_rating INTEGER CHECK (review_rating BETWEEN 1 AND 5),
  review_comment TEXT
);

-- Sustainability tracking
CREATE TABLE public.sustainability_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('carbon_footprint', 'water_usage', 'waste_reduction', 'circular_economy')),
  value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_data JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);

CREATE TABLE public.carbon_footprint_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wardrobe_item_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  manufacturing_impact DECIMAL(8,2) DEFAULT 0, -- kg CO2
  transportation_impact DECIMAL(8,2) DEFAULT 0, -- kg CO2
  usage_impact DECIMAL(8,2) DEFAULT 0, -- kg CO2 per wear
  disposal_impact DECIMAL(8,2) DEFAULT 0, -- kg CO2
  total_footprint DECIMAL(8,2) GENERATED ALWAYS AS (
    COALESCE(manufacturing_impact, 0) + 
    COALESCE(transportation_impact, 0) + 
    COALESCE(usage_impact, 0) + 
    COALESCE(disposal_impact, 0)
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_calculated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Personal Stylist tables
CREATE TABLE public.daily_outfit_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  suggestion_date DATE NOT NULL,
  outfit_data JSONB NOT NULL, -- Contains wardrobe item IDs and styling notes
  weather_context JSONB,
  occasion TEXT,
  style_preference TEXT,
  ai_reasoning TEXT,
  user_feedback TEXT CHECK (user_feedback IN ('loved', 'liked', 'neutral', 'disliked', 'hated')),
  was_worn BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, suggestion_date)
);

CREATE TABLE public.event_outfit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_title TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('work', 'casual', 'formal', 'date', 'party', 'wedding', 'travel', 'sports', 'other')),
  dress_code TEXT,
  location TEXT,
  weather_requirements TEXT,
  special_requirements TEXT,
  suggested_outfits JSONB DEFAULT '[]'::jsonb,
  selected_outfit_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'suggested', 'selected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.style_evolution_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL,
  style_metrics JSONB NOT NULL, -- Colors, patterns, brands, categories worn
  mood_tags TEXT[] DEFAULT '{}',
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
  style_goals TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  insights JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.personal_shopping_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('wardrobe_gap', 'seasonal_update', 'event_shopping', 'style_refresh', 'budget_planning')),
  budget_min DECIMAL(8,2),
  budget_max DECIMAL(8,2),
  priority_categories TEXT[] DEFAULT '{}',
  style_preferences TEXT,
  size_requirements JSONB DEFAULT '{}'::jsonb,
  color_preferences TEXT[] DEFAULT '{}',
  brand_preferences TEXT[] DEFAULT '{}',
  sustainability_requirements TEXT,
  recommendations JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'ready', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fulfillment_notes TEXT
);

-- Enable RLS for all new tables
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_footprint_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_outfit_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_outfit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_evolution_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_shopping_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_items
CREATE POLICY "Public can view available marketplace items" 
ON public.marketplace_items 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Users can create their own marketplace listings" 
ON public.marketplace_items 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings" 
ON public.marketplace_items 
FOR UPDATE 
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own listings" 
ON public.marketplace_items 
FOR DELETE 
USING (auth.uid() = seller_id);

-- RLS Policies for rental_items
CREATE POLICY "Public can view available rental items" 
ON public.rental_items 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Users can create their own rental listings" 
ON public.rental_items 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own rental listings" 
ON public.rental_items 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own rental listings" 
ON public.rental_items 
FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS Policies for rental_bookings
CREATE POLICY "Users can view their rental bookings" 
ON public.rental_bookings 
FOR SELECT 
USING (auth.uid() = renter_id OR auth.uid() IN (
  SELECT owner_id FROM rental_items WHERE id = rental_item_id
));

CREATE POLICY "Users can create rental bookings" 
ON public.rental_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Owners and renters can update bookings" 
ON public.rental_bookings 
FOR UPDATE 
USING (auth.uid() = renter_id OR auth.uid() IN (
  SELECT owner_id FROM rental_items WHERE id = rental_item_id
));

-- RLS Policies for sustainability_metrics
CREATE POLICY "Users can manage their own sustainability metrics" 
ON public.sustainability_metrics 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for carbon_footprint_items
CREATE POLICY "Users can manage their own carbon footprint data" 
ON public.carbon_footprint_items 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_outfit_suggestions
CREATE POLICY "Users can manage their own outfit suggestions" 
ON public.daily_outfit_suggestions 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for event_outfit_requests
CREATE POLICY "Users can manage their own event outfit requests" 
ON public.event_outfit_requests 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for style_evolution_tracking
CREATE POLICY "Users can manage their own style evolution data" 
ON public.style_evolution_tracking 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for personal_shopping_requests
CREATE POLICY "Users can manage their own shopping requests" 
ON public.personal_shopping_requests 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_marketplace_items_updated_at
BEFORE UPDATE ON public.marketplace_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rental_items_updated_at
BEFORE UPDATE ON public.rental_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rental_bookings_updated_at
BEFORE UPDATE ON public.rental_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carbon_footprint_items_updated_at
BEFORE UPDATE ON public.carbon_footprint_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_outfit_suggestions_updated_at
BEFORE UPDATE ON public.daily_outfit_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_outfit_requests_updated_at
BEFORE UPDATE ON public.event_outfit_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_shopping_requests_updated_at
BEFORE UPDATE ON public.personal_shopping_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();