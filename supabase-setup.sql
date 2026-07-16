-- ═══════════════════════════════════════════════════════════════
-- Girlie Room — accounts + shared private rooms (email sign-in)
-- Run this whole file once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run. If you see ANY red error, copy it to me.
--
-- Two dashboard toggles are NOT in this file (do them by hand):
--   A. Authentication → Sign In / Providers → Email → turn OFF
--      "Confirm email" → Save.   (so sign-up works instantly)
--   B. Storage → create a bucket + 2 policies — see instructions I gave
--      you in chat (the storage part is easier through the UI).
-- ═══════════════════════════════════════════════════════════════
create extension if not exists pgcrypto;

-- ── rooms + who belongs to them + their content ────────────────
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text,
  meet_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
create table if not exists room_members (
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  display_name text,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);
create table if not exists room_entries (
  id bigint generated always as identity primary key,
  room_id uuid references rooms(id) on delete cascade,
  kind text not null check (kind in ('timeline','album','check')),
  payload jsonb not null,
  author uuid references auth.users(id),
  created_at timestamptz default now()
);
create index if not exists room_entries_lookup on room_entries(room_id, kind, id);

-- membership check (security definer → bypasses RLS, no recursion)
create or replace function is_member(rid uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from room_members m where m.room_id = rid and m.user_id = auth.uid());
$$;

alter table rooms         enable row level security;
alter table room_members  enable row level security;
alter table room_entries  enable row level security;

drop policy if exists "rooms read"    on rooms;
drop policy if exists "members read"  on room_members;
drop policy if exists "members join"  on room_members;
drop policy if exists "entries read"  on room_entries;
drop policy if exists "entries write" on room_entries;
drop policy if exists "entries edit"  on room_entries;
drop policy if exists "entries del"   on room_entries;
create policy "rooms read"    on rooms        for select using (is_member(id));
create policy "members read"  on room_members for select using (is_member(room_id));
create policy "entries read"  on room_entries for select using (is_member(room_id));
create policy "entries write" on room_entries for insert with check (is_member(room_id) and author = auth.uid());
create policy "entries edit"  on room_entries for update using (is_member(room_id));
create policy "entries del"   on room_entries for delete using (is_member(room_id));

-- create a room + become its first member  (returns code + id)
create or replace function create_room(p_name text default null, p_meet date default null)
returns table(room_id uuid, room_code text)
language plpgsql security definer as $$
declare c text; rid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  loop
    c := lpad((floor(random()*1000000))::int::text, 6, '0');
    exit when not exists (select 1 from rooms where code = c);
  end loop;
  insert into rooms(code, name, meet_date, created_by) values (c, p_name, p_meet, auth.uid()) returning id into rid;
  insert into room_members(room_id, user_id, display_name)
    values (rid, auth.uid(), coalesce((select raw_user_meta_data->>'name' from auth.users where id = auth.uid()), 'me'));
  room_id := rid; room_code := c; return next;
end; $$;

-- join a room by its 6-digit code (max 2 members)
create or replace function join_room(p_code text)
returns uuid language plpgsql security definer as $$
declare rid uuid; cnt int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select id into rid from rooms where code = p_code;
  if rid is null then raise exception 'no such room'; end if;
  if not exists (select 1 from room_members where room_id = rid and user_id = auth.uid()) then
    select count(*) into cnt from room_members where room_id = rid;
    if cnt >= 2 then raise exception 'room full'; end if;
    insert into room_members(room_id, user_id, display_name)
      values (rid, auth.uid(), coalesce((select raw_user_meta_data->>'name' from auth.users where id = auth.uid()), 'friend'));
  end if;
  return rid;
end; $$;

-- the caller's most recent room (so they re-enter automatically)
create or replace function my_room()
returns table(room_id uuid, room_code text)
language sql security definer stable as $$
  select r.id, r.code from rooms r
  join room_members m on m.room_id = r.id
  where m.user_id = auth.uid()
  order by m.joined_at desc limit 1;
$$;

grant execute on function create_room(text,date) to authenticated;
grant execute on function join_room(text)         to authenticated;
grant execute on function my_room()               to authenticated;

-- ── visitor "plant a flower" wall (public) ─────────────────────
create table if not exists planted_flowers (
  id bigint generated always as identity primary key,
  country text not null,
  message text not null check (char_length(message) <= 120),
  created_at timestamptz default now()
);
alter table planted_flowers enable row level security;
drop policy if exists "anyone can read"  on planted_flowers;
drop policy if exists "anyone can plant" on planted_flowers;
create policy "anyone can read"  on planted_flowers for select using (true);
create policy "anyone can plant" on planted_flowers for insert with check (true);

-- ✅ Done. Now do dashboard toggle A (email confirm off) and the
--    Storage setup (bucket "room-uploads" + 2 policies) from chat.
