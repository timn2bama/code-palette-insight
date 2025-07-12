import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Shield, Lock, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecureSession } from '@/hooks/useSecureSession';

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warning' | 'fail';
  score: number;
  recommendation?: string;
}

export function SecurityDashboard() {
  const { user } = useAuth();
  const { sessionState, extendSession } = useSecureSession();
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (!user) return;

    const checks: SecurityCheck[] = [
      {
        id: 'https',
        name: 'Secure Connection',
        description: 'Your connection is encrypted with HTTPS',
        status: location.protocol === 'https:' ? 'pass' : 'fail',
        score: location.protocol === 'https:' ? 25 : 0,
        recommendation: location.protocol !== 'https:' ? 'Always access SyncStyle through HTTPS' : undefined
      },
      {
        id: 'session',
        name: 'Session Security',
        description: 'Your session is actively managed',
        status: sessionState.isActive ? 'pass' : 'warning',
        score: sessionState.isActive ? 25 : 10,
        recommendation: !sessionState.isActive ? 'Your session has expired. Please log in again.' : undefined
      },
      {
        id: 'browser',
        name: 'Browser Security',
        description: 'Modern browser with security features',
        status: checkBrowserSecurity() ? 'pass' : 'warning',
        score: checkBrowserSecurity() ? 25 : 15,
        recommendation: !checkBrowserSecurity() ? 'Consider updating to a modern browser for better security' : undefined
      },
      {
        id: 'environment',
        name: 'Environment Security',
        description: 'Application security configuration',
        status: import.meta.env.PROD ? 'pass' : 'warning',
        score: import.meta.env.PROD ? 25 : 20,
        recommendation: !import.meta.env.PROD ? 'Development mode detected - some security features may be reduced' : undefined
      }
    ];

    setSecurityChecks(checks);
    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);
    setOverallScore(totalScore);
  }, [user, sessionState]);

  const checkBrowserSecurity = () => {
    // Check for modern browser features
    return !!(window.crypto && window.crypto.subtle && 
             typeof navigator.sendBeacon === 'function' &&
             'serviceWorker' in navigator);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Dashboard
            </div>
            <Badge variant={getScoreVariant(overallScore)} className={getScoreColor(overallScore)}>
              Security Score: {overallScore}%
            </Badge>
          </CardTitle>
          <CardDescription>
            Monitor your account security and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Security Score</span>
              <span className={getScoreColor(overallScore)}>{overallScore}%</span>
            </div>
            <Progress value={overallScore} className="h-2" />
          </div>

          {/* Security Checks */}
          <div className="space-y-4">
            <h4 className="font-medium">Security Checks</h4>
            {securityChecks.map((check) => (
              <div key={check.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h5 className="font-medium">{check.name}</h5>
                    <p className="text-sm text-muted-foreground">{check.description}</p>
                    {check.recommendation && (
                      <p className="text-xs text-yellow-600 mt-1">{check.recommendation}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {check.score} pts
                </Badge>
              </div>
            ))}
          </div>

          {/* Session Information */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Session Information
              </h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={extendSession}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Extend Session
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Session Status:</span>
                <span className={`ml-2 font-medium ${sessionState.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {sessionState.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Activity:</span>
                <span className="ml-2 font-medium">
                  {new Date(sessionState.lastActivity).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Security Tips
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Keep your browser updated for the latest security features</li>
              <li>• Use a strong, unique password for your SyncStyle account</li>
              <li>• Log out when using shared or public computers</li>
              <li>• Regularly review your account activity and data</li>
              <li>• Enable two-factor authentication when available</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}