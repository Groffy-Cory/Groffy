-- ROF Lists — grocery, coupons, to-do, and custom lists with items + reminders

create table if not exists public.rof_lists (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  kind text not null check (kind in ('grocery', 'coupons', 'todo', 'custom')),
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rof_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.rof_lists (id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  reminder_time text null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rof_lists_user_updated_idx
  on public.rof_lists (user_id, updated_at desc);

create index if not exists rof_list_items_list_idx
  on public.rof_list_items (list_id);

alter table public.rof_lists enable row level security;
alter table public.rof_list_items enable row level security;

create policy "Users can read own lists"
  on public.rof_lists for select
  using (user_id = auth.uid()::text);

create policy "Users can insert own lists"
  on public.rof_lists for insert
  with check (user_id = auth.uid()::text);

create policy "Users can update own lists"
  on public.rof_lists for update
  using (user_id = auth.uid()::text);

create policy "Users can delete own lists"
  on public.rof_lists for delete
  using (user_id = auth.uid()::text);

create policy "Users can read own list items"
  on public.rof_list_items for select
  using (
    exists (
      select 1 from public.rof_lists l
      where l.id = rof_list_items.list_id
        and l.user_id = auth.uid()::text
    )
  );

create policy "Users can insert own list items"
  on public.rof_list_items for insert
  with check (
    exists (
      select 1 from public.rof_lists l
      where l.id = rof_list_items.list_id
        and l.user_id = auth.uid()::text
    )
  );

create policy "Users can update own list items"
  on public.rof_list_items for update
  using (
    exists (
      select 1 from public.rof_lists l
      where l.id = rof_list_items.list_id
        and l.user_id = auth.uid()::text
    )
  );

create policy "Users can delete own list items"
  on public.rof_list_items for delete
  using (
    exists (
      select 1 from public.rof_lists l
      where l.id = rof_list_items.list_id
        and l.user_id = auth.uid()::text
    )
  );
