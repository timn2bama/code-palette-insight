import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface OutfitWearLog {
  outfit_id?: string;
  items_worn: Array<{
    item_id: string;
    name: string;
    category: string;
    color?: string;
    brand?: string;
  }>;
  worn_date?: Date;
  location?: string;
  weather_temp?: number;
  weather_condition?: string;
  occasion?: string;
  mood_tags?: string[];
  comfort_rating?: number;
  style_satisfaction?: number;
  would_wear_again?: boolean;
  notes?: string;
}

export function useOutfitLogging() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const logOutfitWorn = useCallback(async (logData: OutfitWearLog) => {
    if (!user) {
      toast.error('Please sign in to log outfits');
      return false;
    }

    setLoading(true);
    try {
      // 1. Insert wear log
      const { data: wearLog, error: logError } = await supabase
        .from('outfit_wear_logs')
        .insert({
          user_id: user.id,
          ...logData,
          worn_date: logData.worn_date ? new Date(logData.worn_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (logError) throw logError;

      // 2. Update wear_count and last_worn for each item
      const updatePromises = logData.items_worn.map(item =>
        supabase.rpc('increment_item_wear_count', {
          item_id: item.item_id,
          worn_date: logData.worn_date ? new Date(logData.worn_date).toISOString() : new Date().toISOString()
        })
      );

      await Promise.all(updatePromises);

      // 3. If linked to an outfit, update the outfit's metadata
      if (logData.outfit_id) {
        await supabase
          .from('outfits')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', logData.outfit_id);
      }

      toast.success('Outfit logged successfully! 👔');
      return true;
    } catch (error) {
      console.error('Error logging outfit:', error);
      toast.error('Failed to log outfit');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getWearHistory = useCallback(async (daysBack: number = 90) => {
    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const { data, error } = await supabase
      .from('outfit_wear_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('worn_date', startDate.toISOString().split('T')[0])
      .order('worn_date', { ascending: false });

    if (error) {
      console.error('Error fetching wear history:', error);
      return [];
    }

    return data || [];
  }, [user]);

  const updateWearLogFeedback = useCallback(async (
    logId: string,
    feedback: Partial<Pick<OutfitWearLog, 'comfort_rating' | 'style_satisfaction' | 'would_wear_again' | 'notes'>>
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('outfit_wear_logs')
        .update(feedback)
        .eq('id', logId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Feedback recorded!');
      return true;
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to record feedback');
      return false;
    }
  }, [user]);

  return {
    logOutfitWorn,
    getWearHistory,
    updateWearLogFeedback,
    loading,
  };
}
