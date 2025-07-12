import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSecureSession } from '@/hooks/useSecureSession';
import { useAuth } from '@/contexts/AuthContext';

export function SecurityStatus() {
  const { user } = useAuth();
  const { isNearExpiry, getTimeUntilTimeout } = useSecureSession();
  const [securityScore, setSecurityScore] = useState(100);

  useEffect(() => {
    if (!user) return;

    let score = 100;
    
    // Check session status
    if (isNearExpiry) {
      score -= 20;
    }
    
    // Check if HTTPS is enabled
    if (location.protocol !== 'https:') {
      score -= 30;
    }
    
    // Check if running in development mode
    if (import.meta.env.DEV) {
      score -= 10;
    }

    setSecurityScore(score);
  }, [user, isNearExpiry]);

  if (!user) return null;

  const getSecurityIcon = () => {
    if (securityScore >= 90) return <ShieldCheck className="h-4 w-4 text-green-500" />;
    if (securityScore >= 70) return <Shield className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getSecurityVariant = () => {
    if (securityScore >= 90) return "default";
    if (securityScore >= 70) return "secondary";
    return "destructive";
  };

  const formatTimeRemaining = () => {
    const timeLeft = getTimeUntilTimeout();
    const minutes = Math.floor(timeLeft / 60000);
    return `${minutes}m`;
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge variant={getSecurityVariant()} className="flex items-center gap-1">
        {getSecurityIcon()}
        Security: {securityScore}%
      </Badge>
      
      {isNearExpiry && (
        <Badge variant="outline" className="text-yellow-600">
          Session: {formatTimeRemaining()}
        </Badge>
      )}
    </div>
  );
}