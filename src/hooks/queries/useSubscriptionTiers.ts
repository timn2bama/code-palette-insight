import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionTier {
  id: string;
  tier_name: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  limits: any;
  is_active: boolean;
}

interface UsageStats {
  ai_recommendations: number;
  photo_uploads: number;
  outfit_generations: number;
}

export const useSubscriptionTiers = () => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    ai_recommendations: 0,
    photo_uploads: 0,
    outfit_generations: 0
  });
  const [loading, setLoading] = useState(true);
  const { user, subscriptionStatus } = useAuth();

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setTiers(data || []);

      // Determine current tier based on subscription status
      if (subscriptionStatus.subscribed && subscriptionStatus.subscription_tier) {
        const current = data?.find(tier => 
          tier.tier_name.toLowerCase() === subscriptionStatus.subscription_tier?.toLowerCase()
        );
        setCurrentTier(current || null);
      } else {
        const freeTier = data?.find(tier => tier.tier_name.toLowerCase() === 'free');
        setCurrentTier(freeTier || null);
      }
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
    }
  };

  const fetchUsageStats = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('usage_type, usage_count')
        .eq('user_id', user.id)
        .gte('billing_period_start', startOfMonth.toISOString())
        .lte('billing_period_end', endOfMonth.toISOString());

      if (error) throw error;

      const stats = data?.reduce((acc, item) => {
        acc[item.usage_type as keyof UsageStats] = (acc[item.usage_type as keyof UsageStats] || 0) + item.usage_count;
        return acc;
      }, {
        ai_recommendations: 0,
        photo_uploads: 0,
        outfit_generations: 0
      } as UsageStats) || {
        ai_recommendations: 0,
        photo_uploads: 0,
        outfit_generations: 0
      };

      setUsageStats(stats);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const trackUsage = async (usageType: keyof UsageStats, count = 1) => {
    if (!user) return;

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await supabase.from('usage_tracking').insert({
        user_id: user.id,
        usage_type: usageType,
        usage_count: count,
        billing_period_start: startOfMonth.toISOString(),
        billing_period_end: endOfMonth.toISOString()
      });

      // Update local stats
      setUsageStats(prev => ({
        ...prev,
        [usageType]: prev[usageType] + count
      }));
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  const checkUsageLimit = (usageType: keyof UsageStats): boolean => {
    if (!currentTier) return false;

    const limit = currentTier.limits[`${usageType}_per_month`];
    if (limit === -1) return true; // Unlimited
    
    return usageStats[usageType] < limit;
  };

  const getRemainingUsage = (usageType: keyof UsageStats): number | null => {
    if (!currentTier) return null;

    const limit = currentTier.limits[`${usageType}_per_month`];
    if (limit === -1) return null; // Unlimited
    
    return Math.max(0, limit - usageStats[usageType]);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTiers(), fetchUsageStats()]).finally(() => {
      setLoading(false);
    });
  }, [user, subscriptionStatus]);

  return {
    tiers,
    currentTier,
    usageStats,
    loading,
    trackUsage,
    checkUsageLimit,
    getRemainingUsage,
    refreshData: () => Promise.all([fetchTiers(), fetchUsageStats()])
  };
};