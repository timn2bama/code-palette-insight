## Copilot instructions — repository-specific
```markdown
# Copilot instructions — repository-specific (short)

This file gives concise, actionable guidance for AI coding agents working in this mono-repo. Keep edits small, isolated, and reversible.

Why this repo matters
- Frontend: `code-palette-insight/` — Vite + React + TypeScript app (AI front-ends live under `src/hooks` and `src/components`).
- Backend: `mcp-server/` — a TypeScript Model Context Protocol (MCP) server that exposes Supabase DB operations to assistants.

Essential commands (PowerShell)
- Start frontend: `cd code-palette-insight; npm install; npm run dev`
- Start MCP server: `cd mcp-server; npm install; npm run dev` (VS Code task `MCP: Start Supabase Server` starts this in background)
- Context7 MCP: `context7-mcp --transport stdio` (executable name is `context7-mcp`, not `context7`)
- Claude CLI sanity: `claude --help`

Key files and places to edit
- `code-palette-insight/src/hooks` and `src/components` — AI integrations (examples: `useClaude.ts`, `ClaudeFashionChat.tsx`).
- `mcp-server/src/index.ts` — MCP entry; check `tools`/`handlers` for exposed assistant tools.
- `supabase/seed.sql` — SQL helper functions the MCP expects; load them into the DB if missing.
- `.vscode/tasks.json` — useful tasks: `MCP: Start Supabase Server`, `MCP: Start Context7 Server`, `MCP: Start All Servers`.

Conventions agents must follow
- Keep changes inside the appropriate subfolder. Do not add root-level runtime code or a root `package.json` without explicit approval.
- Never commit secrets. Use `.env.example` or `env(NAME)` in `supabase/config.toml`. Ask the user to provide secrets or set CI secrets for deployments.
- New AI features should be behind feature flags and should not hard-code API keys or service-role tokens.

MCP & Supabase specifics
- MCP communicates over stdio and publishes a ready line the tasks rely on; look for that console message when starting.
- Exposed MCP tools include `query_table`, `list_tables`, `get_table_schema`, `insert_data`, `update_data`, `delete_data` — inspect `mcp-server/src` for exact signatures.
- If table listings or schema calls fail, ensure `SUPABASE_SERVICE_ROLE_KEY` is available for the server and Docker (local Supabase) is running when testing locally.

Safe vs unsafe edits
- Safe: UI fixes, documentation, small refactors, `.env.example` updates, and adding a single commented example in `dataconnect/`.
- Ask first: adding/removing top-level dependencies, changing Supabase project IDs/region, committing real secrets, or mass-uncommenting example blocks.

Debugging tips
- If `.env` is hidden on Windows, use `env.local` in `mcp-server/`; the server logs which file was loaded.
- For local Supabase, start Docker before running the stack; check `supabase status` and `supabase start` as needed.

References: `code-palette-insight/README.md`, `mcp-server/README.md`, `supabase/` directory

If you'd like, I can expand with a short checklist for starting all servers, or paste concrete MCP tool signatures from `mcp-server/src`.

```
