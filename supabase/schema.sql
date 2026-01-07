-- =========================
-- SUPABASE SCHEMA (RINGAN)
-- =========================

-- DOWNLOAD EVENTS (untuk total unduhan)
create table if not exists public.download_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  version text null
);

alter table public.download_events enable row level security;

-- public can insert
drop policy if exists "download_events_insert_anyone" on public.download_events;
create policy "download_events_insert_anyone"
on public.download_events
for insert
to anon, authenticated
with check (true);

-- public can read (optional, karena kita cuma butuh count)
drop policy if exists "download_events_select_anyone" on public.download_events;
create policy "download_events_select_anyone"
on public.download_events
for select
to anon, authenticated
using (true);

-- RATINGS
create table if not exists public.ratings (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null unique,
  user_name text not null,
  avatar_url text null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text null
);

alter table public.ratings enable row level security;

-- public read
drop policy if exists "ratings_select_anyone" on public.ratings;
create policy "ratings_select_anyone"
on public.ratings
for select
to anon, authenticated
using (true);

-- authenticated can insert their own rating
drop policy if exists "ratings_insert_own" on public.ratings;
create policy "ratings_insert_own"
on public.ratings
for insert
to authenticated
with check (auth.uid() = user_id);

-- authenticated can update their own rating
drop policy if exists "ratings_update_own" on public.ratings;
create policy "ratings_update_own"
on public.ratings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- helper: summary function (average + distribution)
create or replace function public.get_rating_summary()
returns table (
  avg_rating numeric,
  total_reviews bigint,
  star_5 bigint,
  star_4 bigint,
  star_3 bigint,
  star_2 bigint,
  star_1 bigint
)
language sql
stable
as $$
  select
    coalesce(avg(r.rating)::numeric, 0) as avg_rating,
    count(*)::bigint as total_reviews,
    count(*) filter (where r.rating = 5)::bigint as star_5,
    count(*) filter (where r.rating = 4)::bigint as star_4,
    count(*) filter (where r.rating = 3)::bigint as star_3,
    count(*) filter (where r.rating = 2)::bigint as star_2,
    count(*) filter (where r.rating = 1)::bigint as star_1
  from public.ratings r;
$$;


-- =========================
-- SITE CONTENT (Admin Panel)
-- =========================
create table if not exists public.site_content (
  key text primary key,
  app jsonb null,
  download_url text null,
  hero_image text null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- public read (konten landing)
drop policy if exists "site_content_select_anyone" on public.site_content;
create policy "site_content_select_anyone"
on public.site_content
for select
to anon, authenticated
using (true);

-- NOTE:
-- Untuk update dari Admin Panel, paling aman gunakan service role via server (Edge Function).
-- Namun untuk versi client-only ini, kamu bisa membuat policy khusus authenticated.
-- Contoh policy (HATI-HATI): authenticated bisa upsert.
drop policy if exists "site_content_upsert_authenticated" on public.site_content;
create policy "site_content_upsert_authenticated"
on public.site_content
for all
to authenticated
using (true)
with check (true);

