-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  role text default 'member' check (role in ('admin', 'member')),
  updated_at timestamp with time zone
);

-- 2. Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text check (status in ('Planning', 'In Progress', 'Completed')) default 'Planning',
  tech_stack text[],
  image_url text,
  author_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Posts Table (Blog)
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text, -- Markdown content
  tags text[],
  author_id uuid references public.profiles(id) not null,
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

-- Profiles: Everyone can view, User can update own
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Projects: Everyone can view, Members can create/update own
alter table public.projects enable row level security;
create policy "Projects are viewable by everyone." on public.projects for select using (true);
create policy "Members can create projects." on public.projects for insert with check (auth.uid() = author_id);
create policy "Members can update own projects." on public.projects for update using (auth.uid() = author_id);

-- Posts: Published posts viewable by everyone, Members can CRUD own
alter table public.posts enable row level security;
create policy "Published posts are viewable by everyone." on public.posts for select using (published = true);
create policy "Members can view own unpublished posts." on public.posts for select using (auth.uid() = author_id);
create policy "Members can create posts." on public.posts for insert with check (auth.uid() = author_id);
create policy "Members can update own posts." on public.posts for update using (auth.uid() = author_id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
