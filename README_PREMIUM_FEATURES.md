# Premium Feature Gating System

Complete subscription-based feature gating system for SyncStyle. This implementation provides a flexible, secure way to manage premium features and usage limits.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Feature Gates](#feature-gates)
4. [Usage Limits](#usage-limits)
5. [Components](#components)
6. [Hooks](#hooks)
7. [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

### Core Components

```
┌─────────────────────────────────────────┐
│         Frontend Components             │
│  ┌────────────┐  ┌──────────────────┐  │
│  │FeatureGate │  │  UpgradeModal    │  │
│  └────────────┘  └──────────────────┘  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│            React Hooks                  │
│  ┌──────────────────┐  ┌─────────────┐ │
│  │usePremiumFeature │  │useUsageLimit│ │
│  └──────────────────┘  └─────────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Business Logic Layer            │
│     premiumFeatureGate.ts               │
│  - checkFeatureAccess()                 │
│  - checkUsageLimit()                    │
│  - getUpgradePromptData()               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          Supabase Database              │
│  - subscribers                          │
│  - subscription_tiers                   │
│  - usage_tracking                       │
└─────────────────────────────────────────┘
```

### Database Schema

**subscribers** - User subscription status
```sql
- user_id: uuid (references auth.users)
- subscription_tier: text (free, pro, premium, enterprise)
- subscribed: boolean
- subscription_end: timestamp
- stripe_customer_id: text
```

**subscription_tiers** - Available subscription plans
```sql
- id: uuid
- tier_name: text
- price_monthly: number
- price_yearly: number
- features: jsonb (array of PremiumFeature)
- limits: jsonb {
    ai_recommendations_per_month: number (-1 = unlimited)
    photo_uploads_per_month: number
    outfit_generations_per_month: number
    max_wardrobe_items: number
    collaborator_limit: number
  }
- is_active: boolean
```

**usage_tracking** - Monthly usage tracking
```sql
- user_id: uuid
- usage_type: text (ai_recommendations, photo_uploads, outfit_generations)
- usage_count: number
- billing_period_start: timestamp
- billing_period_end: timestamp
```

---

## 🚀 Quick Start

### 1. Define Your Premium Features

Edit `src/types/premium.ts`:

```typescript
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
  | 'team_collaboration'
  | 'your_new_feature'; // Add your feature here
```

### 2. Configure Feature Metadata

Edit `src/lib/premiumFeatureGate.ts`:

```typescript
private featureMetadata: Record<PremiumFeature, {...}> = {
  your_new_feature: {
    name: 'Your Feature Name',
    benefits: [
      'Benefit 1',
      'Benefit 2',
      'Benefit 3',
    ],
    requiredTier: 'premium', // or 'pro', 'enterprise'
  },
};
```

### 3. Populate Subscription Tiers (One-time Setup)

Create seed data in your database:

```sql
INSERT INTO subscription_tiers (tier_name, price_monthly, price_yearly, features, limits, is_active) VALUES
('free', 0, 0, 
  '["social_sharing"]'::jsonb,
  '{"ai_recommendations_per_month": 5, "photo_uploads_per_month": 3, "outfit_generations_per_month": 3, "max_wardrobe_items": 50, "collaborator_limit": 0}'::jsonb,
  true
),
('pro', 9.99, 99.99,
  '["ai_outfit_suggestions", "social_sharing", "weather_integration", "sustainability_tracking"]'::jsonb,
  '{"ai_recommendations_per_month": 100, "photo_uploads_per_month": 50, "outfit_generations_per_month": 50, "max_wardrobe_items": 500, "collaborator_limit": 3}'::jsonb,
  true
),
('premium', 19.99, 199.99,
  '["ai_outfit_suggestions", "social_sharing", "weather_integration", "marketplace_access", "advanced_analytics", "unlimited_wardrobe", "sustainability_tracking", "rental_marketplace"]'::jsonb,
  '{"ai_recommendations_per_month": -1, "photo_uploads_per_month": -1, "outfit_generations_per_month": -1, "max_wardrobe_items": -1, "collaborator_limit": 10}'::jsonb,
  true
),
('enterprise', 49.99, 499.99,
  '["ai_outfit_suggestions", "social_sharing", "weather_integration", "marketplace_access", "advanced_analytics", "personal_stylist", "unlimited_wardrobe", "sustainability_tracking", "rental_marketplace", "team_collaboration"]'::jsonb,
  '{"ai_recommendations_per_month": -1, "photo_uploads_per_month": -1, "outfit_generations_per_month": -1, "max_wardrobe_items": -1, "collaborator_limit": -1}'::jsonb,
  true
);
```

---

## 🔒 Feature Gates

### Pattern 1: Wrap Component (Recommended for entire features)

```tsx
import { FeatureGate } from '@/components/FeatureGate';

export function MyPremiumFeature() {
  return (
    <FeatureGate feature="ai_outfit_suggestions">
      <div>Your premium feature UI here</div>
    </FeatureGate>
  );
}
```

### Pattern 2: Check on Action (Recommended for buttons/actions)

```tsx
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { UpgradeModal } from '@/components/UpgradeModal';

export function ShareButton() {
  const { requireFeature, showUpgradeModal, setShowUpgradeModal } = 
    usePremiumFeature('social_sharing');

  const handleShare = async () => {
    await requireFeature(async () => {
      // This only runs if user has access
      console.log('Sharing outfit...');
    });
  };

  return (
    <>
      <Button onClick={handleShare}>Share</Button>
      <UpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="social_sharing"
      />
    </>
  );
}
```

### Pattern 3: Locked State with Blur

```tsx
import { FeatureGate } from '@/components/FeatureGate';

export function LockedFeature() {
  return (
    <Card className="relative">
      {/* Overlay with upgrade button */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <FeatureGate feature="advanced_analytics" showButton />
      </div>
      
      {/* Blurred content */}
      <div className="opacity-50 pointer-events-none">
        <h3>Analytics Dashboard</h3>
        {/* Your UI */}
      </div>
    </Card>
  );
}
```

---

## 📊 Usage Limits

### Track and Limit AI Requests, Uploads, etc.

```tsx
import { useUsageLimit } from '@/hooks/usePremiumFeature';
import { useSubscriptionTiers } from '@/hooks/queries/useSubscriptionTiers';
import { UsageLimitBadge } from '@/components/UsageLimitBadge';

export function AIFeature() {
  const { requireLimit, showUpgradeModal, setShowUpgradeModal } = 
    useUsageLimit('ai_recommendations');
  const { trackUsage } = useSubscriptionTiers();

  const generateOutfit = async () => {
    await requireLimit(async () => {
      // Perform AI operation
      const result = await callAIService();
      
      // Track usage after success
      if (result.success) {
        await trackUsage('ai_recommendations', 1);
      }
    });
  };

  return (
    <div>
      <UsageLimitBadge usageType="ai_recommendations" />
      <Button onClick={generateOutfit}>Generate Outfit</Button>
      <UpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="ai_outfit_suggestions"
      />
    </div>
  );
}
```

### Display Usage Badges

```tsx
import { UsageLimitBadge } from '@/components/UsageLimitBadge';

export function Dashboard() {
  return (
    <div className="flex gap-2">
      <UsageLimitBadge usageType="ai_recommendations" />
      <UsageLimitBadge usageType="photo_uploads" />
      <UsageLimitBadge usageType="outfit_generations" />
    </div>
  );
}
```

---

## 🧩 Components

### `<FeatureGate />`

Wraps premium features and shows upgrade modal when accessed.

**Props:**
- `feature: PremiumFeature` - The feature to gate
- `children: ReactNode` - Content to show (for free/premium users)
- `fallback?: ReactNode` - Alternative content for free users
- `showButton?: boolean` - Show upgrade button instead of children

### `<UpgradeModal />`

Beautiful modal showing upgrade benefits and pricing.

**Props:**
- `open: boolean` - Modal visibility
- `onOpenChange: (open: boolean) => void` - Close handler
- `feature: PremiumFeature` - Feature being promoted

### `<UsageLimitBadge />`

Shows remaining usage for a usage type.

**Props:**
- `usageType: 'ai_recommendations' | 'photo_uploads' | 'outfit_generations'`
- `label?: string` - Custom label (defaults to formatted usageType)

---

## 🎣 Hooks

### `usePremiumFeature(feature)`

Check if user has access to a premium feature.

```tsx
const {
  checkAccess,       // () => Promise<boolean>
  requireFeature,    // (callback) => Promise<void>
  isChecking,        // boolean
  showUpgradeModal,  // boolean
  setShowUpgradeModal // (show: boolean) => void
} = usePremiumFeature('ai_outfit_suggestions');
```

### `useUsageLimit(usageType)`

Check and enforce usage limits.

```tsx
const {
  checkLimit,        // () => Promise<{allowed: boolean, remaining: number|null}>
  requireLimit,      // (callback) => Promise<void>
  isChecking,        // boolean
  showUpgradeModal,  // boolean
  setShowUpgradeModal // (show: boolean) => void
} = useUsageLimit('ai_recommendations');
```

---

## ✅ Best Practices

### 1. **Always Track Usage After Success**

```tsx
// ❌ Wrong - tracking before operation
await trackUsage('ai_recommendations');
const result = await callAI(); // This might fail

// ✅ Correct - track after success
const result = await callAI();
if (result.success) {
  await trackUsage('ai_recommendations', 1);
}
```

### 2. **Use Appropriate Pattern for Your Use Case**

- **Entire Feature?** → Use `<FeatureGate>` wrapper
- **Single Action?** → Use `requireFeature()` or `requireLimit()`
- **Show Locked UI?** → Use `showButton` prop with blur overlay

### 3. **Provide Good UX**

```tsx
// Show usage badges
<UsageLimitBadge usageType="ai_recommendations" />

// Disable buttons when out of usage
<Button 
  disabled={!hasRemainingUsage}
  onClick={handleAction}
>
  Generate ({remaining} left)
</Button>
```

### 4. **Handle Edge Cases**

```tsx
const { requireFeature } = usePremiumFeature('marketplace_access');

const handleAction = async () => {
  await requireFeature(async () => {
    try {
      await performAction();
      toast.success('Success!');
    } catch (error) {
      toast.error('Something went wrong');
    }
  });
};
```

### 5. **Test All Tiers**

Make sure to test your features with:
- Free tier (limited access)
- Pro tier (moderate access)
- Premium tier (full access)
- Enterprise tier (unlimited)

---

## 📚 Examples

See `src/components/examples/PremiumFeatureExample.tsx` for 6 detailed implementation patterns.

---

## 🔧 Customization

### Add New Usage Type

1. Update `UsageData` in `src/types/premium.ts`
2. Update subscription tier limits in database
3. Add tracking logic where the usage occurs
4. Use `useUsageLimit('your_new_usage_type')`

### Modify Tier Benefits

Edit the `featureMetadata` object in `src/lib/premiumFeatureGate.ts` to customize:
- Feature names
- Benefits list
- Required tier level

---

## 🚨 Security Notes

- ✅ All checks are server-side via Supabase RLS
- ✅ Frontend checks are UX only (can be bypassed, but backend enforces)
- ✅ Never trust client-side premium status for security-critical operations
- ✅ Always revalidate on backend for important actions

---

## 📞 Support

For questions or issues, refer to:
- `src/components/examples/PremiumFeatureExample.tsx` - Implementation examples
- Database schema in `supabase/migrations/`
- This README

Happy coding! 🎉
