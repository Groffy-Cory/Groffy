-- Add library catalog fields if the table already exists
alter table public.user_preferences
  add column if not exists library_catalog_url text not null default 'https://www.worldcat.org/search';

alter table public.user_preferences
  add column if not exists library_name text not null default 'Local library / WorldCat';
