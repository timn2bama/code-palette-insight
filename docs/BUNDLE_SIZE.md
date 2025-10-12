# Bundle Size Monitoring

This guide explains how to monitor and optimize bundle size in SyncStyle.

## Tools

### Rollup Plugin Visualizer

Installed and configured to generate bundle analysis after production builds.

**Generate Report:**
```bash
npm run build
```

This creates `dist/stats.html` showing:
- Bundle composition
- Module sizes (raw, gzip, brotli)
- Tree map visualization
- Chunk relationships

**View Report:**
```bash
open dist/stats.html
```

## Current Bundle Strategy

### Code Splitting

The app uses manual chunk splitting for optimal loading:

```typescript
// vite.config.ts
manualChunks: {
  vendor: ['react', 'react-dom'],           // ~150KB
  supabase: ['@supabase/supabase-js'],      // ~80KB
  ui: ['@radix-ui/...'],                    // ~200KB
  router: ['react-router-dom'],             // ~50KB
  utils: ['date-fns', 'clsx', ...],         // ~40KB
  charts: ['recharts'],                     // ~300KB
  icons: ['lucide-react'],                  // ~60KB
  forms: ['react-hook-form', ...],          // ~50KB
  monitoring: ['web-vitals']                // ~10KB
}
```

### Lazy Loading

Routes are lazy-loaded to reduce initial bundle:

```typescript
// routes/index.tsx
const Wardrobe = lazy(() => import('@/pages/Wardrobe'));
const Outfits = lazy(() => import('@/pages/Outfits'));
const Weather = lazy(() => import('@/pages/Weather'));
// etc...
```

## Bundle Size Limits

Defined in `bundlesize.config.json`:

```json
{
  "files": [
    {
      "path": "./dist/assets/*.js",
      "maxSize": "500 KB",
      "compression": "gzip"
    },
    {
      "path": "./dist/assets/*.css",
      "maxSize": "100 KB",
      "compression": "gzip"
    }
  ]
}
```

## Monitoring in CI/CD

Bundle size is checked in CI/CD pipeline:

```yaml
# .github/workflows/ci-cd.yml
- name: Check bundle size
  run: |
    npm run build
    npx bundlesize
```

Fails if bundles exceed limits.

## Optimization Strategies

### 1. Analyze Dependencies

```bash
# Build and open visualizer
npm run build
open dist/stats.html
```

Look for:
- Duplicate dependencies
- Unexpectedly large packages
- Unused exports being bundled

### 2. Tree Shaking

Ensure imports use named exports:

```typescript
// ❌ Bad - imports everything
import _ from 'lodash';

// ✅ Good - tree-shakeable
import { debounce } from 'lodash-es';
```

### 3. Dynamic Imports

For rarely used features:

```typescript
// Only load when needed
const handleExport = async () => {
  const { exportData } = await import('@/utils/exportUtils');
  exportData();
};
```

### 4. Image Optimization

- Use WebP format
- Implement lazy loading
- Use responsive images

```tsx
<img 
  src={item.image_url}
  loading="lazy"
  decoding="async"
/>
```

### 5. Remove Unused Code

```bash
# Find unused exports
npx depcheck

# Remove unused dependencies
npm uninstall package-name
```

## Performance Budget

Target sizes (gzipped):

| Asset Type | Target | Max |
|-----------|--------|-----|
| Initial JS | 150KB | 250KB |
| Initial CSS | 30KB | 50KB |
| Vendor chunk | 200KB | 300KB |
| Route chunk | 50KB | 100KB |
| Total (initial) | 400KB | 600KB |

## Monitoring Dashboard

### Key Metrics

Track these in production:

1. **First Contentful Paint (FCP)**
   - Target: <1.8s
   - Max: 3s

2. **Largest Contentful Paint (LCP)**
   - Target: <2.5s
   - Max: 4s

3. **Total Blocking Time (TBT)**
   - Target: <200ms
   - Max: 600ms

4. **Bundle Size**
   - Initial: <600KB gzipped
   - Total: <2MB gzipped

### Lighthouse CI

```yaml
# .lhcirc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8080/'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
  },
};
```

## Best Practices

### DO:
- ✅ Analyze bundle after every major change
- ✅ Use code splitting for large features
- ✅ Lazy load images and routes
- ✅ Monitor bundle size in CI/CD
- ✅ Use tree-shakeable libraries
- ✅ Minify and compress in production

### DON'T:
- ❌ Import entire libraries when you need one function
- ❌ Bundle development dependencies
- ❌ Ignore bundle size warnings
- ❌ Load all routes eagerly
- ❌ Include source maps in production
- ❌ Forget to compress assets

## Troubleshooting

### Bundle Size Increased Unexpectedly

1. **Compare builds:**
   ```bash
   git checkout main
   npm run build
   mv dist/stats.html dist/stats-main.html
   
   git checkout feature-branch
   npm run build
   # Compare dist/stats.html with dist/stats-main.html
   ```

2. **Identify culprit:**
   - Check recently installed packages
   - Review new imports
   - Look for duplicate dependencies

3. **Fix:**
   - Replace large libraries with smaller alternatives
   - Use dynamic imports for non-critical features
   - Remove unused dependencies

### Chunk Size Too Large

Split large chunks further:

```typescript
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react') || id.includes('react-dom')) {
      return 'react-vendor';
    }
    if (id.includes('@radix-ui')) {
      return 'radix-ui';
    }
    return 'vendor';
  }
}
```

### Slow Initial Load

1. Reduce initial bundle size
2. Implement route-based code splitting
3. Defer non-critical scripts
4. Enable HTTP/2 push
5. Use CDN for static assets

## Resources

- [Webpack Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [Rollup Plugin Visualizer](https://www.npmjs.com/package/rollup-plugin-visualizer)
- [Bundle Size](https://bundlesize.io/)
- [Web.dev Performance](https://web.dev/performance/)
