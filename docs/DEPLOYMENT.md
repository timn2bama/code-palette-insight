# SyncStyle Deployment Guide

Complete guide for deploying SyncStyle to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Lovable Deployment (Recommended)](#lovable-deployment)
3. [Self-Hosted Deployment](#self-hosted-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Domain Setup](#domain-setup)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Active Supabase project
- ✅ All environment variables configured
- ✅ Database migrations applied
- ✅ Edge functions deployed
- ✅ Storage buckets created
- ✅ RLS policies enabled

### Supabase Setup Checklist

```bash
# 1. Create Supabase project at https://supabase.com

# 2. Apply database migrations
supabase db push

# 3. Deploy edge functions
supabase functions deploy

# 4. Create storage buckets
# Run this SQL in Supabase SQL Editor:
insert into storage.buckets (id, name, public)
values ('wardrobe-images', 'wardrobe-images', true);

# 5. Set edge function secrets
supabase secrets set LOVABLE_API_KEY=your-key
```

---

## Lovable Deployment (Recommended)

### Quick Deploy

1. **Click Publish Button**
   - Located in top-right corner of Lovable editor
   - Builds and deploys automatically
   - Live URL provided instantly

2. **Verify Deployment**
   - Open provided URL
   - Test authentication flow
   - Verify image uploads work
   - Check all features function

3. **Monitor**
   - Check Lovable dashboard for build status
   - View deployment logs if issues occur

### Advantages of Lovable Deployment

- ✅ Zero configuration required
- ✅ Automatic SSL certificates
- ✅ Global CDN distribution
- ✅ Instant rollbacks
- ✅ Preview deployments for testing
- ✅ Automatic builds on code changes

### Custom Domain on Lovable

1. Go to Project Settings > Domains
2. Click "Add Custom Domain"
3. Enter your domain name
4. Add DNS records at your registrar:
   ```
   Type: CNAME
   Name: @ (or subdomain)
   Value: [provided by Lovable]
   ```
5. Wait for DNS propagation (up to 48 hours)
6. SSL certificate auto-generated

---

## Self-Hosted Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all required variables from `.env`

5. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

### Netlify Deployment

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

5. **Configure**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_VERSION = "18"
   ```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine as build

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**
   ```nginx
   server {
     listen 80;
     server_name _;
     root /usr/share/nginx/html;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     # Enable gzip compression
     gzip on;
     gzip_types text/plain text/css application/json application/javascript;
   }
   ```

3. **Build and Run**
   ```bash
   docker build -t syncstyle .
   docker run -p 80:80 syncstyle
   ```

---

## Environment Configuration

### Production Environment Variables

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-production-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# Optional but recommended
VITE_ENABLE_MONITORING=true
VITE_API_URL=https://api.syncstyle.com
```

### Supabase Configuration

1. **Auth Settings**
   - Navigate to Authentication > URL Configuration
   - Set Site URL: `https://your-domain.com`
   - Add Redirect URLs:
     - `https://your-domain.com`
     - `https://your-domain.com/auth/callback`

2. **CORS Settings**
   - Go to Settings > API
   - Add allowed origins:
     - `https://your-domain.com`
     - `https://www.your-domain.com` (if using www)

3. **Storage Settings**
   - Ensure bucket policies allow authenticated uploads
   - Set appropriate file size limits
   - Configure CORS for direct uploads

---

## Domain Setup

### DNS Configuration

For root domain (`example.com`):
```
Type: A
Name: @
Value: [hosting provider IP]

Type: CNAME
Name: www
Value: example.com
```

For subdomain (`app.example.com`):
```
Type: CNAME
Name: app
Value: [hosting provider domain]
```

### SSL Certificate

Most hosting providers (Vercel, Netlify, Lovable) automatically provision SSL certificates via Let's Encrypt.

For custom setup:
```bash
# Using Certbot
certbot certonly --webroot -w /var/www/html -d example.com -d www.example.com
```

---

## Post-Deployment

### 1. Verify Functionality

Test critical features:
- [ ] User registration and login
- [ ] Image upload to wardrobe
- [ ] Outfit creation
- [ ] Weather integration
- [ ] AI outfit suggestions
- [ ] Mobile responsiveness
- [ ] Page load speed (<3s)

### 2. Set Up Monitoring

```typescript
// Add to main.tsx for production monitoring
if (import.meta.env.PROD) {
  // Initialize error tracking
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
  });

  // Track Core Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}
```

### 3. Performance Optimization

Enable production optimizations:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### 4. SEO Setup

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify robots.txt accessibility
- [ ] Verify ai.txt accessibility
- [ ] Test structured data with Google Rich Results Test
- [ ] Check Open Graph previews (Facebook Sharing Debugger)
- [ ] Verify Twitter Card rendering

### 5. Analytics

Add Google Analytics:
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Troubleshooting

### Build Failures

**Issue:** TypeScript errors during build
```bash
# Solution: Run type check locally
npm run build
# Fix any reported type errors
```

**Issue:** Missing environment variables
```bash
# Solution: Verify all required vars are set
echo $VITE_SUPABASE_URL
```

### Runtime Errors

**Issue:** "Failed to fetch" errors
- Check CORS settings in Supabase
- Verify API URLs are correct
- Check network tab for actual error

**Issue:** Authentication redirect errors
- Verify Site URL in Supabase Auth settings
- Check redirect URLs include your domain
- Ensure HTTPS is configured

**Issue:** Image upload failures
- Verify storage bucket exists
- Check RLS policies on storage
- Ensure file size limits are appropriate

### Performance Issues

**Issue:** Slow initial load
```bash
# Analyze bundle size
npm run build
npm run analyze

# Solutions:
# - Enable code splitting
# - Lazy load routes
# - Optimize images
# - Enable CDN caching
```

**Issue:** Slow API responses
- Check Supabase region (should match user location)
- Enable database indexes for common queries
- Implement caching for expensive operations

---

## Rollback Procedure

### Lovable
1. Go to project history
2. Find last working version
3. Click "Revert to this version"
4. Confirm rollback

### Vercel/Netlify
1. Go to deployments page
2. Find last successful deployment
3. Click "Promote to Production"

### Docker
```bash
# Revert to previous image version
docker pull syncstyle:previous-tag
docker stop syncstyle
docker run -d --name syncstyle syncstyle:previous-tag
```

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Review performance metrics
- Monitor storage usage

**Monthly:**
- Update dependencies
- Review security scan results
- Optimize database queries

**Quarterly:**
- Rotate API keys
- Review and update documentation
- Audit user feedback

---

## Support

For deployment issues:
- [Lovable Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- [Supabase Support](https://supabase.com/support)
- [GitHub Issues](https://github.com/your-repo/issues)
