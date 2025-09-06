module.exports = {
  extends: ['@eslint/js/configs/recommended'],
  rules: {
    // Security-focused rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-alert': 'error',
    'no-console': 'warn',
    
    // Prevent common security issues
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'no-unreachable': 'error',
    
    // React security
    'react/no-danger': 'error',
    'react/no-danger-with-children': 'error',
    'react/jsx-no-target-blank': 'error',
  },
};