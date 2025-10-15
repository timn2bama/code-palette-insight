import { ReactNode } from 'react';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { UpgradeModal } from './UpgradeModal';
import type { PremiumFeature } from '@/types/premium';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  feature: PremiumFeature;
  children: ReactNode;
  fallback?: ReactNode;
  showButton?: boolean;
}

/**
 * FeatureGate component - Wraps premium features and shows upgrade prompt if needed
 * 
 * @example
 * <FeatureGate feature="ai_outfit_suggestions">
 *   <AIOutfitSuggestions />
 * </FeatureGate>
 */
export function FeatureGate({ feature, children, fallback, showButton = false }: FeatureGateProps) {
  const { checkAccess, showUpgradeModal, setShowUpgradeModal } = usePremiumFeature(feature);

  const handleClick = async () => {
    await checkAccess();
  };

  if (showButton) {
    return (
      <>
        <Button onClick={handleClick} variant="outline" className="gap-2">
          <Lock className="h-4 w-4" />
          Unlock Premium Feature
        </Button>
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          feature={feature}
        />
      </>
    );
  }

  return (
    <>
      {fallback || children}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature={feature}
      />
    </>
  );
}
