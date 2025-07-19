-- Create saved_services table for bookmarking services
CREATE TABLE public.saved_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_address TEXT NOT NULL,
  service_phone TEXT,
  service_data JSONB NOT NULL, -- Store complete service data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_name, service_address) -- Prevent duplicate saves
);

-- Enable Row Level Security
ALTER TABLE public.saved_services ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own saved services" 
ON public.saved_services 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved services" 
ON public.saved_services 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved services" 
ON public.saved_services 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saved_services_updated_at
BEFORE UPDATE ON public.saved_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();