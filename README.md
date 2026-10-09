# Project Tracker

A Freedcamp-style project tracking app: projects, tasks, a status board
(To do / In progress / Done), live-updating stats, and realtime sync between
everyone on the team.

- **Frontend:** Vite + React + TypeScript + Tailwind CSS (static site)
- **Backend / database:** [Supabase](https://supabase.com) (Postgres + Auth + Realtime)
- **Hosting:** GitHub Pages
- **Auth:** Email/password **and** Google, with automatic account linking and a
  password-recovery flow. No 2FA.

The Supabase client talks directly to the database and auth service from the
browser, so there is no server to run.

---

## 1. Set up Supabase (do this once)

You already created the project. Here is the rest.

### 1a. Create the tables & policies

1. Open your project at <https://supabase.com/dashboard>.
2. Left sidebar → **SQL Editor** → **New query**.
3. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and
   click **Run**.

> Re-running `schema.sql` is safe (it is idempotent) and is how you update the
> security policies after this auth change. If you set the project up before
> auth, **run it again now** — it switches the tables from public access to
> signed-in-only access.

Optional: run [`supabase/seed.sql`](supabase/seed.sql) for sample data.

### 1b. Copy your API credentials

**Project Settings** (gear) → **API**. Copy:

- **Project URL** — `https://<project-ref>.supabase.co`
- **anon / public** key — the long `eyJ...` string

> Use the **anon public** key, never `service_role`. The anon key is safe in a
> browser; `service_role` bypasses all security.

### 1c. Add them to the frontend

Copy `.env.example` to `.env.local` and fill in both values:

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`.env.local` is git-ignored.

### 1d. Enable Email/password auth

**Authentication → Providers → Email** (enabled by default). For this demo,
**turn off “Confirm email”** so a new account can sign in immediately without an
SMTP setup. Turn it back on (and configure SMTP) before real use.

> Password reset always sends an email. The built-in Supabase email service is
> rate-limited (a couple of emails per hour) and is fine for testing. For
> production, configure a custom SMTP provider under **Authentication → Emails
> → SMTP Settings** (e.g. Resend, Postmark, SendGrid).

### 1e. Set up Google sign-in

**Step 1 — Google Cloud console** (<https://console.cloud.google.com>):

1. Create (or pick) a project.
2. Open the **Google Auth Platform** and configure the **OAuth consent screen**
   (app name, support email, scopes `openid`, `.../userinfo.email`,
   `.../userinfo.profile`). While the app is in *Testing*, add your teammates'
   addresses under **Audience → Test users**.
3. Go to **Clients** → **Create client** → Application type **Web application**.
4. **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://<your-username>.github.io`
5. **Authorized redirect URIs** (this is your *Supabase* callback, not your app):
   - `https://<project-ref>.supabase.co/auth/v1/callback`
6. Create it and copy the **Client ID** and **Client secret**.

**Step 2 — Supabase dashboard**:

**Authentication → Providers → Google** → enable it, paste the Client ID and
Client secret, and save.

### 1f. Configure redirect URLs

**Authentication → URL Configuration**:

- **Site URL:** `https://<your-username>.github.io/<repo>/`
- **Redirect URLs** (add each on its own line):
  - `http://localhost:5173/`
  - `https://<your-username>.github.io/<repo>/`

These must match the URL the app is running on, because the app derives its
`redirectTo` from the current address (so OAuth and password-reset links return
to the right place, even on a Pages subpath).

### 1g. Enable manual linking

**Authentication → Settings → enable “Manual Linking”** (some dashboard versions
show this toggle on the **Providers** page).

This powers the **Connect Google** button in *Sign-in methods*, so a user who
signed up with a password can add Google later (and vice-versa).

---

## 2. How accounts & linking work

This is the part that keeps people from ending up with duplicate accounts:

- **One user, many identities.** A Supabase user can have an `email` identity
  and a `google` identity at the same time.
- **Automatic linking (on by default).** When someone signs in with Google and a
  user with the **same verified email** already exists, Supabase links the
  Google identity to that existing user instead of creating a new one. So
  “sign up with Google” after “sign up with email” does **not** create a second
  account.
- **No duplicate on email signup.** If they try to create an email account for
  a Google address, Supabase returns an obfuscated response and sends no email;
  the app detects this and tells them to sign in or use Google instead (this
  also prevents email enumeration).
- **Manual linking.** Signed in already? *Sign-in methods* lets them **Connect
  Google** (`linkIdentity`) or **Set/Change password** (`updateUser`), so they
  can use either method on the go. They can disconnect Google as long as at
  least one other sign-in method remains.
- **Password recovery** works for any account that has an email, including
  Google accounts where the user later set a password.

---

## 3. Run it locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. If the credentials are missing the app shows an
in-page setup guide instead of crashing. After editing `.env.local`, restart the
dev server (Vite reads env files at startup only).

Without signing in you can't reach the board — the tables now deny the `anon`
role, and the UI shows the sign-in screen.

---

## 4. Deploy to GitHub Pages

1. Push the project to GitHub (`main` branch).
2. **Settings → Secrets and variables → Actions** → add repository secrets:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. **Settings → Pages → Source: GitHub Actions.**

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
builds and deploys on every push to `main`. Site URL:
`https://<your-username>.github.io/<repo>/`.

Remember to add that production URL to the Supabase **Redirect URLs** (step 1f)
and to Google's **Authorized JavaScript origins** (step 1e).

---

## Project structure

```
src/
  auth/
    AuthProvider.tsx   Auth state + all auth calls (sign in/up, Google, reset, link)
    authContext.ts     Auth context + useAuth hook + types
    authRedirect.ts    Builds redirect URLs, reads auth errors from the URL
  lib/supabase.ts      Supabase client (env vars, session persistence)
  types.ts             Database types + Project / Task models
  hooks/useTrackingData.ts   Data loading, CRUD, and realtime subscription
  components/
    Tracker.tsx        The signed-in project board
    Header.tsx         Top bar + realtime badge + user menu
    StatsCards.tsx     Dashboard stats
    Board.tsx / TaskCard.tsx / TaskModal.tsx
    ProjectPanel.tsx / ProjectModal.tsx
    SetupGuide.tsx     Shown when env vars are missing
    auth/
      AuthScreen.tsx           Sign in / create account + Google
      ForgotPasswordScreen.tsx Request a reset link
      ResetPasswordScreen.tsx  Set a new password (from the email link)
      UserMenu.tsx             Account dropdown
      AccountSettingsModal.tsx Connected sign-in methods
  App.tsx              Auth gate: setup guide → auth screens → tracker
supabase/
  schema.sql           Tables, RLS policies, realtime (re-run to update)
  seed.sql             Optional sample data
.github/workflows/deploy.yml   GitHub Pages deployment
```

`npm run build` type-checks and produces the static site in `dist/`.
`npm run lint` runs Oxlint.

---

## Security & next steps

Done: only **signed-in** users can read/write the tables (RLS policies target the
`authenticated` role). Still, **every signed-in user sees the same shared data**.

When you tackle project management and invitations:

1. Add membership/ownership columns (e.g. `owner_id uuid default auth.uid()` on
   `projects`, plus a `project_members` table).
2. Replace the `using (true)` policies with membership-scoped ones, e.g.
   `using (auth.uid() = owner_id or is_member(project_id))`.
3. Consider a **database trigger** to auto-add the creator as a project member.

Other things to enable before real use: **email confirmations** + custom SMTP,
**Captcha** on the auth endpoints, and stricter **rate limits**.
