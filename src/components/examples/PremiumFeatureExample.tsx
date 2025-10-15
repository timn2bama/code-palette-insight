/**
 * EXAMPLE: How to use Premium Feature Gating in your components
 * 
 * This file demonstrates different patterns for implementing premium features
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeatureGate } from '@/components/FeatureGate';
import { UsageLimitBadge } from '@/components/UsageLimitBadge';
import { usePremiumFeature, useUsageLimit } from '@/hooks/usePremiumFeature';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Sparkles, Camera, Brain } from 'lucide-react';
import { toast } from 'sonner';

// ========================================
// PATTERN 1: Wrap entire feature with FeatureGate
// ========================================
export function Pattern1_WrapFeature() {
  return (
    <FeatureGate feature="ai_outfit_suggestions">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI Outfit Suggestions</h3>
        <p>Get personalized outfit recommendations...</p>
        {/* Your premium feature UI here */}
      </Card>
    </FeatureGate>
  );
}

// ========================================
// PATTERN 2: Check access before performing action
// ========================================
export function Pattern2_CheckOnAction() {
  const { requireFeature, showUpgradeModal, setShowUpgradeModal } = usePremiumFeature('social_sharing');

  const handleShare = async () => {
    // Will automatically show upgrade modal if user doesn't have access
    await requireFeature(async () => {
      // This code only runs if user has access
      toast.success('Shared to social!');
      // Perform the actual sharing logic here
    });
  };

  return (
    <>
      <Button onClick={handleShare} className="gap-2">
        <Sparkles className="h-4 w-4" />
        Share Outfit
      </Button>
      
      <UpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="social_sharing"
      />
    </>
  );
}

// ========================================
// PATTERN 3: Usage limits (for AI requests, uploads, etc.)
// ========================================
export function Pattern3_UsageLimits() {
  const { requireLimit, showUpgradeModal, setShowUpgradeModal } = useUsageLimit('ai_recommendations');

  const handleGenerateOutfit = async () => {
    // Check if user has remaining usage
    await requireLimit(async () => {
      // This code only runs if user has remaining usage
      toast.success('Generating outfit...');
      // Call your AI service here
      // Don't forget to track the usage after success:
      // await trackUsage('ai_recommendations');
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <UsageLimitBadge usageType="ai_recommendations" label="AI Suggestions" />
      </div>

      <Button onClick={handleGenerateOutfit} className="gap-2">
        <Brain className="h-4 w-4" />
        Generate AI Outfit
      </Button>

      <UpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="ai_outfit_suggestions"
      />
    </div>
  );
}

// ========================================
// PATTERN 4: Show locked state with upgrade button
// ========================================
export function Pattern4_LockedState() {
  return (
    <Card className="p-6 relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
        <FeatureGate feature="advanced_analytics" showButton>
          <div />
        </FeatureGate>
      </div>
      
      {/* Blurred/grayed out content */}
      <div className="opacity-50 pointer-events-none">
        <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    </Card>
  );
}

// ========================================
// PATTERN 5: Conditional rendering based on tier
// ========================================
export function Pattern5_ConditionalRender() {
  const { checkAccess, showUpgradeModal, setShowUpgradeModal } = usePremiumFeature('marketplace_access');
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess().then(setHasAccess);
  }, [checkAccess]);

  if (!hasAccess) {
    return (
      <>
        <Card className="p-6 border-dashed">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Unlock Marketplace Access</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Buy, sell, and discover unique fashion items from the community
              </p>
              <Button onClick={() => setShowUpgradeModal(true)}>
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </Card>

        <UpgradeModal 
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          feature="marketplace_access"
        />
      </>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Marketplace</h3>
      {/* Full marketplace UI for premium users */}
      <p>Browse and list items...</p>
    </Card>
  );
}

// ========================================
// PATTERN 6: Multiple usage types in one component
// ========================================
export function Pattern6_MultipleUsageTypes() {
  const aiLimit = useUsageLimit('ai_recommendations');
  const uploadLimit = useUsageLimit('photo_uploads');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <UsageLimitBadge usageType="ai_recommendations" />
        <UsageLimitBadge usageType="photo_uploads" />
        <UsageLimitBadge usageType="outfit_generations" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={async () => {
            await aiLimit.requireLimit(async () => {
              toast.success('AI processing...');
            });
          }}
          className="gap-2"
        >
          <Brain className="h-4 w-4" />
          AI Analysis
        </Button>

        <Button 
          onClick={async () => {
            await uploadLimit.requireLimit(async () => {
              toast.success('Upload started...');
            });
          }}
          className="gap-2"
        >
          <Camera className="h-4 w-4" />
          Upload Photo
        </Button>
      </div>

      {/* Separate modals for each feature */}
      <UpgradeModal 
        open={aiLimit.showUpgradeModal}
        onOpenChange={aiLimit.setShowUpgradeModal}
        feature="ai_outfit_suggestions"
      />
      <UpgradeModal 
        open={uploadLimit.showUpgradeModal}
        onOpenChange={uploadLimit.setShowUpgradeModal}
        feature="unlimited_wardrobe"
      />
    </div>
  );
}

// ========================================
// HOW TO TRACK USAGE AFTER SUCCESSFUL OPERATION
// ========================================
export function TrackUsageExample() {
  const { requireLimit } = useUsageLimit('ai_recommendations');

  const generateOutfit = async () => {
    await requireLimit(async () => {
      try {
        // 1. Perform your operation (AI call, upload, etc.)
        const result = await fetch('/api/generate-outfit');
        
        // 2. Track usage AFTER success
        if (result.ok) {
          // Import and use the hook from useSubscriptionTiers
          // const { trackUsage } = useSubscriptionTiers();
          // await trackUsage('ai_recommendations', 1);
        }
      } catch (error) {
        toast.error('Failed to generate outfit');
      }
    });
  };

  return <Button onClick={generateOutfit}>Generate</Button>;
}
