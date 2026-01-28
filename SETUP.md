# Phantom - Setup Guide

Step-by-step instructions to configure Supabase (auth + database), connect the app, and deploy to Vercel.

---

## Prerequisites

- Node.js 18+
- A GitHub account (for Vercel deployment)
- A Supabase account (free tier works): https://supabase.com
- (Optional) An Azure/Microsoft Entra ID account for Microsoft OAuth

---

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click **New Project**
3. Fill in:
   - **Name**: `phantom` (or whatever you prefer)
   - **Database Password**: generate a strong password and save it somewhere safe
   - **Region**: pick the closest to your users
4. Click **Create new project** and wait for provisioning (~2 minutes)

### Get your API credentials

5. In your project dashboard, go to **Settings** (gear icon) → **API**
6. Copy these two values -- you'll need them shortly:
   - **Project URL** (looks like `https://abcdefg.supabase.co`)
   - **anon / public** key (the long `eyJ...` string)

---

## Step 2: Create the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste the entire SQL block below and click **Run**:

```sql
-- ============================================
-- Phantom: Dashboard Storage Schema
-- ============================================

-- Dashboards table
CREATE TABLE dashboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Dashboard',
  scenario TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  layout_mode TEXT NOT NULL DEFAULT 'Free',
  theme_palette TEXT DEFAULT 'Power BI Default',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  share_id TEXT UNIQUE DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX idx_dashboards_share_id ON dashboards(share_id) WHERE share_id IS NOT NULL;

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Users can read their own dashboards
CREATE POLICY "Users can view own dashboards"
  ON dashboards FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view dashboards marked as public
CREATE POLICY "Anyone can view public dashboards"
  ON dashboards FOR SELECT
  USING (is_public = true);

-- Users can create dashboards (user_id must match)
CREATE POLICY "Users can create own dashboards"
  ON dashboards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own dashboards
CREATE POLICY "Users can update own dashboards"
  ON dashboards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own dashboards
CREATE POLICY "Users can delete own dashboards"
  ON dashboards FOR DELETE
  USING (auth.uid() = user_id);
```

4. You should see "Success. No rows returned." -- that means everything was created

### Verify

5. Go to **Table Editor** (left sidebar) → you should see the `dashboards` table
6. Go to **Authentication** → **Policies** → you should see 5 policies on the `dashboards` table

---

## Step 3: Configure Authentication Providers

### Email/Password (enabled by default)

1. Go to **Authentication** → **Providers**
2. Confirm **Email** is enabled (it should be by default)
3. Optional: under Email settings, you can disable "Confirm email" for faster dev signup

### Microsoft OAuth (optional, for enterprise SSO)

This lets users sign in with their work Microsoft accounts. Skip this step if you only need email/password.

**In Azure Portal:**

4. Go to https://portal.azure.com → **Microsoft Entra ID** → **App registrations**
5. Click **New registration**
   - **Name**: `Phantom`
   - **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: Select "Web" and enter:
     ```
     https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
     ```
     (Replace `<your-supabase-project-ref>` with the subdomain from your Project URL)
6. Click **Register**
7. On the app overview page, copy the **Application (client) ID**
8. Go to **Certificates & secrets** → **New client secret**
   - Description: `Phantom Supabase`
   - Expiry: choose what fits your needs
   - Click **Add** and copy the **Value** immediately (it won't be shown again)

**In Supabase Dashboard:**

9. Go to **Authentication** → **Providers** → scroll to **Azure (Microsoft)**
10. Toggle it **ON**
11. Paste the **Client ID** and **Client Secret** from Azure
12. Click **Save**

### Set Redirect URLs

13. Go to **Authentication** → **URL Configuration**
14. Set **Site URL** to: `http://localhost:5173`
15. Under **Redirect URLs**, add:
    - `http://localhost:5173`
    - `http://localhost:5173/auth/callback`

    (You'll add your production URL here later in Step 6)

---

## Step 4: Connect the App to Supabase

1. In the project root, create a file called `.env.local`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-full-anon-key
```

Replace the values with the ones you copied in Step 1.

2. Install dependencies (if you haven't already):

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Test the setup

5. The app should load in **guest mode** (full editor, no saving)
6. Click **Sign In** in the top-right corner
7. Create an account with email/password (or use Microsoft if configured)
8. After signing in, you should be redirected to **My Dashboards** (empty)
9. Click **New Dashboard** → build something → click **Save** → give it a name
10. Go back to **My Dashboards** → your dashboard should appear
11. Open it, make a change, wait 6 seconds → refresh → the change should persist (auto-save)
12. Click **Share** → toggle public → copy the link → open in an incognito window → read-only view works

---

## Step 5: Deploy to Vercel

1. Push your code to a GitHub repository

2. Go to https://vercel.com and sign in with GitHub

3. Click **Add New...** → **Project** → import your Phantom repository

4. Vercel should auto-detect the Vite framework. Verify these settings:
   - **Framework Preset**: Vite
   - **Build Command**: `tsc && vite build`
   - **Output Directory**: `dist`

5. Expand **Environment Variables** and add:

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://your-project-ref.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...your-full-anon-key` |

6. Click **Deploy** and wait for the build to finish

7. Note your production URL (e.g., `https://phantom-abc123.vercel.app`)

---

## Step 6: Update Supabase for Production

After deploying, you need to tell Supabase about your production URL.

1. Go to your Supabase project → **Authentication** → **URL Configuration**

2. Change **Site URL** to your production URL:
   ```
   https://your-app.vercel.app
   ```

3. Under **Redirect URLs**, add:
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/auth/callback`

   Keep the localhost entries for local development.

4. If you configured Microsoft OAuth, also update the Azure App Registration:
   - Go to Azure Portal → your app registration → **Authentication**
   - Add a new redirect URI:
     ```
     https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
     ```
     (This should already be there from Step 3)

5. Redeploy or wait for Vercel to pick up the next push -- no code changes needed

---

## Step 7: Verify Everything Works

Run through this checklist on your production URL:

| # | Test | Expected |
|---|------|----------|
| 1 | Open the app | Loads in guest mode at `/editor` |
| 2 | Build a dashboard as guest | Full editor works (drag, resize, add visuals) |
| 3 | Click Save as guest | Button disabled, tooltip says "Sign in to save" |
| 4 | Click Sign In → create account | Auth form appears, signup works |
| 5 | After sign in | Redirected to `/dashboards` |
| 6 | Click New Dashboard → build → Save | Name dialog appears, saves, URL changes to `/editor/:id` |
| 7 | Go to My Dashboards | Card appears with name, scenario badge, timestamp |
| 8 | Open saved dashboard | Layout and visuals restored correctly |
| 9 | Make a change, wait 6s, refresh | Auto-save persisted the change |
| 10 | Click Share → toggle public → copy link | Share URL generated |
| 11 | Open share link in incognito | Read-only view, no editing controls |
| 12 | Sign in on incognito → click Clone | Dashboard cloned to your account |
| 13 | PBIP / JSON export | Still works as before |
| 14 | Sign out | Redirected to `/editor` in guest mode |

---

## Troubleshooting

### "Supabase is not configured" on login page
Your `.env.local` is missing or the values are wrong. Double-check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart the dev server after changing env vars.

### Sign-up works but sign-in returns an error
Check if email confirmation is required. Go to Supabase → **Authentication** → **Providers** → **Email** → toggle off "Confirm email" for development.

### Dashboard saves fail with "Not authenticated"
Your session may have expired. Sign out and sign back in. Check the browser console for more details.

### Microsoft OAuth redirects to a blank page
Make sure the redirect URI in Azure matches exactly: `https://<project-ref>.supabase.co/auth/v1/callback`. Also verify the Client ID and Secret are correct in Supabase.

### Production deploy returns 404 on page refresh
The `vercel.json` rewrite rule should handle this. Verify `vercel.json` exists in the repo root with:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### RLS blocks access / empty dashboard list
Make sure you ran all the SQL in Step 2 including the 5 `CREATE POLICY` statements. You can verify in Supabase → **Authentication** → **Policies**.

---

## Architecture Reference

```
Guest (no login)          Authenticated User
    |                          |
    v                          v
  /editor                   /dashboards ←→ Supabase DB
  (full editor,              (list saved)     (RLS enforced)
   no saving)                    |
    |                          v
    |                      /editor/:id
    |                      (load + auto-save)
    |                          |
    |                       Share toggle
    |                          |
    v                          v
              /share/:shareId
              (public read-only view)
```

- **No backend / API routes** -- Supabase JS client talks directly to the database
- **Row Level Security** ensures users can only access their own dashboards
- **Public dashboards** are accessible to anyone via share link (RLS allows SELECT where `is_public = true`)
- **Data generation stays client-side** -- only layout/config is stored in the database
