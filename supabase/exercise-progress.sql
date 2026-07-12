-- Home therapy exercise progress (tied to user)

create table if not exists public.exercise_progress (
  user_id text not null,
  exercise_id text not null,
  completed boolean not null default false,
  completed_at timestamptz null,
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create index if not exists exercise_progress_user_idx
  on public.exercise_progress (user_id);

alter table public.exercise_progress enable row level security;

create policy "Users can read own exercise progress"
  on public.exercise_progress for select
  using (user_id = auth.uid()::text);

create policy "Users can insert own exercise progress"
  on public.exercise_progress for insert
  with check (user_id = auth.uid()::text);

create policy "Users can update own exercise progress"
  on public.exercise_progress for update
  using (user_id = auth.uid()::text);
