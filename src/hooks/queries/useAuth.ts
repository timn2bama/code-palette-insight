import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, getSafeErrorMessage, rateLimiter } from '@/lib/security';

export const useSubscriptionQuery = (userId?: string) => {
  return useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return { subscribed: false };
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.warn('Subscription check failed:', error);
        return { subscribed: false }; // Graceful fallback
      }
      return data;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    retry: false, // Don't retry subscription checks to avoid spam
  });
};

export const useSignInMutation = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Rate limiting for failed login attempts
      const loginKey = `login-${email.toLowerCase()}`;
      if (!rateLimiter.isAllowed(loginKey, 5, 300000)) {
        throw new Error('Too many login attempts. Please wait before trying again.');
      }

      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });
      
      if (error) {
        throw new Error(getSafeErrorMessage(error));
      } else {
        // Reset rate limiter on successful login
        rateLimiter.reset(loginKey);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    }
  });
};

export const useSignUpMutation = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      displayName 
    }: { 
      email: string; 
      password: string; 
      displayName?: string; 
    }) => {
      // Rate limiting
      if (!rateLimiter.isAllowed('signup', 3, 300000)) {
        throw new Error('Too many signup attempts. Please wait before trying again.');
      }

      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email');
      }

      // Password strength check
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName?.trim()
          }
        }
      });
      
      if (error) {
        throw new Error(getSafeErrorMessage(error));
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      });
    }
  });
};

export const useSignOutMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Clear all cached data on sign out
      queryClient.clear();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};