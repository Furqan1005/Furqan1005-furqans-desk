# Furqan's Desk

Personal issue/task tracker. "Nothing falls through the cracks."

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (Postgres, Auth, Realtime) + Zustand.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - from your Supabase project's
  Project Settings -> API. A project is already provisioned and pre-filled for development
  (schema + seed data applied via the Supabase MCP connector).
- `ANTHROPIC_API_KEY` - required for the three AI features below. Get one from
  [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys). Without it,
  the AI routes respond with a clear "not configured" error instead of crashing the app - every
  other page and feature works normally.

```bash
npm run dev
```

Sign up from `/login` (Sign up tab) to create your account - the first field asks for your name,
which is used to match issues assigned to you on the **My Work** page. If your Supabase project
has "Confirm email" enabled under Auth settings, you'll need to confirm the email before you can
log in.

## Data model

Two tables, one shared Supabase project - every page in the app reads from the same `issues` /
`activity_log` data via one Zustand store (`lib/store/issues-store.ts`) that is initialized once
and kept live with Supabase Realtime subscriptions. No page holds its own copy of the data.

- `issues` - title, description, category, status, priority, assigned_to, start/deadline/fixed
  dates, remarks, archived flag.
- `activity_log` - one row per change to an issue (created, status/priority changes, reassignment,
  archive/unarchive), shown in the AI-generated daily update.
- `app_settings` - single row holding the category list and default status/priority used by the
  New Issue form (edited from Settings).

Schema, RLS policies, and seed data were applied directly via the Supabase MCP connector - there's
no local `supabase/migrations` folder to run.

## Pages

Overview, All Issues, My Work, Calendar, In Progress, Due This Week, Archived, Desk AI, Settings -
see the sidebar. Each pre-filtered view (My Work / In Progress / Due This Week / Archived) filters
the same shared store client-side; nothing is a separate query or mock list.

## AI features (`app/api/ai/*`, server-side only, Claude API)

1. **`/api/ai/summarize`** - powers "Generate Today's Update" on Overview. Pulls today's
   `activity_log` rows and overdue issues straight from Supabase (server-side, using your session)
   and asks Claude for a short status update. Shown in an editable, copyable dialog.
2. **`/api/ai/suggest`** - as you type a new issue's title/description, suggests a priority and
   category as a dismissible chip. Never applied without clicking "Accept".
3. **`/api/ai/search`** - parses a natural-language query (e.g. "open P1s assigned to Kaushal")
   into structured filters for All Issues. Falls back to a plain substring search if parsing fails
   or no API key is configured.
4. **`/api/ai/chat`** - powers the Desk AI page, a real chat backed by Claude grounded in your
   current (non-archived) issues.

All four require an authenticated session and never expose `ANTHROPIC_API_KEY` to the client.

## Verification status

See the project brief's verification checklist. Confirmed directly against the database via the
Supabase MCP connector: schema matches the spec (including the `archived` column and status/
priority check constraints added on top of the original spec), RLS policies restrict all tables to
`authenticated`, Realtime is enabled on all three tables, and the seed data loaded correctly.

`npm run build` passes cleanly (no TypeScript errors).

**Not verified in this dev session:** live browser click-through of sign-up/login, inline edits, and
refresh-persistence. The sandbox this was built in blocks outbound network access to `*.supabase.co`
(a 403 from the environment's egress proxy, confirmed with `curl`), so the dev server here cannot
reach Supabase Auth/Data at all - it isn't a bug in the app, just this session's network policy. Please
run `npm run dev` locally (or check the Vercel deployment) and click through the checklist yourself;
everything is wired to Supabase, not mock data, and the build/type-check already passed.

## Deploy

Deploy target is Vercel. Set the same three env vars as above in Project Settings -> Environment
Variables before deploying.
