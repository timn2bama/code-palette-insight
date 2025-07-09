-- Create outfits table
CREATE TABLE public.outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  occasion TEXT,
  season TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outfit items junction table
CREATE TABLE public.outfit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(outfit_id, wardrobe_item_id)
);

-- Enable Row Level Security
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;

-- Create policies for outfits
CREATE POLICY "Users can view their own outfits" 
ON public.outfits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfits" 
ON public.outfits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits" 
ON public.outfits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits" 
ON public.outfits 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for outfit items
CREATE POLICY "Users can view outfit items for their outfits" 
ON public.outfit_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.outfits 
  WHERE outfits.id = outfit_items.outfit_id 
  AND outfits.user_id = auth.uid()
));

CREATE POLICY "Users can create outfit items for their outfits" 
ON public.outfit_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outfits 
  WHERE outfits.id = outfit_items.outfit_id 
  AND outfits.user_id = auth.uid()
));

CREATE POLICY "Users can delete outfit items for their outfits" 
ON public.outfit_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.outfits 
  WHERE outfits.id = outfit_items.outfit_id 
  AND outfits.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates on outfits
CREATE TRIGGER update_outfits_updated_at
BEFORE UPDATE ON public.outfits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();