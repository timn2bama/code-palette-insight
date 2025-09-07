import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          router: ['react-router-dom'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          monitoring: ['web-vitals']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize bundle size
    minify: 'terser'
  }
}));
