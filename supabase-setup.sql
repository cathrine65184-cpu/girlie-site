-- ═══════════════════════════════════════════════════════════════
-- Girlie Room / Secret Room — backend setup
-- Run this once in Supabase → SQL Editor → New query → Run.
-- (Safe to re-run; uses "if not exists" / "on conflict".)
-- ═══════════════════════════════════════════════════════════════

-- 1) Room data: timeline entries, album items, bucket-list goals.
--    One flexible table; `kind` says which, `payload` holds the JSON.
create table if not exists room_entries (
  id         bigint generated always as identity primary key,
  room_code  text not null,
  kind       text not null check (kind in ('timeline','album','check')),
  payload    jsonb not null,
  created_at timestamptz default now()
);
create index if not exists room_entries_lookup on room_entries (room_code, kind, id);

alter table room_entries enable row level security;

-- Anyone who knows a room's 6-digit code can read/add/update/remove
-- entries in THAT room. (Privacy is by code secrecy — see note below.)
drop policy if exists "room read"   on room_entries;
drop policy if exists "room insert" on room_entries;
drop policy if exists "room update" on room_entries;
drop policy if exists "room delete" on room_entries;
create policy "room read"   on room_entries for select using (true);
create policy "room insert" on room_entries for insert with check (true);
create policy "room update" on room_entries for update using (true);
create policy "room delete" on room_entries for delete using (true);

-- 2) Storage bucket for real photo / video uploads (public read).
insert into storage.buckets (id, name, public)
values ('room-uploads', 'room-uploads', true)
on conflict (id) do update set public = true;

drop policy if exists "room uploads read"   on storage.objects;
drop policy if exists "room uploads write"  on storage.objects;
create policy "room uploads read"  on storage.objects
  for select using (bucket_id = 'room-uploads');
create policy "room uploads write" on storage.objects
  for insert with check (bucket_id = 'room-uploads');

-- ───────────────────────────────────────────────────────────────
-- PRIVACY NOTE
-- The site uses the public "publishable" key, so these rules protect
-- a room only by the secrecy of its 6-digit code (1,000,000 combos)
-- and uploaded files live in a PUBLIC bucket (anyone with the file URL
-- can open it). Good enough for a keepsake; NOT true privacy.
-- For real per-user privacy you'd add Supabase Auth (email/login) and
-- scope every policy to auth.uid(). Ask and I'll wire that up.
-- ───────────────────────────────────────────────────────────────
