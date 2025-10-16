# 🔒 SyncStyle Security Guidelines

**Comprehensive Security Implementation Guide for code-palette-insight Repository**

---

## Table of Contents

1. [Overview](#overview)
2. [Database Security (RLS)](#database-security-rls)
3. [TypeScript Validation Patterns](#typescript-validation-patterns)
4. [Authentication & Authorization](#authentication--authorization)
5. [Input Validation & Sanitization](#input-validation--sanitization)
6. [Premium Feature Access Control](#premium-feature-access-control)
7. [API Security](#api-security)
8. [File Upload Security](#file-upload-security)
9. [Security Best Practices](#security-best-practices)
10. [Security Checklist](#security-checklist)

---

## Overview

SyncStyle implements **defense-in-depth security** with multiple layers:

- **Database Layer**: Row Level Security (RLS) policies
- **API Layer**: Edge Function authentication and validation
- **Application Layer**: Client-side validation and sanitization
- **Premium Features**: Subscription tier-based access control
- **Session Management**: Secure token handling and auto-refresh

### Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  • Input Validation (Zod)                              │
│  • XSS Prevention (sanitization)                       │
│  • Rate Limiting (client-side)                         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                      │
│  • Authentication (Supabase Auth)                      │
│  • Premium Feature Gates                                │
│  • Usage Tracking                                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                        │
│  • Row Level Security (RLS)                            │
│  • FORCE ROW LEVEL SECURITY                            │
│  • Audit Logging                                        │
└─────────────────────────────────────────────────────────┘
```

---

## Database Security (RLS)

### 1. Core RLS Pattern for User Data

**All user-owned tables MUST implement this pattern:**

```sql
-- Enable RLS on the table
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Force RLS (even for table owner)
ALTER TABLE public.wardrobe_items FORCE ROW LEVEL SECURITY;

-- CREATE Policy: Users can only view their own data
CREATE POLICY "Users can view their own wardrobe items"
ON public.wardrobe_items
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- CREATE Policy: Users can only insert their own data
CREATE POLICY "Users can insert their own wardrobe items"
ON public.wardrobe_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE Policy: Users can only update their own data
CREATE POLICY "Users can update their own wardrobe items"
ON public.wardrobe_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE Policy: Users can only delete their own data
CREATE POLICY "Users can delete their own wardrobe items"
ON public.wardrobe_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 2. Public/Private Content Pattern

**For tables with public and private content (like outfits):**

```sql
-- Enable RLS
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view public outfits
CREATE POLICY "Public can view public outfits"
ON public.outfits
FOR SELECT
USING (is_public = true);

-- Policy 2: Users can view their own outfits (public or private)
CREATE POLICY "Users can view their own outfits"
ON public.outfits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Users can only create their own outfits
CREATE POLICY "Users can create their own outfits"
ON public.outfits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can only update their own outfits
CREATE POLICY "Users can update their own outfits"
ON public.outfits
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### 3. Related Data Access Pattern

**For accessing related data through foreign keys:**

```sql
-- Enable RLS
ALTER TABLE public.outfit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can access logs for their own outfits
CREATE POLICY "Users can access logs for their own outfits"
ON public.outfit_logs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.outfits
    WHERE outfits.id = outfit_logs.outfit_id
    AND outfits.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.outfits
    WHERE outfits.id = outfit_logs.outfit_id
    AND outfits.user_id = auth.uid()
  )
);
```

### 4. Reference Tables (Public Read)

**For subscription tiers, categories, etc.:**

```sql
-- Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view subscription tiers
CREATE POLICY "Anyone can view subscription tiers"
ON public.subscription_tiers
FOR SELECT
USING (true);

-- Policy: Only admins can modify (use RBAC function)
CREATE POLICY "Admins can manage subscription tiers"
ON public.subscription_tiers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### 5. Security Definer Functions

**Prevent search_path attacks:**

```sql
CREATE OR REPLACE FUNCTION public.calculate_cost_per_wear(item_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ⚠️ CRITICAL: Always set search_path
AS $function$
DECLARE
  total_cost DECIMAL;
  wear_count INTEGER;
BEGIN
  SELECT purchase_price, wear_count 
  INTO total_cost, wear_count
  FROM wardrobe_items 
  WHERE id = item_id
  AND user_id = auth.uid(); -- ⚠️ CRITICAL: Always verify ownership
  
  IF wear_count = 0 OR total_cost IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN total_cost / wear_count;
END;
$function$;
```

### 6. Audit Logging Pattern

**Track sensitive operations:**

```sql
-- Create audit log function
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_log (
    event_type,
    table_name,
    record_id,
    user_id,
    details,
    created_at
  ) VALUES (
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    now()
  );
  RETURN NEW;
END;
$$;

-- Apply trigger to sensitive tables
CREATE TRIGGER audit_wardrobe_items_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON public.wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_access();
```

---

## TypeScript Validation Patterns

### 1. Premium Feature Access Check

**Server-side validation pattern:**

```typescript
import { premiumFeatureGate } from '@/lib/premiumFeatureGate';

// Example: AI outfit recommendations feature
async function generateAIOutfit(userId: string) {
  // ✅ ALWAYS check feature access BEFORE executing logic
  const hasAccess = await premiumFeatureGate.checkFeatureAccess(
    userId,
    'ai_outfit_recommendations'
  );

  if (!hasAccess) {
    throw new Error('This feature requires a Premium subscription');
  }

  // ✅ Check usage limits
  const canUse = await premiumFeatureGate.checkUsageLimit(
    userId,
    'ai_recommendations_per_month'
  );

  if (!canUse) {
    const upgradeData = await premiumFeatureGate.getUpgradePromptData(
      userId,
      'ai_outfit_recommendations'
    );
    throw new Error(upgradeData.message);
  }

  // Execute feature logic...
  const outfit = await generateOutfit(userId);

  // ✅ ALWAYS track usage AFTER success
  await premiumFeatureGate.trackUsage(
    userId,
    'ai_recommendations_per_month'
  );

  return outfit;
}
```

### 2. Input Sanitization

**Prevent XSS attacks:**

```typescript
import { sanitizeInput, validateInput } from '@/lib/security';

// Example: User-generated content
async function createWardrobeItem(formData: FormData) {
  // ✅ Validate input structure
  const validation = validateInput(formData.name, 'name');
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // ✅ Use sanitized value
  const sanitizedData = {
    name: validation.sanitized,
    description: sanitizeInput(formData.description, 'description'),
    brand: sanitizeInput(formData.brand, 'brand'),
    color: sanitizeInput(formData.color, 'color')
  };

  // Insert with sanitized data
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert(sanitizedData)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### 3. File Upload Validation

**Secure file handling:**

```typescript
import { validateImageFile } from '@/lib/security';

async function uploadWardrobePhoto(file: File) {
  // ✅ Validate file before upload
  const fileValidation = validateImageFile(file);
  if (!fileValidation.isValid) {
    throw new Error(fileValidation.error);
  }

  // ✅ Generate secure filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const filename = `${timestamp}-${randomString}.${fileExtension}`;

  // ✅ Upload to user-specific path
  const filepath = `${userId}/${filename}`;
  const { data, error } = await supabase.storage
    .from('wardrobe-photos')
    .upload(filepath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // ✅ Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('wardrobe-photos')
    .getPublicUrl(filepath);

  return publicUrl;
}
```

### 4. Rate Limiting

**Prevent abuse:**

```typescript
import { rateLimiter } from '@/lib/security';

async function sendEmail(userEmail: string) {
  // ✅ Check rate limit before executing
  const isAllowed = rateLimiter.isAllowed(
    `email-${userEmail}`,
    5,  // Max 5 attempts
    300000  // Per 5 minutes
  );

  if (!isAllowed) {
    throw new Error('Too many requests. Please try again later.');
  }

  // Send email...
  await emailService.send(userEmail);
}
```

### 5. Error Handling (Information Disclosure Prevention)

**Safe error messages:**

```typescript
import { getSafeErrorMessage } from '@/lib/security';

async function fetchUserData(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    // ❌ DON'T: Expose internal error details
    // throw error;

    // ✅ DO: Return safe error message
    const safeMessage = getSafeErrorMessage(error);
    throw new Error(safeMessage);
  }
}
```

---

## Authentication & Authorization

### 1. Auth Context Pattern

**Centralized authentication:**

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 2. Protected Route Pattern

**Route-level authorization:**

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return URL
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### 3. Session Security

**Auto-timeout and refresh:**

```typescript
// hooks/useSecureSession.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export function useSecureSession() {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isNearExpiry, setIsNearExpiry] = useState(false);

  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());

    // Track user activity
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    // Check session expiry
    const interval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      
      if (timeSinceActivity >= SESSION_TIMEOUT) {
        // Auto sign out
        supabase.auth.signOut();
      } else if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_TIME) {
        setIsNearExpiry(true);
      } else {
        setIsNearExpiry(false);
      }
    }, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      clearInterval(interval);
    };
  }, [lastActivity]);

  const extendSession = () => {
    setLastActivity(Date.now());
    setIsNearExpiry(false);
  };

  return {
    isNearExpiry,
    extendSession,
    getTimeUntilTimeout: () => SESSION_TIMEOUT - (Date.now() - lastActivity)
  };
}
```

---

## Input Validation & Sanitization

### Security Utilities Reference

See `src/lib/security.ts` for complete implementation:

```typescript
// Input sanitization
export function sanitizeInput(input: string, type: string): string;
export function validateInput(input: string, type: string): ValidationResult;

// File validation
export function validateImageFile(file: File): ValidationResult;

// Rate limiting
export const rateLimiter = {
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean;
  reset(key: string): void;
};

// Safe error messages
export function getSafeErrorMessage(error: any): string;
```

---

## Premium Feature Access Control

### Feature Gate Component

**UI-level access control:**

```typescript
import { FeatureGate } from '@/components/FeatureGate';

export function AIOutfitButton() {
  return (
    <FeatureGate feature="ai_outfit_recommendations">
      <Button onClick={generateAIOutfit}>
        Generate AI Outfit
      </Button>
    </FeatureGate>
  );
}
```

### Hook-based Access Check

**Programmatic feature checks:**

```typescript
import { usePremiumFeature } from '@/hooks/usePremiumFeature';

export function OutfitCreator() {
  const { hasAccess, isLoading, tier } = usePremiumFeature('ai_outfit_recommendations');

  if (isLoading) return <Loader />;

  return (
    <div>
      {hasAccess ? (
        <AIOutfitButton />
      ) : (
        <UpgradePrompt requiredTier="Premium" />
      )}
    </div>
  );
}
```

---

## API Security

### Edge Function Pattern

**Supabase Edge Functions:**

```typescript
// supabase/functions/ai-outfit-generator/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ✅ Authenticate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // ✅ Validate request body
    const { wardrobeItems, preferences } = await req.json();
    if (!wardrobeItems || wardrobeItems.length === 0) {
      throw new Error('Wardrobe items are required');
    }

    // ✅ Check premium access
    const { data: subscription } = await supabaseClient
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    if (!subscription || subscription.tier === 'Free') {
      throw new Error('AI outfit generation requires Premium subscription');
    }

    // Execute business logic...
    const outfit = await generateOutfit(wardrobeItems, preferences);

    return new Response(
      JSON.stringify({ outfit }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
```

---

## File Upload Security

### Complete Upload Flow

```typescript
// Complete secure upload example
import { supabase } from '@/integrations/supabase/client';
import { validateImageFile } from '@/lib/security';

async function uploadWardrobeItemPhoto(file: File, userId: string) {
  // 1️⃣ Validate file
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 2️⃣ Generate secure filename
  const timestamp = Date.now();
  const randomId = crypto.randomUUID();
  const extension = file.name.split('.').pop()?.toLowerCase();
  const filename = `${timestamp}-${randomId}.${extension}`;

  // 3️⃣ Upload to user-specific bucket path
  const filepath = `${userId}/wardrobe/${filename}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('wardrobe-photos')
    .upload(filepath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (uploadError) throw uploadError;

  // 4️⃣ Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('wardrobe-photos')
    .getPublicUrl(filepath);

  // 5️⃣ Store reference in database with RLS protection
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert({
      user_id: userId,
      photo_url: publicUrl,
      name: 'New Item',
      category: 'tops'
    })
    .select()
    .single();

  if (error) {
    // Cleanup uploaded file on database error
    await supabase.storage
      .from('wardrobe-photos')
      .remove([filepath]);
    throw error;
  }

  return data;
}
```

---

## Security Best Practices

### ✅ DO

1. **Always validate input on both client AND server**
2. **Use RLS policies on ALL user data tables**
3. **Set `FORCE ROW LEVEL SECURITY` on sensitive tables**
4. **Sanitize user input before storing**
5. **Check premium feature access BEFORE executing logic**
6. **Track usage AFTER successful operations**
7. **Use environment variables for secrets**
8. **Log security-related events**
9. **Implement rate limiting on sensitive operations**
10. **Use `search_path = public` in SECURITY DEFINER functions**
11. **Always verify ownership in database functions**
12. **Return safe error messages to users**
13. **Auto-timeout inactive sessions**
14. **Validate file types and sizes before upload**
15. **Use HTTPS in production**

### ❌ DON'T

1. **Don't expose internal error details to users**
2. **Don't trust client-side validation alone**
3. **Don't hardcode secrets in code**
4. **Don't skip premium feature checks**
5. **Don't log sensitive user data**
6. **Don't use `SELECT *` without RLS verification**
7. **Don't allow arbitrary file uploads**
8. **Don't expose database schema in errors**
9. **Don't use `eval()` or `new Function()`**
10. **Don't disable security features in production**
11. **Don't commit `.env` files**
12. **Don't use weak session timeouts**
13. **Don't trust user-supplied file names**
14. **Don't bypass RLS with service role key in client**
15. **Don't execute unvalidated user input**

---

## Security Checklist

### Database Security
- [ ] All user tables have RLS enabled
- [ ] All user tables have FORCE RLS enabled
- [ ] SELECT policies verify ownership
- [ ] INSERT policies enforce ownership
- [ ] UPDATE policies verify and enforce ownership
- [ ] DELETE policies verify ownership
- [ ] SECURITY DEFINER functions set `search_path = public`
- [ ] Audit logging enabled for sensitive tables
- [ ] No service role key exposed in client code

### Application Security
- [ ] Input validation on all forms
- [ ] Input sanitization before storage
- [ ] XSS prevention in user-generated content
- [ ] Rate limiting on authentication endpoints
- [ ] Rate limiting on expensive operations
- [ ] Safe error messages returned to users
- [ ] Session timeout implemented
- [ ] Session activity tracking
- [ ] Auto sign-out on timeout
- [ ] Protected routes require authentication

### Premium Features
- [ ] Access checks before feature execution
- [ ] Usage tracking after successful operations
- [ ] Upgrade prompts for denied access
- [ ] Server-side tier verification
- [ ] Client-side UI gating
- [ ] Usage limits enforced
- [ ] Tier comparison available

### File Upload Security
- [ ] File type validation (whitelist)
- [ ] File size limits enforced
- [ ] Secure filename generation
- [ ] User-specific storage paths
- [ ] Storage bucket RLS policies
- [ ] Cleanup on upload errors
- [ ] Content-type validation

### API Security
- [ ] Authentication required on all endpoints
- [ ] CORS headers configured correctly
- [ ] Request body validation
- [ ] Authorization checks per request
- [ ] Rate limiting per user
- [ ] Error handling doesn't leak info
- [ ] Environment variables for secrets

### Monitoring & Logging
- [ ] Security events logged
- [ ] Failed auth attempts tracked
- [ ] Suspicious activity monitored
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Audit logs retained
- [ ] Alert system configured

---

## Reference Files

### Security Implementation Files

- **Database RLS**: `supabase/migrations/*.sql`
- **Security Utilities**: `src/lib/security.ts`
- **Premium Gates**: `src/lib/premiumFeatureGate.ts`
- **Auth Context**: `src/contexts/AuthContext.tsx`
- **Session Security**: `src/hooks/useSecureSession.ts`
- **Protected Routes**: `src/components/ProtectedRoute.tsx`
- **Feature Gate**: `src/components/FeatureGate.tsx`

### Documentation

- **Blog Security**: `supabase/BLOG_SECURITY.md`
- **API Documentation**: `docs/API.md`
- **Contributing Guide**: `CONTRIBUTING.md`
- **Code Review**: `CODE_REVIEW_2025.md`

---

## Security Contact

For security issues or vulnerabilities, please:

1. **DO NOT** open a public GitHub issue
2. Email: [your-security-email@syncstyle.com]
3. Include: Detailed description, steps to reproduce, impact assessment
4. Allow 48 hours for initial response

---

## Version History

- **v1.0.0** - October 2025 - Initial comprehensive security guidelines
- Created for code-palette-insight repository
- Based on production implementation and security audit

---

**Remember**: Security is not a one-time implementation—it's an ongoing process. Review and update these guidelines regularly as the application evolves.

🔒 **Security is everyone's responsibility** 🔒
