import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { premiumFeatureGate } from '@/lib/premiumFeatureGate';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface UsageLimitBadgeProps {
  usageType: 'ai_recommendations' | 'photo_uploads' | 'outfit_generations';
  label?: string;
}

export function UsageLimitBadge({ usageType, label }: UsageLimitBadgeProps) {
  const { user } = useAuth();
  const [usage, setUsage] = useState<{ allowed: boolean; remaining: number | null } | null>(null);

  useEffect(() => {
    if (user) {
      premiumFeatureGate.checkUsageLimit(user.id, usageType).then(setUsage);
    }
  }, [user, usageType]);

  if (!usage) {
    return null;
  }

  const displayLabel = label || usageType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (usage.remaining === null) {
    return (
      <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
        <CheckCircle className="h-3 w-3" />
        {displayLabel}: Unlimited
      </Badge>
    );
  }

  const isLow = usage.remaining <= 3;
  const isOut = usage.remaining === 0;

  return (
    <Badge 
      variant={isOut ? "destructive" : isLow ? "default" : "secondary"} 
      className={`gap-1 ${isLow && !isOut ? 'bg-orange-500/10 text-orange-600' : ''}`}
    >
      {isLow && <AlertCircle className="h-3 w-3" />}
      {displayLabel}: {usage.remaining} left
    </Badge>
  );
}
