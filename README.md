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
3. **Authentication → Providers → Email**: turn **Confirm email** off so agency signup can create the org in the same step.
4. Copy **Project URL**, **anon key**, and **service role key** from Settings → API.

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
2. Add the same env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `META_VERIFY_TOKEN`).
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://leadport.vercel.app`).
4. Deploy. After the first domain is known, add that URL to Supabase **Authentication → URL configuration** (`Site URL` + redirect `https://your-domain/auth/callback` if you add magic links later).

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
