-- Girlie Project — private Friendship Archive P0
-- Run this after supabase-setup.sql in Supabase SQL Editor, or via `supabase db push`.
-- Every table below is private by default: only the authenticated owner can read it.

create extension if not exists pgcrypto;

create table if not exists friendship_archives (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled friendship',
  friend_name text,
  archive jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists friendship_archives_owner_updated on friendship_archives(owner_id, updated_at desc);

-- Individual later additions are preserved independently so a future story
-- rewrite never deletes an original memory.
create table if not exists friendship_memories (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references friendship_archives(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('timeline', 'place', 'object', 'photo', 'letter', 'voice', 'note')),
  memory jsonb not null default '{}'::jsonb,
  occurred_on date,
  created_at timestamptz not null default now()
);
create index if not exists friendship_memories_archive_created on friendship_memories(archive_id, created_at);

create table if not exists friendship_story_versions (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references friendship_archives(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  version integer not null,
  content text not null,
  source text not null default 'user-confirmed',
  created_at timestamptz not null default now(),
  unique(archive_id, version)
);

create table if not exists friendship_time_capsules (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references friendship_archives(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  opens_at timestamptz not null,
  contents jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table friendship_archives enable row level security;
alter table friendship_memories enable row level security;
alter table friendship_story_versions enable row level security;
alter table friendship_time_capsules enable row level security;

drop policy if exists "archive owner only" on friendship_archives;
create policy "archive owner only" on friendship_archives for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "memory owner only" on friendship_memories;
create policy "memory owner only" on friendship_memories for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "story version owner only" on friendship_story_versions;
create policy "story version owner only" on friendship_story_versions for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "capsule owner only" on friendship_time_capsules;
create policy "capsule owner only" on friendship_time_capsules for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Keep update timestamps reliable without trusting the browser.
create or replace function touch_friendship_archive()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;
drop trigger if exists friendship_archives_touch on friendship_archives;
create trigger friendship_archives_touch before update on friendship_archives
  for each row execute function touch_friendship_archive();
