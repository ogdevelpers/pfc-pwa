-- PFC event companion
-- Run this in the Supabase SQL editor.
-- The app works without it. With it, chat is live and scores are shared.
-- The anon key can insert messages and scores. Turn on Supabase Auth
-- before a public launch if the board should not be open to the key.

create table if not exists public.teams (
  id text primary key,
  name text not null,
  points integer not null default 0,
  daily_offset integer not null default 0
);

create table if not exists public.participants (
  id text primary key,
  name text not null,
  team_id text not null references public.teams (id),
  points integer not null default 0,
  daily_points integer not null default 0,
  created_at timestamptz not null default now()
);

-- Named event_messages because a public.messages table may already exist
-- with a different shape. This script does not alter that table.
create table if not exists public.event_messages (
  id text primary key,
  team_id text not null references public.teams (id),
  author text not null,
  body text not null default '',
  image text,
  participant_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.point_events (
  id text primary key,
  participant_id text not null references public.participants (id),
  team_id text not null references public.teams (id),
  game_id text not null,
  points integer not null check (points >= 0 and points <= 50),
  detail text,
  created_at timestamptz not null default now(),
  check (
    game_id in (
      'riviera-explorers',
      'photo-quest',
      'trivia-challenge',
      'team-challenges',
      'spin-and-win'
    )
  )
);

create table if not exists public.activity_scores (
  game_id text not null,
  team_id text not null references public.teams (id),
  points integer not null default 0,
  primary key (game_id, team_id)
);

create table if not exists public.announcements (
  id text primary key,
  title text not null,
  body text not null,
  posted_label text not null default '',
  sort integer not null default 0
);

create table if not exists public.itinerary_items (
  id text primary key,
  day_id text not null,
  starts_at text not null,
  title text not null,
  place text not null,
  detail text not null,
  sort integer not null default 0
);

create table if not exists public.photos (
  id text primary key,
  src text not null,
  caption text not null,
  category text not null default 'highlights',
  people text[] not null default '{}',
  team_id text,
  aspect text not null default 'square'
);

insert into public.teams (id, name, points, daily_offset) values
  ('blue', 'Blue Squad', 290, 70),
  ('yellow', 'Yellow Squad', 320, 90),
  ('red', 'Red Squad', 270, 55),
  ('green', 'Green Squad', 240, 40),
  ('purple', 'Purple Squad', 220, 35),
  ('orange', 'Orange Squad', 210, 30)
on conflict (id) do nothing;

alter table public.participants add column if not exists phone text;

insert into public.participants (id, name, team_id, points, daily_points, phone) values
  ('p-leila', 'Leila Rossi', 'yellow', 110, 28, '9811100001'),
  ('p-marco', 'Marco Bianchi', 'yellow', 102, 24, '9811100002'),
  ('p-elena', 'Elena Voss', 'yellow', 92, 20, '9811100003'),
  ('p-sara', 'Sara Klein', 'red', 97, 22, '9811100004'),
  ('p-rohan', 'Rohan Mehta', 'blue', 96, 26, '9811100005'),
  ('p-priya', 'Priya Shah', 'blue', 88, 18, '9811100006'),
  ('p-noah', 'Noah Adeyemi', 'green', 84, 16, '9811100007'),
  ('p-ines', 'Ines Costa', 'purple', 79, 14, '9811100008'),
  ('p-omar', 'Omar Haddad', 'orange', 76, 12, '9811100009'),
  ('p-amit', 'Amit Verma', 'blue', 74, 14, '9811100010'),
  ('p-hana', 'Hana Ito', 'red', 71, 18, '9811100011'),
  ('p-maya', 'Maya Berg', 'green', 68, 12, '9811100012'),
  ('p-luis', 'Luis Ortega', 'purple', 66, 10, '9811100013'),
  ('p-chiara', 'Chiara Conti', 'orange', 64, 11, '9811100014')
on conflict (id) do update
  set phone = excluded.phone
  where public.participants.phone is null;

create unique index if not exists participants_phone_unique on public.participants (phone);

create or replace function public.phone_digits(value text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(value, ''), '\D', '', 'g');
$$;

-- Exact digit match, or the same last 10 digits (country code optional).
create or replace function public.find_guest_by_phone(p_phone text)
returns table (id text, name text, team_id text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.name, p.team_id
  from public.participants p
  where length(right(public.phone_digits(p_phone), 10)) = 10
    and right(public.phone_digits(p.phone), 10) = right(public.phone_digits(p_phone), 10)
  limit 1;
$$;

revoke all on function public.phone_digits(text) from public;
revoke all on function public.find_guest_by_phone(text) from public;
grant execute on function public.find_guest_by_phone(text) to anon, authenticated;

insert into public.event_messages (id, team_id, author, body, created_at) values
  ('m-blue-1', 'blue', 'Rohan Mehta', 'Good morning team! Ready for today’s challenge?', '2026-11-15T08:15:00Z'),
  ('m-blue-2', 'blue', 'Priya Shah', 'See you all at the lobby. Don’t forget your caps.', '2026-11-15T08:31:00Z'),
  ('m-blue-3', 'blue', 'Amit Verma', 'Excited for the harbour walk.', '2026-11-15T08:34:00Z'),
  ('m-blue-4', 'blue', 'Rohan Mehta', 'First clue is by the lemon trees. We finish together.', '2026-11-15T08:41:00Z'),
  ('m-yellow-1', 'yellow', 'Leila Rossi', 'Yellow is already at breakfast. The terrace light is perfect.', '2026-11-15T08:12:00Z'),
  ('m-yellow-2', 'yellow', 'Marco Bianchi', 'Save a table if you come up late. We started the photo list.', '2026-11-15T08:20:00Z'),
  ('m-red-1', 'red', 'Sara Klein', 'Red squad, lobby at 8:40. We walk down together.', '2026-11-15T08:05:00Z'),
  ('m-red-2', 'red', 'Hana Ito', 'I have spare pencils for trivia if you want one.', '2026-11-15T08:18:00Z'),
  ('m-green-1', 'green', 'Noah Adeyemi', 'Green is walking up from the harbour. Leave the fast ones a view to catch.', '2026-11-15T08:22:00Z'),
  ('m-green-2', 'green', 'Maya Berg', 'Caps are in my tote if you forgot yours.', '2026-11-15T08:29:00Z'),
  ('m-purple-1', 'purple', 'Ines Costa', 'Purple, wear shoes you trust. The steps are steep and worth it.', '2026-11-15T08:16:00Z'),
  ('m-purple-2', 'purple', 'Luis Ortega', 'I will be at the lemon trees five minutes early.', '2026-11-15T08:27:00Z'),
  ('m-orange-1', 'orange', 'Omar Haddad', 'Orange will take the early boat if the desk confirms it.', '2026-11-15T08:11:00Z'),
  ('m-orange-2', 'orange', 'Chiara Conti', 'See you at the forum doors if we split this afternoon.', '2026-11-15T08:27:00Z')
on conflict (id) do nothing;

insert into public.activity_scores (game_id, team_id, points) values
  ('riviera-explorers', 'yellow', 50),
  ('riviera-explorers', 'blue', 40),
  ('riviera-explorers', 'red', 30),
  ('riviera-explorers', 'green', 20),
  ('riviera-explorers', 'purple', 20),
  ('riviera-explorers', 'orange', 10),
  ('photo-quest', 'yellow', 80),
  ('photo-quest', 'blue', 60),
  ('photo-quest', 'red', 50),
  ('photo-quest', 'green', 40),
  ('photo-quest', 'purple', 30),
  ('photo-quest', 'orange', 30),
  ('trivia-challenge', 'yellow', 70),
  ('trivia-challenge', 'blue', 60),
  ('trivia-challenge', 'red', 40),
  ('trivia-challenge', 'green', 50),
  ('trivia-challenge', 'purple', 30),
  ('trivia-challenge', 'orange', 20),
  ('team-challenges', 'yellow', 80),
  ('team-challenges', 'blue', 70),
  ('team-challenges', 'red', 80),
  ('team-challenges', 'green', 60),
  ('team-challenges', 'purple', 50),
  ('team-challenges', 'orange', 40),
  ('spin-and-win', 'yellow', 40),
  ('spin-and-win', 'blue', 60),
  ('spin-and-win', 'red', 70),
  ('spin-and-win', 'green', 70),
  ('spin-and-win', 'purple', 90),
  ('spin-and-win', 'orange', 110)
on conflict (game_id, team_id) do nothing;

create or replace function public.apply_point_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.participants
    set points = points + new.points,
        daily_points = daily_points + new.points
    where id = new.participant_id;

  update public.teams
    set points = points + new.points
    where id = new.team_id;

  return new;
end;
$$;

drop trigger if exists point_events_apply on public.point_events;
create trigger point_events_apply
  after insert on public.point_events
  for each row execute function public.apply_point_event();

-- Call this each morning of the gathering if Daily should start from zero.
create or replace function public.reset_daily_scores()
returns void
language sql
security definer
set search_path = public
as $$
  update public.participants set daily_points = 0;
  update public.teams set daily_offset = 0;
$$;

alter table public.teams enable row level security;
alter table public.participants enable row level security;
alter table public.event_messages enable row level security;
alter table public.point_events enable row level security;
alter table public.activity_scores enable row level security;
alter table public.announcements enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.photos enable row level security;

drop policy if exists teams_read on public.teams;
drop policy if exists participants_read on public.participants;
drop policy if exists participants_insert on public.participants;
drop policy if exists participants_update on public.participants;
drop policy if exists messages_read on public.event_messages;
drop policy if exists messages_insert on public.event_messages;
drop policy if exists point_events_read on public.point_events;
drop policy if exists point_events_insert on public.point_events;
drop policy if exists activity_read on public.activity_scores;
drop policy if exists announcements_read on public.announcements;
drop policy if exists itinerary_read on public.itinerary_items;
drop policy if exists photos_read on public.photos;

create policy teams_read on public.teams for select to anon, authenticated using (true);
create policy participants_read on public.participants for select to anon, authenticated using (true);
create policy participants_insert on public.participants for insert to anon, authenticated with check (true);
create policy participants_update on public.participants for update to anon, authenticated using (true) with check (true);
-- Direct reads and writes are closed. A guest only reaches their own squad
-- through list_team_messages and post_team_message, which match the phone
-- used at sign-in.
create or replace function public.list_team_messages(p_phone text)
returns table (
  id text,
  team_id text,
  author text,
  body text,
  image text,
  participant_id text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select m.id, m.team_id, m.author, m.body, m.image, m.participant_id, m.created_at
  from public.event_messages m
  join public.participants p on p.team_id = m.team_id
  where length(right(public.phone_digits(p_phone), 10)) = 10
    and right(public.phone_digits(p.phone), 10) = right(public.phone_digits(p_phone), 10)
  order by m.created_at;
$$;

create or replace function public.post_team_message(
  p_phone text,
  p_id text,
  p_body text,
  p_image text,
  p_created_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  guest public.participants%rowtype;
begin
  select * into guest
  from public.participants p
  where length(right(public.phone_digits(p_phone), 10)) = 10
    and right(public.phone_digits(p.phone), 10) = right(public.phone_digits(p_phone), 10)
  limit 1;

  if guest.id is null then
    return false;
  end if;

  insert into public.event_messages (id, team_id, author, body, image, participant_id, created_at)
  values (
    p_id,
    guest.team_id,
    guest.name,
    coalesce(p_body, ''),
    nullif(p_image, ''),
    guest.id,
    coalesce(p_created_at, now())
  )
  on conflict (id) do update
  set image = coalesce(nullif(excluded.image, ''), public.event_messages.image);

  return true;
end;
$$;

revoke all on function public.list_team_messages(text) from public;
revoke all on function public.post_team_message(text, text, text, text, timestamptz) from public;
grant execute on function public.list_team_messages(text) to anon, authenticated;
grant execute on function public.post_team_message(text, text, text, text, timestamptz) to anon, authenticated;
create policy point_events_read on public.point_events for select to anon, authenticated using (true);
create policy point_events_insert on public.point_events for insert to anon, authenticated with check (true);
create policy activity_read on public.activity_scores for select to anon, authenticated using (true);
create policy announcements_read on public.announcements for select to anon, authenticated using (true);
create policy itinerary_read on public.itinerary_items for select to anon, authenticated using (true);
create policy photos_read on public.photos for select to anon, authenticated using (true);

revoke all on public.teams, public.participants, public.event_messages, public.point_events, public.activity_scores, public.announcements, public.itinerary_items, public.photos from anon, authenticated;
grant select on public.teams, public.point_events, public.activity_scores, public.announcements, public.itinerary_items, public.photos to anon, authenticated;
-- Phone numbers stay off the open guest list. Login uses find_guest_by_phone.
grant select (id, name, team_id, points, daily_points, created_at) on public.participants to anon, authenticated;
grant insert on public.participants, public.point_events to anon, authenticated;
grant update (name, team_id) on public.participants to anon, authenticated;

alter table public.event_messages replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'event_messages'
  ) then
    alter publication supabase_realtime add table public.event_messages;
  end if;
exception
  when others then
    null;
end $$;

-- Chat photos and documents are stored here and the message keeps the public link.
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('chat-files', 'chat-files', true)
  on conflict (id) do update set public = excluded.public;

  drop policy if exists chat_files_read on storage.objects;
  create policy chat_files_read on storage.objects
    for select to anon, authenticated
    using (bucket_id = 'chat-files');

  drop policy if exists chat_files_insert on storage.objects;
  create policy chat_files_insert on storage.objects
    for insert to anon, authenticated
    with check (bucket_id = 'chat-files');
exception
  when others then
    raise notice 'chat file bucket was not created: %', sqlerrm;
end $$;

notify pgrst, 'reload schema';
