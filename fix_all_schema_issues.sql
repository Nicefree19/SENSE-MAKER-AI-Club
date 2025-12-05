-- ============================================
-- COMPREHENSIVE SCHEMA FIX SCRIPT
-- Run this in Supabase SQL Editor to fix all missing tables and columns
-- ============================================

-- 1. MISSING TABLES
-- ============================================

-- 1.1 Activity Logs
create table if not exists public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Activity Logs
alter table public.activity_logs enable row level security;
drop policy if exists "Activity logs are viewable by everyone." on public.activity_logs;
create policy "Activity logs are viewable by everyone." on public.activity_logs for select using (true);

drop policy if exists "Users can insert activity logs." on public.activity_logs;
create policy "Users can insert activity logs." on public.activity_logs for insert with check (auth.uid() = user_id);

-- 1.2 User Settings
create table if not exists public.user_settings (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  theme text default 'dark',
  email_notifications boolean default true,
  updated_at timestamp with time zone
);

-- RLS for User Settings
alter table public.user_settings enable row level security;
drop policy if exists "Users can view own settings." on public.user_settings;
create policy "Users can view own settings." on public.user_settings for select using (auth.uid() = user_id);

drop policy if exists "Users can update own settings." on public.user_settings;
create policy "Users can update own settings." on public.user_settings for all using (auth.uid() = user_id);


-- 2. MISSING COLUMNS (Idempotent checks)
-- ============================================

DO $$
BEGIN
    -- Projects: updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE public.projects ADD COLUMN updated_at timestamp with time zone;
    END IF;

    -- Projects: embed_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'embed_url') THEN
        ALTER TABLE public.projects ADD COLUMN embed_url text;
    END IF;

    -- Posts: updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'updated_at') THEN
        ALTER TABLE public.posts ADD COLUMN updated_at timestamp with time zone;
    END IF;

    -- Comments: updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'updated_at') THEN
        ALTER TABLE public.comments ADD COLUMN updated_at timestamp with time zone;
    END IF;

    -- Profiles: updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamp with time zone;
    END IF;
    
    -- Events: updated_at (Good practice)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'updated_at') THEN
        ALTER TABLE public.events ADD COLUMN updated_at timestamp with time zone;
    END IF;
END $$;


-- 3. STORAGE BUCKET (Safety check)
-- ============================================
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Ensure policies exist
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using (bucket_id = 'images');

drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload" on storage.objects for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');

drop policy if exists "Users can update own files" on storage.objects;
create policy "Users can update own files" on storage.objects for update using (bucket_id = 'images' and auth.uid() = owner);

drop policy if exists "Users can delete own files" on storage.objects;
create policy "Users can delete own files" on storage.objects for delete using (bucket_id = 'images' and auth.uid() = owner);
