# Contributing to Smart Wardrobe App

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Keep discussions professional and on-topic

## Getting Started

1. **Fork the repository** and clone your fork
2. **Install dependencies**: `npm install`
3. **Start dev server**: `npm run dev`
4. **Create a branch** for your feature: `git checkout -b feature/your-feature-name`

### Prerequisites

- Node.js 18+ and npm
- Basic knowledge of React, TypeScript, and Tailwind CSS
- Familiarity with Supabase (for backend changes)

## Development Workflow

### Project Architecture

```
Frontend (React + TypeScript)
├── Components (shadcn-ui)
├── Pages (Route components)
├── Hooks (Data fetching & business logic)
├── Stores (Global state - Zustand)
└── Utils (Helpers & validation)

Backend (Supabase)
├── Database (PostgreSQL + RLS)
├── Auth (Email, social providers)
├── Storage (Image uploads)
└── Edge Functions (Serverless APIs)
```

### Key Technologies

- **React Query** for server state management
- **Zustand** for client state management
- **Zod** for schema validation
- **React Hook Form** for form handling

## Code Standards

### TypeScript

- **Always use TypeScript** - no `.js` or `.jsx` files
- **Define interfaces** for all data structures
- **Use proper types** - avoid `any` unless absolutely necessary
- **Export types** from a central location when shared

```typescript
// ✅ Good
interface WardrobeItem {
  id: string;
  name: string;
  category: string;
}

// ❌ Bad
const item: any = { ... };
```

### React Components

- **Use functional components** with hooks
- **Extract complex logic** into custom hooks
- **Keep components focused** - single responsibility
- **Use proper prop types** with TypeScript interfaces

```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'outline';
}

export const Button = ({ onClick, children, variant = 'default' }: ButtonProps) => {
  return <button onClick={onClick} className={...}>{children}</button>;
};
```

### File Organization

- **Group by feature** - keep related files together
- **Use index files** for clean imports
- **Hooks in `/hooks`** - data fetching hooks in `/hooks/queries`
- **Reusable components** in `/components`
- **Page components** in `/pages`

### Styling

- **Use Tailwind CSS** for all styling
- **Use semantic tokens** from `index.css` (e.g., `bg-background`, `text-foreground`)
- **Avoid inline colors** - use design system tokens
- **Mobile-first** responsive design

```tsx
// ✅ Good - Using semantic tokens
<div className="bg-background text-foreground border-border">

// ❌ Bad - Using direct colors
<div className="bg-white text-black border-gray-200">
```

### State Management

- **React Query** for server state (API data)
- **Zustand** for global client state (UI preferences)
- **Local state** for component-specific state

```typescript
// Server state - Use React Query
const { data, isLoading } = useQuery({
  queryKey: ['wardrobe-items'],
  queryFn: fetchWardrobeItems
});

// Global client state - Use Zustand
const { theme, setTheme } = useAppStore();

// Local state - Use useState
const [isOpen, setIsOpen] = useState(false);
```

### Error Handling

- **Always handle errors gracefully**
- **Use toast notifications** for user feedback
- **Log errors** to the error logger service
- **Provide fallback UI** for failed states

```typescript
// ✅ Good
try {
  await submitData();
  toast({ title: "Success!", description: "Data saved." });
} catch (error) {
  toast({ 
    title: "Error", 
    description: "Failed to save data.",
    variant: "destructive" 
  });
  logError(error);
}
```

### Security

- **Validate all inputs** using Zod schemas
- **Sanitize user data** before rendering
- **Use RLS policies** for database security
- **Never expose secrets** in client code
- **Follow OWASP guidelines**

```typescript
// ✅ Good - Input validation
const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
});

const result = schema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
}
```

## Commit Guidelines

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(wardrobe): add bulk delete functionality

Add ability to select and delete multiple items at once

Closes #123

---

fix(auth): resolve token refresh issue

The token was not being refreshed properly on page reload

---

docs(readme): update installation instructions
```

## Pull Request Process

1. **Update documentation** if you've changed APIs or added features
2. **Add JSDoc comments** for complex functions
3. **Test your changes** thoroughly
4. **Update the README** if needed
5. **Keep PRs focused** - one feature/fix per PR
6. **Write descriptive PR descriptions**

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How have you tested this?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

## Code Review Guidelines

### For Reviewers

- Be constructive and kind
- Explain the "why" behind suggestions
- Approve when changes look good
- Ask questions if anything is unclear

### For Contributors

- Respond to all comments
- Make requested changes promptly
- Ask for clarification if needed
- Mark conversations as resolved

## Questions?

Feel free to:
- Open an issue for bugs or feature requests
- Ask questions in pull request comments
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the project's license.
