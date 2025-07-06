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

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

interface UseLocalServicesOptions {
  location: string;
}

interface LocalServicesResponse {
  servicesByCategory: Record<string, LocalService[]>;
  categories: ServiceCategory[];
  stats: {
    total: number;
    avgRating: number;
    openCount: number;
  };
}

export const useLocalServices = ({ location }: UseLocalServicesOptions) => {
  const [data, setData] = useState<LocalServicesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchServices = async () => {
    if (!location.trim()) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: responseData, error } = await supabase.functions.invoke('get-local-services', {
        body: {
          location: location.trim(),
          radius: 10000 // 10km radius
        }
      });

      if (error) {
        throw error;
      }

      setData(responseData);
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
  }, [location]);

  return {
    data,
    loading,
    error,
    refetch: fetchServices,
  };
};