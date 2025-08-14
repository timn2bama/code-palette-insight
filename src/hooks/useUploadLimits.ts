import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, app } from "@/integrations/firebase/client";
import { ref, get } from "firebase/database";
import { getFunctions, httpsCallable } from "firebase/functions";

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
  const { user, subscriptionStatus } = useAuth(); // Use subscriptionStatus from AuthContext

  const checkLimits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Get current category counts from Firebase
      const itemsRef = ref(db, `wardrobe_items/${user.uid}`);
      const snapshot = await get(itemsRef);
      let items: any[] = [];
      if (snapshot.exists()) {
        items = Object.values(snapshot.val());
      }

      const counts = items.reduce((acc: { [key: string]: number }, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      const categoryCountsArray = Object.entries(counts).map(([category, count]) => ({
        category,
        count: count as number
      }));
      setCategoryCounts(categoryCountsArray);

      // Use the subscription status from AuthContext
      const isSubscribed = subscriptionStatus.subscribed;
      setUploadLimits({
        maxUploadsPerCategory: isSubscribed ? Infinity : 4,
        isUnlimited: isSubscribed
      });
    } catch (error) {
      console.error('Error checking upload limits:', error);
    } finally {
      setLoading(false);
    }
  }, [user, subscriptionStatus]);

  useEffect(() => {
    checkLimits();
  }, [checkLimits]);

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