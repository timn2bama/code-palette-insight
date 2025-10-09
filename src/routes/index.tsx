import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Eager-loaded pages for optimal first paint
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';

// Lazy-loaded pages
const Wardrobe = lazy(() => import('@/pages/Wardrobe'));
const Outfits = lazy(() => import('@/pages/Outfits'));
const Explore = lazy(() => import('@/pages/Explore'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Integrations = lazy(() => import('@/pages/Integrations'));
const Weather = lazy(() => import('@/pages/Weather'));
const Services = lazy(() => import('@/pages/Services'));
const Subscription = lazy(() => import('@/pages/Subscription'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Help = lazy(() => import('@/pages/Help'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const BlogAdmin = lazy(() => import('@/pages/BlogAdmin'));
const MobileAccessibility = lazy(() => import('@/pages/MobileAccessibility'));
const AIAnalysisPanel = lazy(() => import('@/components/AIAnalysisPanel'));

export const routes: RouteObject[] = [
  // Public routes
  { path: '/', element: <Index /> },
  { path: '/auth', element: <Auth /> },
  { path: '/privacy', element: <PrivacyPolicy /> },
  { path: '/terms', element: <TermsOfService /> },
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
  { path: '/help', element: <Help /> },
  { path: '/blog', element: <Blog /> },
  { path: '/blog/:slug', element: <BlogPost /> },
  
  // Protected routes
  { 
    path: '/blog/admin', 
    element: <ProtectedRoute><BlogAdmin /></ProtectedRoute> 
  },
  { 
    path: '/wardrobe', 
    element: <ProtectedRoute><Wardrobe /></ProtectedRoute> 
  },
  { 
    path: '/outfits', 
    element: <ProtectedRoute><Outfits /></ProtectedRoute> 
  },
  { 
    path: '/explore', 
    element: <ProtectedRoute><Explore /></ProtectedRoute> 
  },
  { 
    path: '/analytics', 
    element: <ProtectedRoute><Analytics /></ProtectedRoute> 
  },
  { 
    path: '/integrations', 
    element: <ProtectedRoute><Integrations /></ProtectedRoute> 
  },
  { 
    path: '/weather', 
    element: <ProtectedRoute><Weather /></ProtectedRoute> 
  },
  { 
    path: '/services', 
    element: <ProtectedRoute><Services /></ProtectedRoute> 
  },
  { 
    path: '/subscription', 
    element: <ProtectedRoute><Subscription /></ProtectedRoute> 
  },
  { 
    path: '/mobile', 
    element: <ProtectedRoute><MobileAccessibility /></ProtectedRoute> 
  },
  { 
    path: '/ai-analysis', 
    element: <ProtectedRoute><AIAnalysisPanel /></ProtectedRoute> 
  },
  
  // Catch-all 404 route (must be last)
  { path: '*', element: <NotFound /> }
];
