-- Pantry inventory — shared via Supabase for meal planning

create table if not exists public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  quantity text not null default '1',
  source text not null
    check (source in ('manual', 'fridge_scan', 'receipt')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pantry_items_user_name_idx
  on public.pantry_items (user_id, name);

alter table public.pantry_items enable row level security;

create policy "Users can read own pantry"
  on public.pantry_items for select
  using (user_id = auth.uid()::text);

create policy "Users can insert own pantry"
  on public.pantry_items for insert
  with check (user_id = auth.uid()::text);

create policy "Users can update own pantry"
  on public.pantry_items for update
  using (user_id = auth.uid()::text);

create policy "Users can delete own pantry"
  on public.pantry_items for delete
  using (user_id = auth.uid()::text);
