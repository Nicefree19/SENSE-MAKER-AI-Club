-- ============================================
-- SENSE MAKER AI Club Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. Profiles Table (Extends Supabase Auth)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  role text default 'member' check (role in ('admin', 'member')),
  bio text,
  website text,
  github text,
  linkedin text,
  updated_at timestamp with time zone
);

-- ============================================
-- 2. Projects Table
-- ============================================
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text check (status in ('Planning', 'In Progress', 'Completed')) default 'Planning',
  tech_stack text[],
  image_url text,
  github_url text,
  demo_url text,
  model_url text,
  layout_config jsonb default '{}'::jsonb,
  published boolean default false,
  view_count integer default 0,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- ============================================
-- 3. Posts Table (Blog)
-- ============================================
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subtitle text,
  content text,
  image_url text,
  tags text[],
  published boolean default false,
  view_count integer default 0,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- ============================================
-- 4. Comments Table
-- ============================================
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  post_id uuid references public.posts(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- ============================================
-- 5. Likes Table
-- ============================================
create table if not exists public.likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id),
  unique(project_id, user_id)
);

-- ============================================
-- 6. Bookmarks Table
-- ============================================
create table if not exists public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id),
  unique(project_id, user_id)
);

-- ============================================
-- 7. Notifications Table
-- ============================================
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 8. Project Members Table
-- ============================================
create table if not exists public.project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- ============================================
-- 9. Contact Messages Table
-- ============================================
create table if not exists public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Projects
alter table public.projects enable row level security;
create policy "Projects are viewable by everyone." on public.projects for select using (true);
create policy "Members can create projects." on public.projects for insert with check (auth.uid() = author_id);
create policy "Members can update own projects." on public.projects for update using (auth.uid() = author_id);
create policy "Members can delete own projects." on public.projects for delete using (auth.uid() = author_id);

-- Posts
alter table public.posts enable row level security;
create policy "Published posts are viewable by everyone." on public.posts for select using (published = true);
create policy "Members can view own unpublished posts." on public.posts for select using (auth.uid() = author_id);
create policy "Members can create posts." on public.posts for insert with check (auth.uid() = author_id);
create policy "Members can update own posts." on public.posts for update using (auth.uid() = author_id);
create policy "Members can delete own posts." on public.posts for delete using (auth.uid() = author_id);

-- Comments
alter table public.comments enable row level security;
create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Authenticated users can create comments." on public.comments for insert with check (auth.role() = 'authenticated');
create policy "Users can update own comments." on public.comments for update using (auth.uid() = author_id);
create policy "Users can delete own comments." on public.comments for delete using (auth.uid() = author_id);

-- Likes
alter table public.likes enable row level security;
create policy "Likes are viewable by everyone." on public.likes for select using (true);
create policy "Authenticated users can toggle likes." on public.likes for insert with check (auth.role() = 'authenticated');
create policy "Users can remove own likes." on public.likes for delete using (auth.uid() = user_id);

-- Bookmarks
alter table public.bookmarks enable row level security;
create policy "Users can view own bookmarks." on public.bookmarks for select using (auth.uid() = user_id);
create policy "Users can create bookmarks." on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks." on public.bookmarks for delete using (auth.uid() = user_id);

-- Notifications
alter table public.notifications enable row level security;
create policy "Users can view own notifications." on public.notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications." on public.notifications for insert with check (true);
create policy "Users can update own notifications." on public.notifications for update using (auth.uid() = user_id);

-- Project Members
alter table public.project_members enable row level security;
create policy "Project members are viewable by everyone." on public.project_members for select using (true);
create policy "Project owners can manage members." on public.project_members for all using (
  exists (
    select 1 from public.projects
    where id = public.project_members.project_id
    and author_id = auth.uid()
  )
);

-- Contact Messages
alter table public.contact_messages enable row level security;
create policy "Anyone can insert contact messages." on public.contact_messages for insert with check (true);
create policy "Only admins can view contact messages." on public.contact_messages for select using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  )
);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Handle New User
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Increment View Count
create or replace function increment_view_count(table_name text, row_id uuid)
returns void as $$
begin
  execute format('update public.%I set view_count = view_count + 1 where id = $1', table_name) using row_id;
end;
$$ language plpgsql security definer;

-- Storage Policies (Images)
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using (bucket_id = 'images');
create policy "Authenticated Upload" on storage.objects for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');
