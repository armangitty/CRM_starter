# Leadport

Agency CRM for running Facebook ads for client companies, capturing leads, taking bookings, and giving each company a password-protected portal — the same sub-account model as GoHighLevel.

Stack: **Next.js on Vercel**, **Supabase** (auth + Postgres + RLS), **GitHub**.

## What you have now

- Agency signup and dashboard
- Client sub-accounts (one company each)
- Portal logins you create (email + password)
- Leads list (manual, booking page, Facebook Lead Ads webhook)
- Public booking page at `/book/[slug]` that writes into that company’s portal
- Meta webhook at `/api/webhooks/meta`

Not in this first cut (GHL Unlimited extras we can add next): automations/workflows, two-way SMS, funnels/websites, reputation, SaaS billing, white-label domain.

## 1. GitHub

Create a repo and push this folder (GitHub CLI example):

```bash
git add .
git commit -m "Initial Leadport agency CRM"
gh repo create leadport --private --source=. --remote=origin --push
```

Or create an empty repo on github.com and add `origin`.

## 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and paste `supabase/migrations/0001_init.sql`.
3. **Authentication → URL Configuration**
   - Site URL: `https://crm-starter-steel.vercel.app` in production, `http://localhost:3000` for local-only testing (production Site URL should be the live domain).
   - Redirect URLs must include:
     - `http://localhost:3000/auth/callback`
     - `https://crm-starter-steel.vercel.app/auth/callback`
     - `https://crm-starter-steel.vercel.app/auth/callback?next=/auth/reset-password`
   - Keep **Confirm email** on (Authentication → Providers → Email).
4. Copy **Project URL**, **anon/publishable key**, and **service role key** from Settings → API. Never put the service role key in `NEXT_PUBLIC_` variables.

## 3. Local env

```bash
cp .env.example .env.local
```

Fill in the Supabase values and `NEXT_PUBLIC_APP_URL=http://localhost:3000`.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an agency, add a client company, issue a portal password, then sign in as that user at `/login`.

## 4. Vercel

1. Import the GitHub repo in [vercel.com](https://vercel.com).
2. Add env vars (Production + Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (not public), `NEXT_PUBLIC_APP_URL=https://crm-starter-steel.vercel.app`, `META_VERIFY_TOKEN`.
3. Deploy from GitHub `main`. After deploy, confirm `/login`, `/signup`, `/forgot-password`, and `/auth/callback` load on the production domain.

## 5. Facebook Lead Ads

1. In Meta for Developers, add the **Webhooks** product to your app.
2. Callback URL: `https://YOUR_DOMAIN/api/webhooks/meta`
3. Verify token: same as `META_VERIFY_TOKEN`.
4. Subscribe to `leadgen` on the Page.
5. In Leadport → client account, save **Facebook Page ID** and **Page access token**.

New form fills become contacts with source `facebook_lead_ad` and show in that client’s portal.

## Daily flow

1. You (agency) create a sub-account for the company you run ads for.
2. You create their portal user and send email + password.
3. You connect their Facebook Page and run Lead Ads / drive traffic to `/book/their-slug`.
4. They log in at `/login` and see leads and bookings.

## Security notes

- Never commit `.env.local`. The service role key bypasses RLS — Vercel env only.
- Page access tokens are stored in `account_secrets` (no client RLS policies; service role only).
