-- Create avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own avatar
create policy "avatar_upload" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid() is not null
  );

-- Allow public read of avatars
create policy "avatar_read" on storage.objects
  for select using (bucket_id = 'avatars');

-- Allow users to update their own avatar
create policy "avatar_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid() is not null
  );

-- Allow users to delete their own avatar
create policy "avatar_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid() is not null
  );
