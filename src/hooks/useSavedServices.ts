import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SavedService {
  id: string;
  user_id: string;
  service_name: string;
  service_address: string;
  service_phone?: string;
  service_data: any;
  created_at: string;
  updated_at: string;
}

export const useSavedServices = () => {
  const [savedServices, setSavedServices] = useState<SavedService[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch saved services for the current user
  const fetchSavedServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedServices(data || []);
    } catch (error: any) {
      console.error('Error fetching saved services:', error);
      toast({
        title: "Error",
        description: "Failed to load saved services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save a service
  const saveService = async (service: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save services",
          variant: "destructive",
        });
        return false;
      }

      const serviceData = {
        user_id: user.id,
        service_name: service.name,
        service_address: service.vicinity || service.formatted_address || '',
        service_phone: service.phone || null,
        service_data: service
      };

      const { error } = await supabase
        .from('saved_services')
        .insert([serviceData]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Saved",
            description: "This service is already in your saved list",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Service Saved",
        description: `${service.name} has been added to your saved services`,
      });

      // Refresh the saved services list
      await fetchSavedServices();
      return true;
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove a saved service
  const removeSavedService = async (serviceName: string, serviceAddress: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('saved_services')
        .delete()
        .eq('user_id', user.id)
        .eq('service_name', serviceName)
        .eq('service_address', serviceAddress);

      if (error) throw error;

      toast({
        title: "Service Removed",
        description: "Service has been removed from your saved list",
      });

      // Refresh the saved services list
      await fetchSavedServices();
      return true;
    } catch (error: any) {
      console.error('Error removing saved service:', error);
      toast({
        title: "Error",
        description: "Failed to remove service",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check if a service is saved
  const isServiceSaved = (serviceName: string, serviceAddress: string) => {
    return savedServices.some(
      saved => saved.service_name === serviceName && 
                saved.service_address === (serviceAddress || '')
    );
  };

  // Toggle save status
  const toggleSaveService = async (service: any) => {
    const address = service.vicinity || service.formatted_address || '';
    const isSaved = isServiceSaved(service.name, address);
    
    if (isSaved) {
      return await removeSavedService(service.name, address);
    } else {
      return await saveService(service);
    }
  };

  useEffect(() => {
    fetchSavedServices();
  }, []);

  return {
    savedServices,
    loading,
    saveService,
    removeSavedService,
    isServiceSaved,
    toggleSaveService,
    fetchSavedServices
  };
};