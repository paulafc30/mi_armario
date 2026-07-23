-- =====================================================================
-- Mi Armario - 0021: Sugerencias diarias de outfit (dashboard)
-- =====================================================================
-- Cachea 1 outfit sugerido por ocasión (casual, gym, cena) por usuario
-- y por día, para no regenerar con IA en cada carga de página.
-- =====================================================================

create table if not exists public.daily_outfit_suggestions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  suggestion_date date not null,
  occasion        text not null check (occasion in ('casual', 'gym', 'cena')),
  name            text not null,
  reason          text,
  item_ids        uuid[] not null default '{}',
  weather         text,
  created_at      timestamptz default now() not null,
  unique (user_id, suggestion_date, occasion)
);

create index if not exists daily_outfit_suggestions_user_date_idx
  on public.daily_outfit_suggestions (user_id, suggestion_date);

alter table public.daily_outfit_suggestions enable row level security;

drop policy if exists "daily_outfit_suggestions all own" on public.daily_outfit_suggestions;
create policy "daily_outfit_suggestions all own" on public.daily_outfit_suggestions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select on public.daily_outfit_suggestions to anon;
grant select, insert, update, delete on public.daily_outfit_suggestions to authenticated;
grant all on public.daily_outfit_suggestions to service_role;
