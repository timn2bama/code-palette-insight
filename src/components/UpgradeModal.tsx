import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { premiumFeatureGate } from '@/lib/premiumFeatureGate';
import type { PremiumFeature, UpgradeModalData } from '@/types/premium';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: PremiumFeature;
}

export function UpgradeModal({ open, onOpenChange, feature }: UpgradeModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upgradeData, setUpgradeData] = useState<UpgradeModalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      premiumFeatureGate.getUpgradePromptData(user.id, feature).then((data) => {
        setUpgradeData(data);
        setLoading(false);
      });
    }
  }, [open, user, feature]);

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/subscription');
  };

  if (!upgradeData && !loading) {
    return null;
  }

  const tierColor = upgradeData?.recommendedTier?.tier_name === 'premium' 
    ? 'from-purple-500 to-pink-500'
    : upgradeData?.recommendedTier?.tier_name === 'enterprise'
    ? 'from-amber-500 to-orange-500'
    : 'from-blue-500 to-cyan-500';

  const tierIcon = upgradeData?.recommendedTier?.tier_name === 'premium'
    ? Sparkles
    : upgradeData?.recommendedTier?.tier_name === 'enterprise'
    ? TrendingUp
    : Zap;

  const TierIcon = tierIcon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className={`inline-flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r ${tierColor} w-fit mb-2`}>
            <TierIcon className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-2xl">
            Unlock {upgradeData?.featureName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Upgrade to unlock this premium feature and get access to:
              </p>
              <ul className="space-y-2">
                {upgradeData?.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {upgradeData?.recommendedTier && (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold capitalize">
                      {upgradeData.recommendedTier.tier_name} Plan
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Recommended for you
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${upgradeData.recommendedTier.price_monthly}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      or ${upgradeData.recommendedTier.price_yearly}/year
                    </div>
                  </div>
                </div>

                {upgradeData.trialAvailable && (
                  <Badge variant="secondary" className="mb-3">
                    🎉 7-day free trial available
                  </Badge>
                )}

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>AI Recommendations</span>
                    <span className="font-medium text-foreground">
                      {upgradeData.recommendedTier.limits.ai_recommendations_per_month === -1 
                        ? 'Unlimited' 
                        : `${upgradeData.recommendedTier.limits.ai_recommendations_per_month}/month`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wardrobe Items</span>
                    <span className="font-medium text-foreground">
                      {upgradeData.recommendedTier.limits.max_wardrobe_items === -1 
                        ? 'Unlimited' 
                        : upgradeData.recommendedTier.limits.max_wardrobe_items}
                    </span>
                  </div>
                  {upgradeData.recommendedTier.advanced_analytics && (
                    <div className="flex items-center justify-between">
                      <span>Advanced Analytics</span>
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  {upgradeData.recommendedTier.personal_stylist && (
                    <div className="flex items-center justify-between">
                      <span>Personal Stylist</span>
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpgrade} className="flex-1">
                {upgradeData?.trialAvailable ? 'Start Free Trial' : 'Upgrade Now'}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Maybe Later
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              You're currently on the <span className="font-medium capitalize">{upgradeData?.currentTier}</span> plan
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
