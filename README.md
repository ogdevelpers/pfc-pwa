# PFC Event Companion

A mobile-only companion for the PFC gathering: announcements, playable games, the three-day itinerary, PicBot, squad and individual leaderboards, and team chat.

On a laptop the app stays in a phone-width column. On a phone it fills the screen and can be added to the home screen.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first screen asks for a mobile number. The rest of the app stays hidden until that number matches a guest in Supabase. Scores, quest checks, and chat typed on this phone stay in the browser until that connection is live.

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor. Re-run it if the project was created before mobile login; it adds `participants.phone` and `find_guest_by_phone`.
3. Put each guest’s mobile number on their `participants` row. Store digits only, with or without a country code. The check uses the last 10 digits.
4. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
5. Restart `npm run dev`.

The sample guests are `9811100001` (Leila Rossi, Yellow) through `9811100014` (Chiara Conti). Replace those with the real invitation numbers before the gathering.

Chat then updates live, and points from the games land on the shared board. Photos and documents sent in chat are stored in the `chat-files` bucket; re-run `supabase/schema.sql` if attachments do not appear for the rest of the squad. Photos added to the `photos` table show up in PicBot beside the built-in set. Phone numbers are not included in the open guest-list query; login calls `find_guest_by_phone` and only returns a match. The anon key can still post messages and scores; add Supabase Auth before a public launch if that should be locked down.

`select public.reset_daily_scores();` clears the daily tallies on a new morning.
