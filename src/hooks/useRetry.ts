import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  exponentialBackoff?: boolean;
  onError?: (error: Error, attempt: number) => void;
}

export const useRetry = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    exponentialBackoff = true,
    onError
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const { toast } = useToast();

  const executeWithRetry = useCallback(async (...args: T): Promise<R> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setAttemptCount(attempt);
        setIsRetrying(attempt > 1);
        
        const result = await fn(...args);
        
        if (attempt > 1) {
          toast({
            title: "Success",
            description: `Operation succeeded after ${attempt} attempts`,
          });
        }
        
        setIsRetrying(false);
        setAttemptCount(0);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (onError) {
          onError(lastError, attempt);
        }
        
        if (attempt === maxAttempts) {
          toast({
            title: "Operation Failed",
            description: `Failed after ${maxAttempts} attempts: ${lastError.message}`,
            variant: "destructive",
          });
          break;
        }
        
        // Wait before retry with optional exponential backoff
        const waitTime = exponentialBackoff ? delay * Math.pow(2, attempt - 1) : delay;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    setIsRetrying(false);
    setAttemptCount(0);
    throw lastError!;
  }, [fn, maxAttempts, delay, exponentialBackoff, onError, toast]);

  return {
    executeWithRetry,
    isRetrying,
    attemptCount
  };
};