-- Storage buckets + policies for bandit images / stickers.
-- Run after 0001_init.sql. Buckets are private; public reads go through
-- signed URLs or the published-cover metadata policy + Next Image optimization.

insert into storage.buckets (id, name, public)
values ('bandit-images','bandit-images', false),
       ('bandit-stickers','bandit-stickers', false)
on conflict (id) do nothing;

-- Authors can upload to their own folder: <member-uuid>/...
create policy "images owner insert" on storage.objects for insert to authenticated
with check (
  bucket_id = 'bandit-images'
  and (storage.foldername(name))[1] = (select id::text from public.members where auth_id = auth.uid())
  or public.is_admin()
);

create policy "images owner read" on storage.objects for select to authenticated
using (
  bucket_id = 'bandit-images'
  and (
    (storage.foldername(name))[1] = (select id::text from public.members where auth_id = auth.uid())
    or public.is_admin()
  )
);

create policy "images owner delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'bandit-images'
  and (
    (storage.foldername(name))[1] = (select id::text from public.members where auth_id = auth.uid())
    or public.is_admin()
  )
);

-- Stickers: any signed-in writer can read starter pack; admin writes packs.
create policy "stickers auth read" on storage.objects for select to authenticated
using (bucket_id = 'bandit-stickers');

create policy "stickers admin write" on storage.objects for all to authenticated
using (bucket_id = 'bandit-stickers' and public.is_admin())
with check (bucket_id = 'bandit-stickers' and public.is_admin());
