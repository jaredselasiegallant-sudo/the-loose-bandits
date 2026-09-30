# Deploy — The Loose Bandits (Vercel + Supabase)

## 0. What the founder must supply
- [ ] Confirm “Vessel” = Vercel (assumed yes)
- [ ] 4 member names, short bios, avatar approach, signature colors (placeholders live in `lib/members.ts` + Supabase `members`)
- [ ] Logo/wordmark decision (typographic placeholder now)
- [ ] First real essays/photos + photo-consent rules (especially children)
- [ ] Sticker art or permission to create original SVGs
- [ ] Domain, Vercel project, Supabase project, auth choice (magic-link default)

## 1. Supabase setup
1. Create project at supabase.com → copy URL + anon key + service key.
2. SQL Editor → run in order:
   - `supabase/migrations/0001_init.sql` (tables, RLS, seed placeholders)
   - `supabase/migrations/0002_storage.sql` (private buckets + policies)
   - `supabase/migrations/0003_content.sql` (site_settings, revisions, archiving)
3. Auth → URL Configuration:
   - Site URL: `https://YOUR-DOMAIN`
   - Redirects: `https://YOUR-DOMAIN/dashboard`, `http://localhost:3000/dashboard`
   - Enable Email magic links (recommended). To use passwords instead/additionally:
     Supabase → Auth → Providers → Email → enable “Email + password”, then members
     sign in via the Password tab; “Forgot password” sends a reset email.
   - Confirm OTP expiry (default 1h) and rate limits meet a 4-person family.
   - NEVER enable public self-registration as a sign-up page: there is no sign-up UI;
     accounts enter only via admin invite (below) or Supabase → Auth → Users → Invite.
4. Storage: confirm `bandit-images` + `bandit-stickers` exist, private.
5. Table Editor → `members`: set real names/bios/colors; set founder row `role='admin'`; set each writer’s `auth_id` after first sign-in.
6. RLS test cases (run as anon vs writer vs admin):
   - anon `SELECT posts` returns only `status='published'` AND `archived_at IS NULL` rows
   - anon cannot `SELECT` drafts; writer can `SELECT` own drafts, cannot read others’ drafts
   - writer `INSERT/UPDATE/DELETE posts` only where `author_member_id = own_member_id()`
   - writer upload to `bandit-images/<own-member-uuid>/…` succeeds; other folders fail
   - admin bypasses all via `is_admin()`
   - anon `SELECT site_settings` succeeds; anon `UPDATE site_settings` fails; member `UPDATE` fails; admin `UPDATE` succeeds
   - anon `SELECT post_revisions` returns 0 rows for drafts; author reads own history; admin reads all
7. First admin + invites (controlled setup, no public signup):
   - Option A (recommended): Supabase → Auth → Users → Invite user (founder email) →
     founder signs in → SQL: `update members set auth_id='<founder-uuid>', role='admin' where slug='member-1'`.
   - Option B (in-app): as admin, open `/admin/invites` → pick slot + email → Send invite.
     Requires `SUPABASE_SERVICE_ROLE_KEY` on the server only. The invite email links to `/dashboard`.
   - Recover admin access: Supabase → Auth → Users → send new invite/reset, then re-run the `update members` SQL above.
   - `npm test` covers signed-out/member/admin/public expectations at the code level.

## 2. Vercel setup
1. Import repo/folder → framework Next.js, root = folder containing `package.json`.
2. Env vars (all from `.env.example`, no secrets in git):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only), `NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN`
3. Deploy → smoke test: `/`, `/member-1`, `/member-1/placeholder-featured-essay`, `/about`, `/rss`, `/sitemap.xml`, `/login`, `/dashboard` (shows setup notice until env set, then real auth).
4. Custom domain: Vercel → Domains → add → update DNS.

## 3. Local dev
```bash
npm install
cp .env.example .env.local  # fill real keys
npm run dev   # http://localhost:3000
npm run lint && npm run build && npm test
```

## 4. Notes
- Public reads are server-rendered; editor/sticker JS loads only on `/write`.
- Images: validate 8MB/type client + server, lazy-load, responsive; originals private, optimized via Next Image.
- Stickers: normalized 0..1 placements, max 8/post, decorative flagged, keyboard controls + undo.
- Placeholders are deliberate (`TODO`) — replace, don’t ship.

## 5. Family editing guide (no code, no redeploy)
- Sign in at `/login` (magic link or password). Header shows name + role; Sign out ends the session.
  Signed-out visitors hitting `/dashboard`, `/write`, `/media`, `/preview/*`, or `/admin/*`
  are sent to `/login`. No draft controls ever render for public readers.
- Dashboard sections:
  - **Posts** — pick a post, edit title/deck/excerpt/slug/format/SEO/schedule. Buttons:
    Save draft (private) → Preview (private, member-theme, `noindex`, never in sitemap/RSS) →
    Publish / Schedule → Unpublish (leaves feeds/sitemap/RSS immediately) → Archive… (asks first,
    stays recoverable). Member sees/edits own posts only; admin sees all.
  - **Pages & site text** (admin) — hero headline/deck, intro, CTAs, About, footer, empty states.
    “Placeholder” badges mark seeded TODO copy in the editor only; saving updates the public
    pages from the database on next load. Prior versions are kept in `settings_revisions`.
  - **Members** (admin) — names/bios/avatars/colors/marks. Members edit own name/bio/avatar;
    colors/roles are admin-only and rejected server-side for anyone else.
  - **Media** — upload (progress, formats, 8MB limit, errors), edit display name/caption/alt/tags,
    reuse one file across posts via tags, see “Used by” before archiving. Archiving an in-use asset
    warns first and keeps pages rendering a placeholder frame — nothing silently breaks.
  - **Settings** (admin) — upload limits, public-vs-private rules, invite entry point.
- Unsaved-changes warnings appear if you navigate away mid-edit. Every save shows
  Saved / Saving / Unsaved changes / Error.
- Upload visibility: drafts + admin materials stay private (authenticated storage policies);
  only published posts’ media is public, served in right-sized optimized derivatives.
- Never put real credentials in seed data, the client bundle, or git. Service key lives only
  in Vercel env + server routes.
