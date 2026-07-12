# ROF — Real Old Friend

Senior AI companion web app. Companion name defaults to **Rofy** (customizable).

## Stack

- Next.js 15 (App Router)
- Tailwind CSS
- Supabase (auth + database)
- Grok API (xAI) for AI features

## Getting started

1. Copy `.env.example` to `.env.local` and fill in Supabase + xAI keys.
2. In Supabase: enable **Email** auth (and optionally Google). Run `supabase/profiles.sql`.
3. Add redirect URL `http://localhost:3000/auth/callback` under Authentication → URL Configuration.
4. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the login screen is first. After sign-in you land on the main app. Use **Settings** to rename your companion (stored in `profiles.companion_name`).

## Family Portal

A separate app lives in [`family-portal/`](./family-portal) and shares the same Supabase database.

```bash
cd family-portal
cp .env.example .env.local   # same Supabase keys + NEXT_PUBLIC_ROF_APP_URL
npm install
npm run dev                  # http://localhost:3001
```

Also run `supabase/family-portal.sql` once. Loved ones share their **Connection ID** from ROF Settings so family can link.

## Current status

- Sign-in (email/password, optional Google, or guest)
- Dynamic companion name across header, chat, mood, and stories
- Voice-enabled Talk with companion (mic + Speak)
- Home: Talk with companion, mood check-in, share a story, meal ideas
- Feature modals from the sidebar (reminders, lists, meals, book club, and more)
- Family Portal for stories, photos, voice notes, and messages
- **PWA**: installable (“ROF — Real Old Friend”), offline shell, Add to Home Screen prompt

## PWA notes

- Manifest: `/manifest.webmanifest` (generated from `src/app/manifest.ts`)
- Service worker: `/sw.js` (registers on load)
- Icons: `public/icons/`
- First visit shows a gentle Home Screen tip (dismissible)
- Use HTTPS (or localhost) so install + offline work in the browser
