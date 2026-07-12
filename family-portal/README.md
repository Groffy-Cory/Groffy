# Real Family Stories — Family Portal

Separate Next.js app that shares the **same Supabase project** as the main ROF app.

## Features

- Family member login (email/password)
- Connect to a loved one by their ROF email or Connection ID
- Add stories, photos, and voice notes to the shared Memory Vault
- Send notes to the main app Messages inbox (`source = family`)
- View the Memory Vault
- Link back to the main ROF app

## Local setup

1. Copy `.env.example` to `.env.local` and use the **same** Supabase URL/anon key as the main app.
2. Set `NEXT_PUBLIC_ROF_APP_URL` (local default `http://localhost:3000`).
3. In Supabase, run (if not already):
   - `../supabase/profiles.sql`
   - `../supabase/memory-vault.sql`
   - `../supabase/messages.sql`
   - `../supabase/family-portal.sql` (access + family message policies + storage)
4. Install and run on a **different port** than the main app:

```bash
npm install
npm run dev -- --port 3001
```

Open [http://localhost:3001](http://localhost:3001).

## How linking works

1. Loved one signs up in the main ROF app.
2. In ROF **Settings**, they can copy their **Connection ID**.
3. Family signs into this portal and enters that ID (or the loved one’s email).
4. A row is written to `memory_vault_access`, unlocking vault + family messages.

## Deploy (separate Vercel project later)

- Create a new Vercel project rooted at `family-portal/`
- Set the same `NEXT_PUBLIC_SUPABASE_*` env vars
- Set `NEXT_PUBLIC_ROF_APP_URL` to the production ROF URL
- Add the portal URL to Supabase Auth redirect allow-list (`…/auth/callback`)
