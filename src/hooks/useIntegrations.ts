import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Integration {
  id: string;
  integration_type: string;
  settings: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string; // work, formal, casual, etc.
}

export const useIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchIntegrations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateIntegration = async (
    integrationType: string,
    settings: Record<string, any>,
    isActive = true
  ) => {
    if (!user) return;

    try {
      const existing = integrations.find(i => i.integration_type === integrationType);

      if (existing) {
        const { error } = await supabase
          .from('integration_settings')
          .update({
            settings,
            is_active: isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('integration_settings')
          .insert({
            user_id: user.id,
            integration_type: integrationType,
            settings,
            is_active: isActive
          });

        if (error) throw error;
      }

      fetchIntegrations(); // Refresh data
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    }
  };

  const getIntegration = (type: string): Integration | null => {
    return integrations.find(i => i.integration_type === type && i.is_active) || null;
  };

  // Weather integration
  const getWeatherRecommendations = async (location: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { location }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting weather recommendations:', error);
      return null;
    }
  };

  // Calendar integration simulation
  const getUpcomingEvents = (): CalendarEvent[] => {
    const calendarIntegration = getIntegration('calendar');
    if (!calendarIntegration) return [];

    // Mock calendar events - in real implementation, this would sync with actual calendar APIs
    const now = new Date();
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Business Meeting',
        date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'formal'
      },
      {
        id: '2',
        title: 'Casual Lunch',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'casual'
      },
      {
        id: '3',
        title: 'Date Night',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'elegant'
      }
    ];

    return mockEvents;
  };

  // Social media sharing
  const shareOutfit = async (outfitData: any, platforms: string[]) => {
    const socialIntegration = getIntegration('social_media');
    if (!socialIntegration) return false;

    try {
      // Mock sharing - in real implementation, this would use actual social media APIs
      console.log('Sharing outfit to platforms:', platforms, outfitData);
      
      // Here you would implement actual sharing logic for each platform
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error sharing outfit:', error);
      return false;
    }
  };

  // Shopping platform integration
  const findSimilarItems = async (itemDescription: string, category: string) => {
    try {
      // Mock shopping recommendations - in real implementation, 
      // this would integrate with Amazon Product Advertising API, etc.
      const mockItems = [
        {
          title: `Similar ${category} - Style Match`,
          price: '$49.99',
          url: 'https://example.com/item1',
          image: 'https://via.placeholder.com/150',
          platform: 'Amazon'
        },
        {
          title: `${category} Alternative - Great Quality`,
          price: '$39.99',
          url: 'https://example.com/item2',
          image: 'https://via.placeholder.com/150',
          platform: 'Nordstrom'
        }
      ];

      return mockItems;
    } catch (error) {
      console.error('Error finding similar items:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [user]);

  return {
    integrations,
    loading,
    updateIntegration,
    getIntegration,
    getWeatherRecommendations,
    getUpcomingEvents,
    shareOutfit,
    findSimilarItems,
    refreshIntegrations: fetchIntegrations
  };
};