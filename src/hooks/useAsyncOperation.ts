import { useState, useCallback } from 'react';
import { handleError, handleSuccess, ErrorContext } from '@/utils/errorHandler';

/**
 * Hook for managing async operations with consistent error handling
 * 
 * @example
 * ```typescript
 * const { execute, loading } = useAsyncOperation(
 *   async (itemId: string) => {
 *     await deleteItem(itemId);
 *   },
 *   {
 *     context: 'wardrobe',
 *     successMessage: 'Item deleted successfully',
 *     onSuccess: () => refetch(),
 *   }
 * );
 * ```
 */
export function useAsyncOperation<TArgs extends any[], TResult = void>(
  operation: (...args: TArgs) => Promise<TResult>,
  options?: {
    context?: ErrorContext;
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (result: TResult) => void;
    onError?: (error: unknown) => void;
    showSuccessToast?: boolean;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const {
    context = 'general',
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    showSuccessToast = true,
  } = options || {};

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await operation(...args);

        if (successMessage && showSuccessToast) {
          handleSuccess(successMessage);
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        
        await handleError(err, context, undefined, {
          customMessage: errorMessage,
        });

        onError?.(err);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [operation, context, successMessage, errorMessage, onSuccess, onError, showSuccessToast]
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    execute,
    loading,
    error,
    reset,
  };
}
