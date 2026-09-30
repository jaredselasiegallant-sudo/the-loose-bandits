-- The Loose Bandits — initial schema + RLS
-- Members (4 writers), posts, tags, assets, stickers, placements.
-- Public can read published only. Authors CRUD own. Admin (founder) manages all.

-- ---------- extensions ----------
create extension if not exists "pgcrypto";

-- ---------- members ----------
create table public.members (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete set null,
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  display_name text not null default 'TODO name',
  bio text not null default 'TODO bio',
  avatar_url text,
  primary_color text not null default '#0F766E',
  soft_color text not null default '#CCFBF1',
  ink_color text not null default '#134E4A',
  on_primary_color text not null default '#FFFFFF',
  mark text not null default '★',
  role text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz not null default now()
);

-- ---------- posts ----------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_member_id uuid not null references public.members(id) on delete cascade,
  slug text not null,
  title text not null default 'TODO title',
  deck text not null default 'TODO deck',
  content_json jsonb not null default '{}'::jsonb,
  content_html text not null default '',
  excerpt text not null default 'TODO excerpt',
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  published_at timestamptz,
  scheduled_for timestamptz,
  format text not null default 'essay' check (format in ('essay','field-note','family-lore','four-takes','photo-evidence')),
  cover_asset_id uuid,
  reading_minutes int not null default 5 check (reading_minutes between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (author_member_id, slug)
);

-- ---------- tags ----------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  created_at timestamptz not null default now()
);

create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ---------- assets (image metadata; bytes live in Storage) ----------
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  owner_member_id uuid not null references public.members(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  caption text not null default '',
  width int,
  height int,
  mime text,
  bytes int,
  created_at timestamptz not null default now()
);

alter table public.posts
  add constraint posts_cover_fk foreign key (cover_asset_id)
  references public.assets(id) on delete set null;

-- ---------- stickers ----------
create table public.sticker_packs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  created_by uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.stickers (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid references public.sticker_packs(id) on delete set null,
  storage_path text,
  kind text not null default 'stamp',
  label text not null default 'TODO sticker',
  created_at timestamptz not null default now()
);

-- Normalized 0..1 placement so published views render consistently.
create table public.sticker_placements (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  sticker_id uuid references public.stickers(id) on delete set null,
  x_norm double precision not null default 0.5 check (x_norm between 0 and 1),
  y_norm double precision not null default 0.1 check (y_norm between 0 and 1),
  w_norm double precision not null default 0.2 check (w_norm between 0.05 and 1),
  rotation int not null default -4,
  anchor text not null default 'margin' check (anchor in ('inline','margin','photo')),
  alt_text text not null default '',
  decorative boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- helpers ----------
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.members m
    where m.auth_id = auth.uid() and m.role = 'admin'
  );
$$;

create or replace function public.own_member_id() returns uuid
language sql stable as $$
  select m.id from public.members m where m.auth_id = auth.uid() limit 1;
$$;

create or replace function public.handle_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts
for each row execute function public.handle_updated_at();

-- ---------- RLS ----------
alter table public.members enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.assets enable row level security;
alter table public.sticker_packs enable row level security;
alter table public.stickers enable row level security;
alter table public.sticker_placements enable row level security;

-- members: public read (bios are public); write own row or admin
create policy "members public read" on public.members for select using (true);
create policy "members update own or admin" on public.members for update
  using (auth_id = auth.uid() or public.is_admin())
  with check (auth_id = auth.uid() or public.is_admin());
create policy "members admin insert" on public.members for insert
  with check (public.is_admin());

-- posts: public reads published only; authors manage own; admin all
create policy "posts public read published" on public.posts for select
  using (status = 'published' and (published_at is null or published_at <= now()));
create policy "posts author read own" on public.posts for select
  using (author_member_id = public.own_member_id() or public.is_admin());
create policy "posts author insert own" on public.posts for insert
  with check (author_member_id = public.own_member_id() or public.is_admin());
create policy "posts author update own" on public.posts for update
  using (author_member_id = public.own_member_id() or public.is_admin())
  with check (author_member_id = public.own_member_id() or public.is_admin());
create policy "posts author delete own" on public.posts for delete
  using (author_member_id = public.own_member_id() or public.is_admin());

-- tags: public read; admin writes (authors may request via admin UI later)
create policy "tags public read" on public.tags for select using (true);
create policy "tags admin write" on public.tags for all
  using (public.is_admin()) with check (public.is_admin());

-- post_tags: public read for published posts; author manages own post links
create policy "post_tags public read" on public.post_tags for select using (true);
create policy "post_tags author write" on public.post_tags for all
  using (
    public.is_admin() or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_member_id = public.own_member_id()
    )
  ) with check (
    public.is_admin() or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_member_id = public.own_member_id()
    )
  );

-- assets: public read metadata for published-post covers; owners manage own
create policy "assets owner read" on public.assets for select
  using (owner_member_id = public.own_member_id() or public.is_admin());
create policy "assets public read covers" on public.assets for select
  using (exists (
    select 1 from public.posts p
    where p.cover_asset_id = assets.id and p.status = 'published'
  ));
create policy "assets owner write" on public.assets for all
  using (owner_member_id = public.own_member_id() or public.is_admin())
  with check (owner_member_id = public.own_member_id() or public.is_admin());

-- sticker packs/stickers: public read; admin creates packs, authors upload own stickers
create policy "packs public read" on public.sticker_packs for select using (true);
create policy "packs admin write" on public.sticker_packs for all
  using (public.is_admin()) with check (public.is_admin());
create policy "stickers public read" on public.stickers for select using (true);
create policy "stickers admin write" on public.stickers for all
  using (public.is_admin()) with check (public.is_admin());

-- placements: public read for published posts; authors manage own post placements
create policy "placements public read published" on public.sticker_placements for select
  using (exists (
    select 1 from public.posts p
    where p.id = post_id and p.status = 'published'
  ));
create policy "placements author read own" on public.sticker_placements for select
  using (
    public.is_admin() or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_member_id = public.own_member_id()
    )
  );
create policy "placements author write own" on public.sticker_placements for all
  using (
    public.is_admin() or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_member_id = public.own_member_id()
    )
  ) with check (
    public.is_admin() or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_member_id = public.own_member_id()
    )
  );

-- ---------- seed placeholders (no real identities) ----------
insert into public.members (slug, display_name, bio, primary_color, soft_color, ink_color, on_primary_color, mark, role)
values
  ('member-1','TODO name 1','TODO bio — founder to supply.','#0F766E','#CCFBF1','#134E4A','#FFFFFF','★','admin'),
  ('member-2','TODO name 2','TODO bio — founder to supply.','#9A3412','#FFEDD5','#7C2D12','#FFFFFF','▲','member'),
  ('member-3','TODO name 3','TODO bio — founder to supply.','#6B21A8','#F3E8FF','#581C87','#FFFFFF','●','member'),
  ('member-4','TODO name 4','TODO bio — founder to supply.','#3F6212','#ECFCCB','#365314','#FFFFFF','◆','member')
on conflict (slug) do nothing;

insert into public.sticker_packs (slug, label) values ('starter-neutral','Starter neutral placeholders')
on conflict (slug) do nothing;
