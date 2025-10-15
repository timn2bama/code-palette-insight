export type PremiumFeature = 
  | 'ai_outfit_suggestions'
  | 'weather_integration'
  | 'social_sharing'
  | 'marketplace_access'
  | 'advanced_analytics'
  | 'personal_stylist'
  | 'unlimited_wardrobe'
  | 'sustainability_tracking'
  | 'rental_marketplace'
  | 'team_collaboration';

export interface SubscriptionTier {
  id: string;
  name: string;
  tier_name: string;
  price_monthly: number;
  price_yearly: number;
  features: PremiumFeature[];
  limits: {
    ai_recommendations_per_month: number;
    photo_uploads_per_month: number;
    outfit_generations_per_month: number;
    max_wardrobe_items: number;
    collaborator_limit: number;
  };
  advanced_analytics: boolean;
  personal_stylist: boolean;
  is_active: boolean;
}

export interface UsageData {
  ai_recommendations: number;
  photo_uploads: number;
  outfit_generations: number;
}

export interface UpgradeModalData {
  feature: PremiumFeature;
  featureName: string;
  benefits: string[];
  currentTier: string;
  recommendedTier: SubscriptionTier | null;
  trialAvailable: boolean;
}
