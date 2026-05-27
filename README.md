# Agent MCP Sandbox

A private multi-agent LLM sandbox for agent orchestration, conversation capture, role-based access control, vector search, memory experiments, and operational monitoring.

This repository is intended to be the canonical agent-infrastructure workspace. Keep browser clients, server-side model calls, API keys, audit logs, and vector-memory operations clearly separated.

## Core Capabilities

- Multi-agent conversations across configurable model providers
- Agent templates, tags, roles, and permissions
- Conversation storage, semantic search, and memory experiments
- NextAuth-based authentication with role-aware sessions
- Audit logs for security-sensitive actions
- Prometheus-style metrics endpoint for monitoring
- Optional Upstash Vector integration for embeddings/search

## Security Rules

1. **Never expose LLM provider keys to the browser.**
   Use server-only environment variables such as `GROQ_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`.

2. **Do not use `NEXT_PUBLIC_*` for secrets.**
   Variables prefixed with `NEXT_PUBLIC_` are bundled into client-side code and must only contain public, non-sensitive configuration.

3. **Keep `.env.local` out of git.**
   Commit `.env.example` only.

4. **Log agent actions, not secrets.**
   Audit trails should record who did what, when, and against which resource without writing tokens, passwords, API keys, or raw private prompts into logs.

## Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database, for example Neon
- Server-side LLM provider key, for example Groq, OpenAI, or Anthropic

## Quick Start

```bash
git clone https://github.com/morpheus18-glitch/Agent-mcp.git
cd Agent-mcp
pnpm install
cp .env.example .env.local
pnpm run check-env
pnpm run setup-db
pnpm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` locally. Do not commit it.

```env
# App/Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-strong-random-secret

# Database
DATABASE_URL=postgres://user:password@hostname:port/database

# Server-only LLM provider keys
GROQ_API_KEY=replace-with-server-only-key
# OPENAI_API_KEY=replace-with-server-only-key
# ANTHROPIC_API_KEY=replace-with-server-only-key

# Optional vector store
UPSTASH_VECTOR_REST_URL=replace-if-used
UPSTASH_VECTOR_REST_TOKEN=replace-if-used
```

## Database Schema

The application is expected to manage:

- `users`, `user_profiles`
- `agents`, `agent_templates`
- `conversations`, `conversation_agents`, `messages`
- `conversation_tags`, `message_embeddings`, `conversation_analysis`
- `sentiment_analysis`, `ai_memory`, `training_jobs`
- `roles`, `permissions`, `role_permissions`, `user_roles`
- `audit_logs`, `menus`, `menu_permissions`
- `settings`, `configurations`, `system_metrics`

## API Surface

- `/api/auth/*` — authentication
- `/api/users/*` — user management
- `/api/agents/*` — agent management
- `/api/conversations/*` — conversation management
- `/api/templates/*` — template management
- `/api/analytics/*` — analytics and reporting
- `/api/vector/*` — vector search and embeddings
- `/api/training/*` — model training workflows
- `/api/metrics` — operational metrics

## Recommended Next Fixes

- Rename the package from `my-v0-project` to `agent-mcp-sandbox`.
- Add a formal `docs/MCP_SPEC.md` describing tools, resources, permissions, and audit behavior.
- Add integration tests for auth, RBAC, audit logging, vector search, and model-provider routing.
- Pin dependency versions instead of relying on broad or `latest` ranges.
- Add CI for lint, typecheck, build, and tests.

## License

MIT License unless a repository-level `LICENSE` file states otherwise.
