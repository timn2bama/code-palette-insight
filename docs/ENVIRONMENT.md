# Environment Variables Reference

This document lists all environment variables used in SyncStyle.

## Required Variables

These variables must be set for the application to function:

### Supabase Configuration

```bash
# Supabase Project URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous/Public Key
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here

# Supabase Project ID
VITE_SUPABASE_PROJECT_ID=your-project-id
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the values from the "Project URL" and "Project API keys" sections

---

## Optional Variables

These variables enhance functionality but are not required for basic operation:

### Analytics & Monitoring

```bash
# Enable performance monitoring (default: false in dev)
VITE_ENABLE_MONITORING=true

# Sentry DSN for error tracking (optional)
VITE_SENTRY_DSN=your-sentry-dsn
```

### Feature Flags

```bash
# Enable AI features (default: true)
VITE_ENABLE_AI_FEATURES=true

# Enable weather integration (default: true)
VITE_ENABLE_WEATHER=true

# Enable marketplace features (default: true)
VITE_ENABLE_MARKETPLACE=true
```

### Development Settings

```bash
# API base URL (default: uses Supabase URL)
VITE_API_URL=https://api.syncstyle.app

# Enable debug logging (default: false)
VITE_DEBUG=true

# Mock external APIs in development (default: false)
VITE_MOCK_APIS=true
```

---

## Edge Function Environment Variables

These are set in Supabase Edge Function secrets, not in `.env`:

### AI Services

```bash
# Lovable AI Gateway API Key
LOVABLE_API_KEY=your-lovable-api-key
```

**How to set:**
```bash
supabase secrets set LOVABLE_API_KEY=your-key-here
```

### Payment Processing

```bash
# Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

### External APIs

```bash
# Weather API Key (if using external provider)
WEATHER_API_KEY=your-weather-api-key

# Google Places API Key (for location services)
GOOGLE_PLACES_API_KEY=your-places-key
```

---

## Setting Up Environment Variables

### Local Development

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_SUPABASE_PROJECT_ID=your-project-id
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### Production (Lovable)

Environment variables are automatically managed by Lovable Cloud. No manual setup required.

### Production (Self-Hosted)

Set environment variables through your hosting platform:

**Vercel:**
1. Go to Project Settings > Environment Variables
2. Add each variable with appropriate scope (Production/Preview/Development)

**Netlify:**
1. Go to Site Settings > Environment Variables
2. Add each key-value pair

**Docker:**
```dockerfile
ENV VITE_SUPABASE_URL=https://your-project.supabase.co
ENV VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

---

## Security Best Practices

### DO:
- ✅ Use `VITE_` prefix for client-side variables
- ✅ Keep secret keys in Edge Function secrets
- ✅ Use different keys for development and production
- ✅ Rotate keys periodically
- ✅ Store `.env` in `.gitignore`

### DON'T:
- ❌ Commit `.env` files to version control
- ❌ Share API keys in screenshots or logs
- ❌ Use production keys in development
- ❌ Expose secret keys to the client
- ❌ Hardcode sensitive values in code

---

## Validation

The application validates required environment variables on startup. If any are missing, you'll see an error message in the console.

To manually verify your environment variables:

```typescript
// src/lib/env.ts
export function validateEnv() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_PROJECT_ID',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
```

---

## Troubleshooting

### Variables not loading
- Ensure variables start with `VITE_` for client-side access
- Restart development server after changing `.env`
- Check `.env` file is in project root

### "Undefined" values
- Verify variable names match exactly (case-sensitive)
- Check for trailing spaces in values
- Ensure no quotes around values in `.env`

### Edge functions can't access variables
- Use `supabase secrets set` instead of `.env`
- Redeploy edge functions after setting secrets
- Check function logs for access errors

---

## Example .env File

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://oikpwuraixlnjvyrmnwx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=oikpwuraixlnjvyrmnwx

# Optional Features
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_WEATHER=true
VITE_DEBUG=false
```

**Note:** Never commit actual API keys to version control!
