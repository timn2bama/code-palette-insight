// Security utilities for input validation and sanitization

const MAX_INPUT_LENGTHS = {
  name: 100,
  description: 500,
  brand: 50,
  color: 30,
  category: 30,
  occasion: 30,
  season: 30,
  email: 255,
  displayName: 100
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSIONS = { width: 4000, height: 4000 };

/**
 * Sanitize text input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .substring(0, 500); // Limit length
}

/**
 * Validate text input length and content
 */
export function validateTextInput(input: string, field: keyof typeof MAX_INPUT_LENGTHS): {
  isValid: boolean;
  error?: string;
  sanitized: string;
} {
  const sanitized = sanitizeInput(input);
  const maxLength = MAX_INPUT_LENGTHS[field];
  
  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      error: `${field} must be ${maxLength} characters or less`,
      sanitized
    };
  }
  
  // Check for suspicious patterns
  if (sanitized.match(/<script|javascript:|data:/i)) {
    return {
      isValid: false,
      error: 'Invalid characters detected',
      sanitized: sanitized.replace(/<script|javascript:|data:/gi, '')
    };
  }
  
  return { isValid: true, sanitized };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeInput(email);
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  if (sanitized.length > MAX_INPUT_LENGTHS.email) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  return { isValid: true };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    };
  }
  
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: 'Image size must be less than 5MB'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate image dimensions (requires loading the image)
 */
export function validateImageDimensions(file: File): Promise<{
  isValid: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width > MAX_IMAGE_DIMENSIONS.width || img.height > MAX_IMAGE_DIMENSIONS.height) {
        resolve({
          isValid: false,
          error: `Image dimensions must be less than ${MAX_IMAGE_DIMENSIONS.width}x${MAX_IMAGE_DIMENSIONS.height}px`
        });
      } else {
        resolve({ isValid: true });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Unable to process image file'
      });
    };
    
    img.src = url;
  });
}

/**
 * Rate limiting utility for client-side
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Secure error message that doesn't leak sensitive information
 */
export function getSafeErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    // Don't expose database or internal errors
    if (error.message.includes('duplicate key') || 
        error.message.includes('constraint') ||
        error.message.includes('violates')) {
      return 'This operation is not allowed. Please try again.';
    }
    
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return 'Authentication required. Please log in again.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Content Security Policy configuration
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:', 'https://firebasestorage.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': [
    "'self'",
    'https://api.weatherapi.com',
    'https://www.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://syncstyle-9414d-default-rtdb.firebaseio.com',
    'https://*.cloudfunctions.net'
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};