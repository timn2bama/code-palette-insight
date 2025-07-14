import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UploadLimits {
  maxUploadsPerCategory: number;
  isUnlimited: boolean;
}

interface CategoryCount {
  category: string;
  count: number;
}

export const useUploadLimits = () => {
  const [uploadLimits, setUploadLimits] = useState<UploadLimits>({
    maxUploadsPerCategory: 4,
    isUnlimited: false
  });
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const checkSubscriptionAndLimits = async () => {
    if (!user) return;

    try {
      // Check subscription status
      const { data: subData } = await supabase.functions.invoke('check-subscription');
      const isSubscribed = subData?.subscribed || false;

      // Get current category counts
      const { data: items, error } = await supabase
        .from('wardrobe_items')
        .select('category')
        .eq('user_id', user.id);

      if (error) throw error;

      // Count items per category
      const counts = items?.reduce((acc: { [key: string]: number }, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}) || {};

      const categoryCountsArray = Object.entries(counts).map(([category, count]) => ({
        category,
        count: count as number
      }));

      setUploadLimits({
        maxUploadsPerCategory: isSubscribed ? Infinity : 4,
        isUnlimited: isSubscribed
      });
      setCategoryCounts(categoryCountsArray);
    } catch (error) {
      console.error('Error checking upload limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUploadToCategory = (category: string): boolean => {
    if (uploadLimits.isUnlimited) return true;
    
    const categoryCount = categoryCounts.find(c => c.category === category)?.count || 0;
    return categoryCount < uploadLimits.maxUploadsPerCategory;
  };

  const getCategoryUsage = (category: string): { used: number; limit: number } => {
    const used = categoryCounts.find(c => c.category === category)?.count || 0;
    return {
      used,
      limit: uploadLimits.isUnlimited ? Infinity : uploadLimits.maxUploadsPerCategory
    };
  };

  useEffect(() => {
    checkSubscriptionAndLimits();
  }, [user]);

  return {
    uploadLimits,
    categoryCounts,
    loading,
    canUploadToCategory,
    getCategoryUsage,
    refreshLimits: checkSubscriptionAndLimits
  };
};