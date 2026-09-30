-- Addendum: editable site copy, revisions, archiving.
-- Run after 0001_init.sql + 0002_storage.sql.

-- ---------- site-wide editable copy (single row, id=1) ----------
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  site_title text not null default 'The Loose Bandits',
  wordmark_text text not null default 'The Loose Bandits',
  home_intro text not null default 'TODO home introduction — founder to supply.',
  hero_headline text not null default 'TODO: hero headline — founder to supply',
  hero_deck text not null default 'TODO hero deck — one-sentence summary placeholder.',
  cta_primary text not null default 'Read featured essay',
  cta_secondary text not null default 'More from the writers',
  about_copy text not null default 'TODO about copy — founder to supply in one or two sentences.',
  footer_text text not null default 'TODO footer text.',
  empty_posts_message text not null default 'TODO: no published posts yet.',
  updated_by uuid references public.members(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ---------- posts: seo + archiving (soft-delete) ----------
alter table public.posts
  add column if not exists seo_title text not null default '',
  add column if not exists seo_description text not null default '',
  add column if not exists og_image_asset_id uuid references public.assets(id) on delete set null,
  add column if not exists archived_at timestamptz,
  add column if not exists updated_by uuid references public.members(id) on delete set null;

-- ---------- assets: display metadata + archiving ----------
alter table public.assets
  add column if not exists display_name text not null default 'TODO asset name',
  add column if not exists tags text[] not null default '{}',
  add column if not exists archived_at timestamptz,
  add column if not exists updated_by uuid references public.members(id) on delete set null;

-- ---------- revision history (recoverable prior versions) ----------
create table if not exists public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  editor_member_id uuid references public.members(id) on delete set null,
  title text not null,
  deck text not null default '',
  content_json jsonb not null default '{}'::jsonb,
  content_html text not null default '',
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.settings_revisions (
  id uuid primary key default gen_random_uuid(),
  editor_member_id uuid references public.members(id) on delete set null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

-- Snapshot prior post version on every update (recoverable history).
create or replace function public.snapshot_post_revision() returns trigger
language plpgsql security definer as $$
declare editor uuid;
begin
  select m.id into editor from public.members m where m.auth_id = auth.uid() limit 1;
  insert into public.post_revisions (post_id, editor_member_id, title, deck, content_json, content_html, status)
  values (old.id, editor, old.title, old.deck, old.content_json, old.content_html, old.status);
  return new;
end $$;

drop trigger if exists posts_snapshot_revision on public.posts;
create trigger posts_snapshot_revision before update on public.posts
for each row execute function public.snapshot_post_revision();

-- Keep updated_at fresh on new tables.
drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings
for each row execute function public.handle_updated_at();

-- ---------- RLS ----------
alter table public.site_settings enable row level security;
alter table public.post_revisions enable row level security;
alter table public.settings_revisions enable row level security;

-- Everyone reads site copy; only admin writes. Role comes from DB, never the browser.
create policy "settings public read" on public.site_settings for select using (true);
create policy "settings admin write" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- Revisions: authors read own posts' history, admin reads all; inserts happen via trigger.
create policy "revisions author read" on public.post_revisions for select
  using (
    public.is_admin() or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_member_id = public.own_member_id()
    )
  );
create policy "revisions system insert" on public.post_revisions for insert with check (true);

create policy "settings revisions admin" on public.settings_revisions for all
  using (public.is_admin()) with check (public.is_admin());

-- Archived posts stay out of every public read: tighten published policy.
drop policy if exists "posts public read published" on public.posts;
create policy "posts public read published" on public.posts for select
  using (
    status = 'published'
    and archived_at is null
    and (published_at is null or published_at <= now())
  );
