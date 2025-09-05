# Good Practice Coding Prompts

This file contains ready-to-use prompts for maintaining code quality in this repository. Each prompt is designed to work with AI assistants and follows the repo's specific structure and conventions.

## Frontend Quality & Testing (React + TypeScript)

### Component Refactoring
```
Refactor the React component at `code-palette-insight/src/components/[COMPONENT_NAME].tsx` to follow these best practices:
- Use TypeScript interfaces for all props
- Implement proper error boundaries
- Extract reusable UI logic into custom hooks
- Add PropTypes or strict TypeScript types
- Ensure accessibility (ARIA labels, keyboard navigation)
- Add unit tests with Vitest that mock external dependencies
Show the refactored component and test file with expected passing output.
```

### Hook Testing & Optimization
```
Create comprehensive unit tests for `code-palette-insight/src/hooks/useClaude.ts` covering:
- Happy path API responses
- Network failure scenarios
- Loading states and error handling
- Edge cases (empty responses, timeouts)
Use proper mocking for HTTP calls and keep tests under 200ms execution time.
Provide test commands and expected output.
```

### Performance Review
```
Analyze `code-palette-insight/src/components/` for performance issues:
- Identify components with expensive re-renders
- Find missing React.memo, useCallback, or useMemo optimizations
- Detect large props or context value changes
- Propose 3 specific optimizations with code examples
- Include before/after performance impact estimates
```

## MCP Server Quality & Safety

### Type-Safe Handler Implementation
```
Implement a new MCP tool handler in `mcp-server/src/tools/` following these requirements:
- Use strict TypeScript types for inputs/outputs
- Validate all input parameters with runtime checks
- Include proper error handling and logging
- Follow existing handler patterns in the codebase
- Add comprehensive unit tests with mocked Supabase responses
- Update the exported tools list
Show implementation, tests, and integration steps.
```

### Environment Configuration Hardening
```
Audit `mcp-server/` for environment variable usage and create a hardened config system:
- Replace direct process.env access with a typed config loader
- Throw clear errors for missing required variables
- Document all environment variables in README
- Create validation for required vs optional vars
- Add startup checks that fail fast on misconfiguration
Provide the config.ts file and usage examples.
```

### MCP Protocol Compliance
```
Review the MCP server implementation in `mcp-server/src/index.ts` for protocol compliance:
- Verify all tool responses match MCP specification
- Check error handling follows MCP error format
- Validate stdio communication patterns
- Ensure proper tool registration and discovery
- Add integration tests that verify protocol compliance
Show any fixes needed and test verification steps.
```

## Database & Infrastructure Safety

### Safe Migration Planning
```
Create a safe database migration plan for [DESCRIBE_CHANGE]:
- Write the minimal SQL migration file
- Provide exact `supabase` CLI commands for create/deploy
- List all required environment variables and their sources
- Include rollback strategy and verification steps
- Document any data migration or seed updates needed
Do not commit secrets - use placeholder values and document where real values should be stored.
```

### Schema Helper Verification
```
Create a verification script for `supabase/seed.sql` helper functions:
- Test all SQL functions are properly installed
- Verify MCP tools can access required functions
- Include troubleshooting steps for common failures
- Add commands to reinstall helpers if needed
- Provide example usage for each helper function
Show the verification script and expected successful output.
```

## Security & Secrets Management

### Secret Audit & Remediation
```
Perform a comprehensive secret scan of the repository:
- Search for patterns: API_KEY, SECRET, PRIVATE_KEY, password, token
- Exclude .env files and gitignored paths
- For each finding, provide file path and redacted snippet
- Propose remediation strategy (.env.example, env(NAME) syntax)
- Generate commit messages for fixes
- Create PR description template for security review
Do not expose actual secret values in output.
```

### Pre-commit Security Check
```
Create a pre-commit security checklist for this repository:
- Verify no secrets in tracked files
- Check .env files are not committed
- Validate MCP handlers have proper input validation
- Ensure API keys use environment variable patterns
- Confirm Supabase config uses env(NAME) syntax
Provide a script that can be run locally and in CI.
```

## Code Review & PR Quality

### PR Description Generator
```
Given these changed files: [LIST_FILES] and summary: [SUMMARY], generate a comprehensive PR description:
- What changed and why
- Breaking changes and migration steps
- Testing strategy and verification steps
- Security considerations for reviewers
- Deployment notes and environment requirements
- Reviewer assignment suggestions based on changed areas
Format as markdown ready for GitHub PR.
```

### Commit Message Standardization
```
Given this diff summary: [DIFF_SUMMARY], create:
- Conventional commit message following semantic versioning
- Detailed commit body explaining the change
- CHANGELOG.md entry focusing on user impact
- Any required migration or upgrade steps
- Links to related issues or documentation
Follow the repo's existing commit style and changelog format.
```

## Documentation & Onboarding

### Agent Documentation Update
```
Expand `.github/copilot-instructions.md` with these additions:
- Step-by-step agent quickstart (exact PowerShell commands)
- Common troubleshooting scenarios and solutions
- How to identify and test MCP server ready state
- Where to find and add API keys for local development
- File organization and naming conventions
Keep additions concise and actionable for AI agents.
```

### Developer Onboarding Checklist
```
Create a comprehensive onboarding checklist for new developers:
- Required software versions (Node.js, npm, Docker)
- Environment setup commands for each service
- How to run tests and verify everything works
- Common development workflows and commands
- Debugging techniques for frontend and MCP issues
- Code style and contribution guidelines
Format as a step-by-step checklist with verification commands.
```

## Testing & Quality Assurance

### Edge Case Test Generation
```
For component `[COMPONENT_NAME]`, create tests for these edge cases:
- Empty or null data states
- Network timeouts and failures
- Rapid user interactions
- Large dataset handling
- Accessibility requirements
- Mobile/responsive behavior
Use appropriate testing libraries and provide clear assertions.
```

### Integration Test Framework
```
Set up integration testing for the MCP server:
- Test full stdio communication flow
- Verify all exposed tools work end-to-end
- Mock Supabase responses appropriately
- Include performance benchmarks
- Add CI/CD integration commands
Provide test files and runner configuration.
```

## Operational Excellence

### Monitoring & Logging
```
Implement proper logging for the MCP server:
- Structured logging with consistent format
- Performance metrics for tool operations
- Error tracking with context
- Debug mode for development
- Log rotation and retention policies
Show logging implementation and monitoring setup.
```

### Runbook Creation
```
Create operational runbooks for common issues:
- "MCP server fails to start" troubleshooting
- "Frontend can't connect to backend" debugging
- "Database connection issues" resolution
- "Performance degradation" investigation
Include exact commands, expected outputs, and escalation paths.
```

## Usage Template

For any prompt above, use this standardized format:

```
Repo: Coding-Projects
Tech Stack: React + TypeScript (frontend), Node.js + TypeScript (MCP server), Supabase (database)
Task: [Insert specific prompt from above]
Files to inspect: [Relevant file paths]
Constraints: No secrets in code, small isolated changes, follow existing patterns
Output: [Files changed, test results, commit message]
```

## Quick Reference Commands

### Start Development Environment
```powershell
# Terminal 1: Frontend
cd code-palette-insight
npm install
npm run dev

# Terminal 2: MCP Server
cd mcp-server
npm install
npm run dev
```

### Run Tests
```powershell
# Frontend tests
cd code-palette-insight
npm test

# MCP server tests
cd mcp-server
npm test
```

### Security Scan
```powershell
# Search for potential secrets (modify pattern as needed)
git grep -i "api_key\|secret\|password\|token" | grep -v ".env.example"
```

---

*Last updated: September 3, 2025*
*For questions or updates to these prompts, see `.github/copilot-instructions.md`*
