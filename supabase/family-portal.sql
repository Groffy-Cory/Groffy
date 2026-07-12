-- Family Portal access + messaging + media storage
-- Run after profiles.sql, memory-vault.sql, and messages.sql

-- Allow owners and family members to manage vault access links
drop policy if exists "Owners can add family access" on public.memory_vault_access;
create policy "Owners can add family access"
  on public.memory_vault_access for insert
  with check (owner_id = auth.uid()::text);

drop policy if exists "Family can add themselves to vault access" on public.memory_vault_access;
create policy "Family can add themselves to vault access"
  on public.memory_vault_access for insert
  with check (family_user_id = auth.uid()::text);

drop policy if exists "Owners and family can update access roles" on public.memory_vault_access;
create policy "Owners and family can update access roles"
  on public.memory_vault_access for update
  using (
    owner_id = auth.uid()::text
    or family_user_id = auth.uid()::text
  );

-- Family with vault access can send inbox notes to the loved one
drop policy if exists "Family can send messages to linked seniors" on public.messages;
create policy "Family can send messages to linked seniors"
  on public.messages for insert
  with check (
    source = 'family'
    and exists (
      select 1
      from public.memory_vault_access a
      where a.owner_id = messages.user_id::text
        and a.family_user_id = auth.uid()::text
    )
  );

-- Optional: family can read only the family notes they can see via access
-- (seniors still read all of their own messages via existing policy)
drop policy if exists "Family can read linked family messages" on public.messages;
create policy "Family can read linked family messages"
  on public.messages for select
  using (
    source = 'family'
    and exists (
      select 1
      from public.memory_vault_access a
      where a.owner_id = messages.user_id::text
        and a.family_user_id = auth.uid()::text
    )
  );

-- Public read / authenticated write bucket for photos & voice notes
insert into storage.buckets (id, name, public)
values ('family-media', 'family-media', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload family media" on storage.objects;
create policy "Authenticated users can upload family media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'family-media');

drop policy if exists "Public can read family media" on storage.objects;
create policy "Public can read family media"
  on storage.objects for select
  to public
  using (bucket_id = 'family-media');

-- Profiles: allow authenticated users to look up a loved one by email/id for linking
drop policy if exists "Authenticated users can lookup profiles for linking" on public.profiles;
create policy "Authenticated users can lookup profiles for linking"
  on public.profiles for select
  to authenticated
  using (true);
