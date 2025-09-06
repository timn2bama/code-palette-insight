import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

export function usePerformanceMonitoring() {
  const { user } = useAuth();

  const sendToAnalytics = async (metric: Metric) => {
    const performanceData: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('Performance Metric:', performanceData);
      return;
    }

    try {
      // Send to analytics service in production
      await supabase.functions.invoke('performance-logger', {
        body: {
          metric: performanceData,
          user_id: user?.id,
          session_id: sessionStorage.getItem('session_id') || 'anonymous'
        }
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  };

  const initializeMonitoring = () => {
    // Core Web Vitals (FID is deprecated in favor of INP)
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  };

  const trackCustomMetric = (name: string, value: number, context?: Record<string, any>) => {
    const customMetric = {
      name,
      value,
      timestamp: Date.now(),
      context,
      url: window.location.href
    };

    if (import.meta.env.DEV) {
      console.log('Custom Metric:', customMetric);
      return;
    }

    // Send custom metrics to analytics
    supabase.functions.invoke('performance-logger', {
      body: {
        custom_metric: customMetric,
        user_id: user?.id
      }
    }).catch(error => {
      console.error('Failed to send custom metric:', error);
    });
  };

  const measurePageLoad = () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        const firstByte = navigation.responseStart - navigation.fetchStart;

        trackCustomMetric('page_load_time', pageLoadTime);
        trackCustomMetric('dom_content_loaded', domContentLoaded);
        trackCustomMetric('time_to_first_byte', firstByte);
      }
    }
  };

  useEffect(() => {
    initializeMonitoring();
    measurePageLoad();
  }, []);

  return {
    trackCustomMetric,
    measurePageLoad
  };
}