# Writers' Room

A gamified screenwriting app for film and TV. It helps you come up with ideas, outline them, and write screenplays, using **Dan Harmon's Story Circle**, **Campbell's Hero's Journey** and **Dov Simens' rules**.

**House rule: the app never writes anything for you.** Every word of your story comes from you. The app only organizes your writing, asks pre-written craft questions, counts, and keeps score.
The one place Claude appears is **Remix**. There it fills in only the *left* column with facts about an existing movie or show, and it never suggests anything for your version.

## What's inside

| Game | What you do | What counts |
|---|---|---|
| **1 · Logline** | Genre → hero → want → obstacle → your one-sentence logline (+ theme question) | **Daily idea**: one finished logline |
| **2 · Outline** | Fill the 9-step Story Circle (a game board that lights up), then add scenes to each of the 3 acts | **Weekly outline**: 9 beats + ≥1 scene in every act (+ series engine for TV) |
| **3 · Screenplay** | Write in the built-in screenplay editor, or log pages you wrote in Final Draft etc. | **Monthly script**: hit Simens' page minimum, then press FADE OUT |

- **Remix (the genre turn)**: type in a movie or show you know.
  - Claude breaks it down into the left column: core pitch, characters, the 9 beats, set pieces, places, objects, and other notable elements. You can correct anything on the left.
  - Pick your genre (50+ options) and a format (film, half-hour or hour), then fill in the right column row by row in your own words.
  - Rows don't have to match one for one. You can mark any row *Not in my version*, or add new characters, places and so on.
  - The hero, want, obstacle, logline, theme, engine and beats you write go straight into the idea's Logline and Outline tabs, so a remix counts toward your quotas like any other idea.
  - Prefer no AI? Choose *Fill in both columns yourself*.
- **Film or TV**: a TV project adds a **Series** tab with the engine, main cast, the **season circle**, and a small circle for each episode. Choose half-hour (~30 pp) or hour-long (55–60 pp).
- **Running list of every idea**: each idea shows which essential pieces it has (Logline, Theme, Engine, Beats x/9, Acts x/3, pages). The **Next →** button takes you straight to the next missing piece.
- **Budget meter (Simens)**: counts locations, speaking roles, night scenes, and stunts/crowds/VFX from what you wrote. It reports only and never suggests anything.
- **Gamification**: XP, levels (Production Assistant → Showrunner → Auteur), idea and writing streaks, quota rings, a 16-week consistency heatmap, and badges.
  XP comes from new words, steps completed, and script pages. Deleting and retyping text doesn't earn XP twice.
- **Edit anything, anytime.** Ideas you delete go to Trash and can be restored. Use **Backup** to download everything as JSON.
- **Screenplay editor**: Enter picks the next element automatically and Tab cycles element types (Final Draft style). Typing `INT.` or `EXT.` starts a scene heading.
  You can import and export `.fountain` files (Final Draft, Highland and WriterDuet open them), print to PDF in standard format, and pull scene headings in from your outline.
- **Works on phone, iPad, laptop and desktop.** It's a web app you can add to your home screen. It saves on the device first and works offline.

## Run it locally

```bash
npm install
npm run dev
```

Without sync keys the app runs in **device-only** mode and everything is saved in that browser.
To try Remix locally, put `ANTHROPIC_API_KEY` in `.env.local`. `npm run dev` serves `/api/breakdown` for you.

## Turn on sync (phone ⇄ iPad ⇄ laptop)

One-time setup, about 10 minutes, free tier.

1. **Supabase**: create a free project at <https://supabase.com>.
   - **SQL Editor → New query**: paste [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   - **Authentication → URL Configuration**: set *Site URL* to your Vercel URL (for example `https://writers-room.vercel.app`) and add it under *Redirect URLs*.
     Add `http://localhost:5173` as well if you develop locally.
   - **Project Settings → API**: copy the **Project URL** and the **anon public** key.
2. **Vercel**: import this GitHub repo at <https://vercel.com/new>. It detects Vite automatically.
   - Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the two values from step 1.
   - For **Remix**, also add `ANTHROPIC_API_KEY`. Create one at <https://platform.claude.com> under API keys.
     It stays on the server and is never sent to the browser. Each breakdown costs a few cents.
     When sync is on, only signed-in users can run breakdowns, so strangers can't spend your credits.
   - Deploy.
3. On each device, open the site, go to **Account**, and enter your email. Tap the magic link **on that device**. Anything you wrote before signing in uploads automatically.
4. Add it to your home screen:
   - **iPhone/iPad**: Safari → Share → *Add to Home Screen*.
   - **Android**: Chrome → ⋮ → *Install app*.

How sync works:

- Every change is saved locally first and then synced within a couple of seconds.
- When the same item was edited on two devices, the newest edit wins.
- Row-level security means only you can read your data.

## Project layout

```
src/lib/framework.ts   the 9 beats, question bank, Simens rules (questions only — no story content)
src/lib/project.ts     completion rules for logline / outline / script, next-step logic
src/lib/stats.ts       XP, levels, streaks, quotas, badges
src/lib/budget.ts      budget meter
src/lib/screenplay.ts  page estimate, Fountain import/export
src/lib/store.ts       local-first storage (IndexedDB) + Supabase sync
src/lib/remix.ts       remix rows: left (source facts) ↔ right (your version)
server/breakdown.ts    Claude API call (server-only) — factual breakdown of an existing work
api/breakdown.ts       Vercel function wrapper
src/components/        screens
supabase/schema.sql    database table, security policy, and sync function
```
