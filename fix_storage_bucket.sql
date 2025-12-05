-- ============================================
-- Fix: Create 'images' Storage Bucket
-- Run this in Supabase SQL Editor to fix "Bucket not found" error
-- ============================================

-- 1. Create the 'images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- 2. Enable RLS on storage.objects (usually enabled by default, but good to ensure)
alter table storage.objects enable row level security;

-- 3. Create Policy: Allow Public Read Access
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using (bucket_id = 'images');

-- 4. Create Policy: Allow Authenticated Users to Upload
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload" on storage.objects for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');

-- 5. Create Policy: Allow Users to Update/Delete their own files (Optional but recommended)
drop policy if exists "Users can update own files" on storage.objects;
create policy "Users can update own files" on storage.objects for update using (bucket_id = 'images' and auth.uid() = owner);

drop policy if exists "Users can delete own files" on storage.objects;
create policy "Users can delete own files" on storage.objects for delete using (bucket_id = 'images' and auth.uid() = owner);
