# Project Tracker

A Freedcamp-style project tracking app: projects, tasks, a status board
(To do / In progress / Done), live-updating stats, and realtime sync between
everyone on the team.

- **Frontend:** Vite + React + TypeScript + Tailwind CSS (static site)
- **Backend / database:** [Supabase](https://supabase.com) (Postgres + Realtime)
- **Hosting:** GitHub Pages
- **Auth:** none for now — the app is open to anyone with the URL. See
  [Security & next steps](#security--next-steps).

The Supabase client talks directly to the database from the browser, so there
is no server to run.

---

## 1. Set up Supabase (do this once)

You said you already created the project. Here is the rest.

### 1a. Create the tables

1. Open your project at <https://supabase.com/dashboard>.
2. In the left sidebar click **SQL Editor** → **New query**.
3. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo, copy its
   entire contents, paste them into the editor, and click **Run**.

This creates the `projects` and `tasks` tables, turns on Row Level Security with
open demo policies, and enables Realtime for both tables.

> Optional: to start with example data, run
> [`supabase/seed.sql`](supabase/seed.sql) the same way.

Verify it worked: click **Table Editor** in the sidebar — you should see
`projects` and `tasks`.

### 1b. Copy your API credentials

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy these two values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon / public** key — a long `eyJ...` string

> Use the **anon public** key, never the `service_role` key. The anon key is
> safe to expose in a browser; the `service_role` key bypasses all security.

### 1c. Add them to the frontend

Create a file named `.env.local` in the project root (copy `.env.example`) and
fill in your values:

```bash
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`.env.local` is git-ignored, so your keys never get committed.

---

## 2. Run it locally

```bash
npm install
npm run dev
```

Open the printed URL (usually <http://localhost:5173>).

If the credentials are missing the app shows an in-page setup guide instead of
crashing. After editing `.env.local`, **restart the dev server** — Vite only
reads env files at startup.

### Seeing realtime work

Open the app in two browser windows side by side. Add or edit a task in one and
watch the other update instantly. The badge in the header shows **Live** when
the realtime connection is up.

---

## 3. Deploy to GitHub Pages

### 3a. Push this project to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### 3b. Add the Supabase keys as repository secrets

The build needs the same two values from step 1b. In your GitHub repo:

**Settings → Secrets and variables → Actions → New repository secret**

| Name                     | Value                             |
| ------------------------ | --------------------------------- |
| `VITE_SUPABASE_URL`      | your Project URL                  |
| `VITE_SUPABASE_ANON_KEY` | your anon public key              |

### 3c. Turn on Pages

**Settings → Pages → Build and deployment → Source: GitHub Actions.**

That's it. The workflow in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds the app and
deploys it every time you push to `main`. Your site appears at:

```
https://<you>.github.io/<repo>/
```

You can also trigger a deploy manually from the **Actions** tab
(*Deploy to GitHub Pages → Run workflow*).

> The app uses `base: './'` in `vite.config.ts`, so assets load correctly from a
> project subpath (`/<repo>/`) without any extra configuration.

---

## Project structure

```
src/
  lib/supabase.ts        Supabase client (reads env vars, exposes config flag)
  types.ts               Database types + Project / Task models
  hooks/useTrackingData.ts   Data loading, CRUD, and realtime subscription
  lib/format.ts          Shared constants (statuses, priorities, dates)
  components/
    Header.tsx           Top bar + realtime status badge
    StatsCards.tsx       Dashboard stats
    Board.tsx            Kanban board (3 status columns)
    TaskCard.tsx         Single task
    TaskModal.tsx        Create / edit task form
    ProjectModal.tsx     Create / edit project form
    ProjectPanel.tsx     Project list with progress bars
    SetupGuide.tsx       Shown when env vars are missing
  App.tsx                Page composition, filters, modals
supabase/
  schema.sql             Run this in the Supabase SQL Editor
  seed.sql               Optional sample data
.github/workflows/deploy.yml   GitHub Pages deployment
```

`npm run build` type-checks and produces the static site in `dist/`.
`npm run lint` runs Oxlint.

---

## Security & next steps

Right now **anyone with the URL can read and write everything**. That is fine
for a demo but should be replaced before real use:

1. **Add authentication** — Supabase Auth (email/password or magic link) is a
   drop-in: `supabase.auth.signInWithPassword(...)`. The client library and
   session handling are already set up.
2. **Scope the data to owners** — add an `owner_id uuid` column (`auth.uid()`)
   to `projects`/`tasks`, then replace the demo policies in `schema.sql` with
   `using (auth.uid() = owner_id)`. Do this *before* trusting the deployment.
3. **Switch the anon key if leaked** — rotate it in Project Settings → API.

Handy Supabase features to explore next: **Storage** for file attachments,
**Edge Functions** for server-side logic, and **Database Webhooks** for
notifications.
