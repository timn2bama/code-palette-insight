# SyncStyle API Documentation

## Overview

This document provides detailed information about SyncStyle's API integrations, edge functions, and data flow.

## Table of Contents

1. [Authentication](#authentication)
2. [Database Schema](#database-schema)
3. [Edge Functions](#edge-functions)
4. [External APIs](#external-apis)
5. [Error Handling](#error-handling)

---

## Authentication

### Supabase Authentication

SyncStyle uses Supabase Auth for user management.

**Auth Methods:**
- Email/Password authentication
- Email confirmation flow
- Session management with JWTs

**Key Components:**
- `AuthContext` - Manages authentication state
- `useAuth` hook - Access authentication functions
- `ProtectedRoute` - Route protection wrapper

**Example Usage:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      console.error('Login failed:', error);
    }
  };
  
  return <div>{user?.email}</div>;
}
```

---

## Database Schema

### Main Tables

#### `wardrobe_items`
Stores user wardrobe items with photos and metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| name | text | Item name |
| category | text | Item category (tops, bottoms, etc.) |
| color | text | Primary color |
| season | text | Suitable season |
| image_url | text | Storage URL for item photo |
| wear_count | integer | Number of times worn |
| created_at | timestamptz | Creation timestamp |

#### `outfits`
User-created outfit combinations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| name | text | Outfit name |
| description | text | Optional description |
| items | jsonb | Array of wardrobe item IDs |
| created_at | timestamptz | Creation timestamp |

#### `user_profiles`
Extended user profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| display_name | text | User's display name |
| location | text | User's location for weather |
| subscription_tier | text | Subscription level |

---

## Edge Functions

### Overview
Edge functions run on Supabase Edge Runtime (Deno) and provide serverless backend functionality.

### Available Functions

#### `smart-outfit-ai`
**Purpose:** Generate AI-powered outfit suggestions based on weather and wardrobe items

**Input:**
```typescript
{
  wardrobeItems: Array<{
    id: string;
    name: string;
    category: string;
    color: string;
    season: string;
  }>;
  weather: {
    temp: number;
    condition: string;
    precipitation?: number;
  };
  occasion?: string;
  stylePreference?: string;
}
```

**Output:**
```typescript
{
  suggestions: Array<{
    name: string;
    items: string[]; // Array of wardrobe item IDs
    reasoning: string;
  }>;
}
```

**Usage:**
```typescript
const { data, error } = await supabase.functions.invoke('smart-outfit-ai', {
  body: {
    wardrobeItems: items,
    weather: currentWeather,
    occasion: 'casual'
  }
});
```

#### `get-weather`
**Purpose:** Fetch weather data for a location

**Input:**
```typescript
{
  location: string; // City name or coordinates
}
```

**Output:**
```typescript
{
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
  }>;
}
```

#### `error-logger`
**Purpose:** Centralized error logging for monitoring

**Input:**
```typescript
{
  context: string;
  error: object;
  userId?: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

---

## External APIs

### Weather API
- **Provider:** OpenWeatherMap / WeatherAPI
- **Rate Limits:** 1000 calls/day (free tier)
- **Caching:** Weather data cached for 30 minutes

### AI Services
- **Provider:** Lovable AI Gateway
- **Models:** Google Gemini Flash for outfit suggestions
- **Rate Limits:** Based on Lovable plan

---

## Error Handling

### Centralized Error Handler

All errors should use the centralized error handling system:

```typescript
import { handleError, withErrorHandling } from '@/utils/errorHandler';

// Basic error handling
try {
  await uploadImage(file);
} catch (error) {
  handleError(error, 'upload', { fileName: file.name });
}

// Async wrapper with automatic error handling
const data = await withErrorHandling(
  async () => await fetchData(),
  'database',
  { operation: 'fetch-wardrobe' }
);
```

### Error Contexts
- `auth` - Authentication errors
- `wardrobe` - Wardrobe item operations
- `outfit` - Outfit operations
- `upload` - File upload errors
- `network` - Network/API errors
- `database` - Database errors
- `validation` - Input validation errors
- `ai` - AI service errors

### Error Monitoring
All errors in production are logged to the `error-logger` edge function for monitoring and debugging.

---

## Best Practices

1. **Always validate user input** before sending to edge functions
2. **Use TypeScript types** for all API calls
3. **Handle errors gracefully** with user-friendly messages
4. **Cache expensive operations** (weather, AI calls)
5. **Implement rate limiting** for user-facing operations
6. **Use RLS policies** for data security
7. **Log errors** in production for debugging

---

## Rate Limiting

Key operations have rate limiting:

- **Outfit creation:** 10 per minute
- **Image uploads:** 5 per minute
- **AI suggestions:** 3 per minute
- **Login attempts:** 5 per 5 minutes

Rate limits are enforced client-side and server-side.

---

## Security

### Row Level Security (RLS)
All database tables use RLS policies to ensure users can only access their own data.

### Input Validation
All user inputs are validated using Zod schemas before processing.

### File Upload Security
- File type validation (images only)
- File size limits (max 10MB)
- Virus scanning (planned)
- Secure storage with access controls

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Lovable AI Gateway](https://docs.lovable.dev/features/ai)
- [Error Handling Guide](./CONTRIBUTING.md#error-handling)
