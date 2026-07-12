-- Future Supabase schema for ROF Messages
-- Tied to auth.users.id when auth is enabled.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('family', 'doctor', 'personal', 'group')),
  sender text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false,
  reply_to_id uuid null references public.messages (id) on delete set null
);

create index if not exists messages_user_created_idx
  on public.messages (user_id, created_at desc);

alter table public.messages enable row level security;

create policy "Users can read own messages"
  on public.messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

create policy "Users can update own messages"
  on public.messages for update
  using (auth.uid() = user_id);
