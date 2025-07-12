import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SESSION_WARNING_TIME = 25 * 60 * 1000; // 25 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

interface SessionState {
  lastActivity: number;
  warningShown: boolean;
  isActive: boolean;
}

export function useSecureSession() {
  const { user, signOut } = useAuth();
  const [sessionState, setSessionState] = useState<SessionState>({
    lastActivity: Date.now(),
    warningShown: false,
    isActive: true
  });
  
  const activityTimerRef = useRef<NodeJS.Timeout>();
  const warningTimerRef = useRef<NodeJS.Timeout>();
  const timeoutTimerRef = useRef<NodeJS.Timeout>();

  const updateActivity = () => {
    const now = Date.now();
    setSessionState(prev => ({
      ...prev,
      lastActivity: now,
      warningShown: false,
      isActive: true
    }));
    
    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    
    if (user) {
      // Set warning timer
      warningTimerRef.current = setTimeout(() => {
        setSessionState(prev => ({ ...prev, warningShown: true }));
        toast.warning('Session will expire in 5 minutes due to inactivity', {
          duration: 10000,
          action: {
            label: 'Stay logged in',
            onClick: updateActivity
          }
        });
      }, SESSION_WARNING_TIME);
      
      // Set timeout timer
      timeoutTimerRef.current = setTimeout(async () => {
        toast.error('Session expired due to inactivity. Please log in again.');
        await signOut();
        setSessionState(prev => ({ ...prev, isActive: false }));
      }, SESSION_TIMEOUT);
    }
  };

  const handleActivity = () => {
    updateActivity();
  };

  useEffect(() => {
    if (user) {
      // Initialize activity tracking
      updateActivity();
      
      // Add activity listeners
      ACTIVITY_EVENTS.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
      });
      
      // Track page visibility changes
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          updateActivity();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        // Clean up listeners
        ACTIVITY_EVENTS.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        
        // Clear timers
        if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      };
    }
  }, [user]);

  const extendSession = () => {
    updateActivity();
  };

  const getTimeUntilWarning = () => {
    const timeSinceActivity = Date.now() - sessionState.lastActivity;
    return Math.max(0, SESSION_WARNING_TIME - timeSinceActivity);
  };

  const getTimeUntilTimeout = () => {
    const timeSinceActivity = Date.now() - sessionState.lastActivity;
    return Math.max(0, SESSION_TIMEOUT - timeSinceActivity);
  };

  return {
    sessionState,
    extendSession,
    getTimeUntilWarning,
    getTimeUntilTimeout,
    isNearExpiry: sessionState.warningShown
  };
}