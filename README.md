# Notely

AI-powered research notebook — block editor, real-time sync, BYOK assistant.

**Stack:** Next.js · Convex · Clerk · BlockNote · OpenRouter · Browserbase

## Features

- Block-based editor with slash commands and syntax-highlighted code blocks
- Real-time notes via Convex
- Per-user API keys (OpenRouter + Browserbase) — multi-tenant ready
- Research assistant that searches the web and edits your notes

## Quick start

See [SETUP.md](./SETUP.md) for full environment and deployment instructions.

```bash
npm install
cp .env.local.example .env.local
# Fill in Clerk + Convex URL in .env.local
# Set CLERK_JWT_ISSUER_DOMAIN in Convex dashboard
npm run dev
```

## Deploy

- **Frontend:** Vercel (Clerk + Convex public URL env vars)
- **Backend:** `npx convex deploy`
- **Users:** BYOK keys on first workspace visit

## License

Private — see repository owner.
