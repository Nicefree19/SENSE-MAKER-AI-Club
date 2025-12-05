-- ============================================
-- Fix: Add missing columns to 'projects' table
-- Run this in Supabase SQL Editor to fix "Could not find the 'updated_at' column" error
-- ============================================

-- 1. Add 'updated_at' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE public.projects ADD COLUMN updated_at timestamp with time zone;
    END IF;
END $$;

-- 2. Add 'embed_url' column if it doesn't exist (just in case it was missed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'embed_url') THEN
        ALTER TABLE public.projects ADD COLUMN embed_url text;
    END IF;
END $$;

-- 3. Ensure 'project_members' table exists (to fix "Failed to load members" error)
create table if not exists public.project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- 4. Enable RLS for project_members if not already enabled
alter table public.project_members enable row level security;

-- 5. Re-apply RLS policies for project_members to ensure they exist
drop policy if exists "Project members are viewable by everyone." on public.project_members;
create policy "Project members are viewable by everyone." on public.project_members for select using (true);

drop policy if exists "Project owners can manage members." on public.project_members;
create policy "Project owners can manage members." on public.project_members for all using (
  exists (
    select 1 from public.projects
    where id = public.project_members.project_id
    and author_id = auth.uid()
  )
);
