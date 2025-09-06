import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserSession {
  session_id: string;
  user_id?: string;
  start_time: number;
  page_views: number;
  interactions: number;
  errors: number;
  device_info: {
    user_agent: string;
    screen_resolution: string;
    viewport: string;
    connection: string;
  };
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'resize' | 'navigation' | 'error';
  timestamp: number;
  target?: string;
  value?: any;
  page: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, session, session_id, interaction, path, error, timestamp } = await req.json();

    switch (action) {
      case 'session_start':
        console.log('RUM Session Started:', JSON.stringify(session, null, 2));
        // Store session data in analytics database
        break;

      case 'page_view':
        console.log('RUM Page View:', { session_id, path, timestamp });
        // Track page views for user journey analysis
        break;

      case 'interaction':
        console.log('RUM Interaction:', JSON.stringify({ session_id, interaction }, null, 2));
        // Track user interactions for UX analysis
        break;

      case 'error':
        console.error('RUM Error:', JSON.stringify({ session_id, error, timestamp }, null, 2));
        // Log errors for debugging and monitoring
        
        // Check for critical errors that might need immediate attention
        if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
          console.error('Critical: JavaScript chunk loading error detected');
        }
        break;

      default:
        console.warn('Unknown RUM action:', action);
    }

    // In production, you would:
    // 1. Store data in a time-series database (InfluxDB, TimescaleDB)
    // 2. Send to analytics platforms (Google Analytics, Mixpanel, Amplitude)
    // 3. Set up alerts for critical issues
    // 4. Generate real-time dashboards for monitoring

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in rum-logger:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});