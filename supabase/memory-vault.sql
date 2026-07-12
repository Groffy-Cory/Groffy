-- Memory Vault — shared across ROF app and family portal (realfamilystories.com)
-- Both domains use the same Supabase project. Entries are keyed by owner_id
-- (the loved one's user id) so family can add stories the senior can read/edit.

create table if not exists public.memory_vault_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  entry_type text not null
    check (entry_type in ('story', 'photo', 'voice', 'family_message')),
  title text not null,
  body text not null,
  media_url text null,
  contributed_by text not null,
  source_app text not null
    check (source_app in ('rof', 'family_portal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memory_vault_owner_updated_idx
  on public.memory_vault_entries (owner_id, updated_at desc);

-- Who may contribute to a loved one's vault from the family portal
create table if not exists public.memory_vault_access (
  owner_id text not null,
  family_user_id text not null,
  role text not null check (role in ('family', 'caregiver')),
  created_at timestamptz not null default now(),
  primary key (owner_id, family_user_id)
);

alter table public.memory_vault_entries enable row level security;
alter table public.memory_vault_access enable row level security;

-- Owners: full read/write on their own vault
create policy "Owners can read own vault"
  on public.memory_vault_entries for select
  using (
    owner_id = auth.uid()::text
    or exists (
      select 1 from public.memory_vault_access a
      where a.owner_id = memory_vault_entries.owner_id
        and a.family_user_id = auth.uid()::text
    )
  );

create policy "Owners can insert own vault"
  on public.memory_vault_entries for insert
  with check (
    owner_id = auth.uid()::text
    or exists (
      select 1 from public.memory_vault_access a
      where a.owner_id = memory_vault_entries.owner_id
        and a.family_user_id = auth.uid()::text
    )
  );

create policy "Owners and family can update vault"
  on public.memory_vault_entries for update
  using (
    owner_id = auth.uid()::text
    or exists (
      select 1 from public.memory_vault_access a
      where a.owner_id = memory_vault_entries.owner_id
        and a.family_user_id = auth.uid()::text
    )
  );

create policy "Owners can delete own vault entries"
  on public.memory_vault_entries for delete
  using (owner_id = auth.uid()::text);

create policy "Users can read their vault access rows"
  on public.memory_vault_access for select
  using (
    owner_id = auth.uid()::text
    or family_user_id = auth.uid()::text
  );
