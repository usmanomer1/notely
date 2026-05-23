# Notely — Setup & Deployment

Notely is **BYOK** (Bring Your Own Keys). Each user connects their own OpenRouter and Browserbase keys in the workspace setup UI. Keys are stored per-user in Convex and never returned to the browser after save.

## Architecture

| Layer | Keys / config | Who provides |
|-------|----------------|--------------|
| **Next.js (Vercel)** | Clerk publishable + secret, Convex URL | App owner (you) |
| **Convex dashboard** | Clerk JWT issuer, optional platform OpenRouter/Browserbase | App owner (optional dev fallback) |
| **Per user (BYOK)** | OpenRouter + Browserbase | Each signed-in user via workspace setup |

### Local dev fallback

If you set `OPENROUTER_API_KEY` and `BROWSERBASE_API_KEY` in the **Convex dashboard**, your local account can skip entering keys (or click **Use server keys (dev)**). Production on Vercel should rely on BYOK unless you intentionally host shared keys.

---

## 1. Clone & install

```bash
git clone https://github.com/usmanomer1/notely.git
cd notely
npm install
```

## 2. Environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

### `.env.local` (Next.js — never commit)

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex dashboard → Settings → URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys |

### Convex dashboard (Settings → Environment variables)

| Variable | Required | Notes |
|----------|----------|-------|
| `CLERK_JWT_ISSUER_DOMAIN` | Yes | Clerk → Convex integration → Frontend API URL |
| `OPENROUTER_API_KEY` | Optional | Dev fallback only; users BYOK in production |
| `OPENROUTER_MODEL` | Optional | Default model if user doesn't set one |
| `BROWSERBASE_API_KEY` | Optional | Dev fallback only |

## 3. Clerk ↔ Convex

1. In [Clerk Dashboard](https://dashboard.clerk.com) → **Integrations** → activate **Convex**
2. Copy the JWT issuer domain into Convex as `CLERK_JWT_ISSUER_DOMAIN`

## 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first workspace visit you'll see **Set up your workspace** unless Convex platform keys are configured.

---

## Deploy to Vercel

1. Push this repo to GitHub (`.env.local` is gitignored)
2. [Import project in Vercel](https://vercel.com/new)
3. Set environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Deploy Convex to production: `npx convex deploy`
5. Set Convex production env vars (`CLERK_JWT_ISSUER_DOMAIN`, optional platform keys)
6. Add Vercel deployment URL to Clerk allowed origins if needed

Each user signs up, opens `/app/workspace`, and enters their own OpenRouter + Browserbase keys.

---

## User API keys

| Service | Purpose | Get a key |
|---------|---------|-----------|
| **OpenRouter** | LLM for the research assistant | [openrouter.ai/keys](https://openrouter.ai/keys) |
| **Browserbase** | Web search + page fetch | [browserbase.com/settings](https://www.browserbase.com/settings) |

Users can update keys anytime via the **Keys** button in the workspace header.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `tokens/convex` 404 | Enable Clerk Convex integration; set `CLERK_JWT_ISSUER_DOMAIN` |
| Setup screen won't dismiss | Enter both keys, or set platform keys in Convex + click **Use server keys (dev)** |
| AI errors after setup | Verify keys in workspace **Keys** settings; check OpenRouter/Browserbase dashboards |
| Works locally, not on Vercel | Confirm Vercel env vars and `npx convex deploy` for production |
