-- User preferences shared across Weather, News, Sports, YouTube, Prayer, Facebook

create table if not exists public.user_preferences (
  user_id text primary key,
  weather_city text not null default 'Chicago',
  news_topics text[] not null default array['general','health'],
  sports_leagues text[] not null default array['NFL','MLB'],
  sports_teams text[] not null default array[]::text[],
  youtube_query text not null default 'classic songs',
  prayer_denomination text not null default 'mindfulness'
    check (prayer_denomination in ('christian', 'jewish', 'muslim', 'sikh', 'mindfulness')),
  facebook_profile_url text not null default '',
  library_catalog_url text not null default 'https://www.worldcat.org/search',
  library_name text not null default 'Local library / WorldCat',
  reminders_notifications_enabled boolean not null default true,
  on_prem_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences
  add column if not exists reminders_notifications_enabled boolean not null default true;

alter table public.user_preferences
  add column if not exists on_prem_mode boolean not null default false;

alter table public.user_preferences enable row level security;

create policy "Users can read own preferences"
  on public.user_preferences for select
  using (user_id = auth.uid()::text);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (user_id = auth.uid()::text);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (user_id = auth.uid()::text);
