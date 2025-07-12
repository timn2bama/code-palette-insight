import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type AuditEventType = 
  | 'wardrobe_item_created'
  | 'wardrobe_item_updated' 
  | 'wardrobe_item_deleted'
  | 'outfit_created'
  | 'outfit_updated'
  | 'outfit_deleted'
  | 'profile_updated'
  | 'login_successful'
  | 'login_failed'
  | 'signup_attempted'
  | 'password_changed';

interface AuditLogEntry {
  event_type: AuditEventType;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

export function useAuditLog() {
  const { user } = useAuth();

  const logEvent = useCallback(async (entry: AuditLogEntry) => {
    try {
      // In development, just log to console
      if (import.meta.env.DEV) {
        console.log('Audit Log:', {
          ...entry,
          user_id: user?.id,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // In production, you could send to a dedicated logging service
      // or store in a database table
      await supabase.functions.invoke('security-logger', {
        body: {
          event_type: 'audit_log',
          user_id: user?.id,
          details: {
            audit_event: entry.event_type,
            ...entry.details
          }
        }
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }, [user?.id]);

  const logSecurityEvent = useCallback(async (eventType: string, details: Record<string, any>) => {
    try {
      await supabase.functions.invoke('security-logger', {
        body: {
          event_type: eventType,
          user_id: user?.id,
          details
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user?.id]);

  return {
    logEvent,
    logSecurityEvent
  };
}