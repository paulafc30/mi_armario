create table if not exists public.feedback (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete set null,
  type        text        not null check (type in ('suggestion', 'bug', 'other')),
  message     text        not null,
  email       text,
  user_agent  text,
  app_version text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_feedback_created on public.feedback(created_at desc);

alter table public.feedback enable row level security;

create policy "feedback_insert_authenticated" on public.feedback
  for insert with check (auth.uid() is not null);

create policy "feedback_select_own" on public.feedback
  for select using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert on public.feedback to authenticated;
