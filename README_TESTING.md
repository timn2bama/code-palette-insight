# Testing Guide for SyncStyle

## Overview

This project uses Jest and React Testing Library for unit and integration tests.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- Navigation.test.tsx
```

## Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── Navigation.test.tsx
│       └── ProtectedRoute.test.tsx
├── hooks/
│   └── queries/
│       └── __tests__/
│           ├── useAuth.test.ts
│           └── useWardrobeItems.test.ts
└── utils/
    └── __tests__/
        └── seo.test.ts
```

## Coverage Goals

- **Minimum**: 70% for all metrics (lines, branches, functions, statements)
- **Target**: 80%+ for critical paths (authentication, data operations)

## What to Test

### High Priority
- ✅ Authentication flows (sign in, sign up, sign out)
- ✅ Protected routes and authorization
- ✅ Critical user flows (wardrobe management, outfit creation)
- ✅ SEO utilities and metadata generation

### Medium Priority
- Data mutations (create, update, delete operations)
- Navigation and routing
- Form validation
- Error handling

### Low Priority
- UI component rendering
- Styling and layout
- Third-party integrations

## Writing Tests

### Component Tests

```tsx
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hook Tests

```tsx
import { renderHook } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('returns expected values', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(expectedValue);
  });
});
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Mock external dependencies**: Use Jest mocks for Supabase, APIs, etc.
3. **Test behavior, not implementation**: Focus on what users see/do
4. **Use meaningful test names**: Describe what is being tested
5. **Clean up**: Reset mocks and query cache between tests

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main`

Coverage reports are uploaded to Codecov.

## Next Steps

### To Add
1. E2E tests with Playwright
2. Integration tests for complete user flows
3. Visual regression tests
4. Performance tests

### Manual Steps Required

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```
