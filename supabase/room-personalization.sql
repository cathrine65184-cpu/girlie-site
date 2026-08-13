-- Girlie Room personalization
-- Run after supabase-setup.sql. Safe to run more than once.

drop policy if exists "rooms update" on rooms;
create policy "rooms update" on rooms for update
  using (is_member(id)) with check (is_member(id));

-- The chosen friendship start date is intentionally separate from created_at.
create or replace function update_room_friendship_start(p_room_id uuid, p_meet date)
returns void language plpgsql security definer as $$
begin
  if auth.uid() is null or not is_member(p_room_id) then raise exception 'not allowed'; end if;
  if p_meet is null or p_meet > current_date then raise exception 'invalid friendship start date'; end if;
  update rooms set meet_date = p_meet where id = p_room_id;
end; $$;

grant execute on function update_room_friendship_start(uuid,date) to authenticated;

-- Shared album and Bucket List configuration are private room entries too.
alter table room_entries drop constraint if exists room_entries_kind_check;
alter table room_entries add constraint room_entries_kind_check
  check (kind in ('timeline','album','check','album_config','bucket_config'));
