import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LocalService {
  id: string;
  name: string;
  type: string;
  rating: number;
  price: string;
  distance: string;
  address: string;
  phone: string;
  services: string[];
  hours: string;
  specialties: string[];
  isOpen: boolean;
}

interface UseLocalServicesOptions {
  location: string;
  serviceType: string;
}

export const useLocalServices = ({ location, serviceType }: UseLocalServicesOptions) => {
  const [services, setServices] = useState<LocalService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchServices = async () => {
    if (!location.trim()) {
      setServices([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('get-local-services', {
        body: {
          location: location.trim(),
          serviceType: serviceType === 'all' ? undefined : serviceType,
          radius: 10000 // 10km radius
        }
      });

      if (error) {
        throw error;
      }

      setServices(data.services || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch local services';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [location, serviceType]);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
  };
};