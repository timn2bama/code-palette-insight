import { createContext, useContext, useEffect, useState } from 'react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { auth, app } from '@/integrations/firebase/client';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { validateEmail, getSafeErrorMessage, rateLimiter } from '@/lib/security';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus;
  checkSubscription: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ subscribed: false });

  const checkSubscription = async () => {
    if (!user) return;
    try {
      const functions = getFunctions(app);
      const checkSubscriptionFunction = httpsCallable(functions, 'checkSubscription');
      const result = await checkSubscriptionFunction();
      setSubscriptionStatus(result.data as SubscriptionStatus);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setSubscriptionStatus({ subscribed: false });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        checkSubscription();
      } else {
        setSubscriptionStatus({ subscribed: false });
      }
    });

    return () => unsubscribe();
  }, [user]); // Rerun when user object changes

  const signUp = async (email: string, password: string, displayName?: string) => {
    // Rate limiting
    if (!rateLimiter.isAllowed('signup', 3, 300000)) {
      return { error: new Error('Too many signup attempts. Please wait before trying again.') };
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { error: new Error(emailValidation.error || 'Invalid email') };
    }

    // Password strength check
    if (password.length < 8) {
      return { error: new Error('Password must be at least 8 characters long') };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      if (displayName) {
        await updateProfile(userCredential.user, { displayName: displayName.trim() });
      }
      return { error: null };
    } catch (error) {
      return { error: new Error(getSafeErrorMessage(error)) };
    }
  };

  const signIn = async (email: string, password: string) => {
    const loginKey = `login-${email.toLowerCase()}`;
    if (!rateLimiter.isAllowed(loginKey, 5, 300000)) {
      return { error: new Error('Too many login attempts. Please wait before trying again.') };
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { error: new Error(emailValidation.error || 'Invalid email') };
    }

    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      rateLimiter.reset(loginKey);
      return { error: null };
    } catch (error) {
      return { error: new Error(getSafeErrorMessage(error)) };
    }
  };

  const signOut = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: new Error(getSafeErrorMessage(error)) };
    }
  };

  const value = {
    user,
    loading,
    subscriptionStatus,
    checkSubscription,
    signUp,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};