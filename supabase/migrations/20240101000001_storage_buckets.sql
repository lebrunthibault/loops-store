-- Create storage buckets
insert into storage.buckets (id, name, public)
values
  ('loops-full', 'loops-full', false),
  ('loops-preview', 'loops-preview', true);

-- Storage policies for loops-preview (public read)
create policy "Preview files are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'loops-preview');

create policy "Preview files are uploadable by admins"
  on storage.objects for insert
  with check (
    bucket_id = 'loops-preview' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Preview files are deletable by admins"
  on storage.objects for delete
  using (
    bucket_id = 'loops-preview' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Storage policies for loops-full (private, download only if purchased)
create policy "Full files are downloadable by purchasers"
  on storage.objects for select
  using (
    bucket_id = 'loops-full' and
    exists (
      select 1 from public.purchases p
      join public.loops l on l.id = p.loop_id
      where p.user_id = auth.uid()
      and l.audio_url like '%' || storage.objects.name
    )
  );

create policy "Full files are uploadable by admins"
  on storage.objects for insert
  with check (
    bucket_id = 'loops-full' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Full files are deletable by admins"
  on storage.objects for delete
  using (
    bucket_id = 'loops-full' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
