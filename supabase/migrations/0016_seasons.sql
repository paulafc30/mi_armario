-- ---------------------------------------------------------------
-- SEASONS
-- Estaciones base globales (user_id NULL) + custom por usuaria
-- ---------------------------------------------------------------

create table if not exists public.seasons (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,  -- NULL = global
  name        text not null,
  icon        text not null default '🌿',
  color       text not null default '#a855f7',
  is_global   boolean not null default false,
  sort_order  int not null default 99,
  created_at  timestamptz not null default now()
);

-- Estaciones base globales (fijas para todas las usuarias)
insert into public.seasons (id, user_id, name, icon, color, is_global, sort_order) values
  ('00000000-0000-0000-0000-000000000001', null, 'Primavera', '🌸', '#f472b6', true, 1),
  ('00000000-0000-0000-0000-000000000002', null, 'Verano',    '☀️', '#f97316', true, 2),
  ('00000000-0000-0000-0000-000000000003', null, 'Otoño',     '🍂', '#b45309', true, 3),
  ('00000000-0000-0000-0000-000000000004', null, 'Invierno',  '❄️', '#3b82f6', true, 4)
on conflict (id) do nothing;

-- RLS
alter table public.seasons enable row level security;

-- Leer: estaciones globales O propias
create policy "seasons_select" on public.seasons
  for select using (is_global = true or auth.uid() = user_id);

-- Insertar: solo propias (no globales)
create policy "seasons_insert" on public.seasons
  for insert with check (auth.uid() = user_id and is_global = false);

-- Actualizar: solo propias
create policy "seasons_update" on public.seasons
  for update using (auth.uid() = user_id and is_global = false);

-- Borrar: solo propias
create policy "seasons_delete" on public.seasons
  for delete using (auth.uid() = user_id and is_global = false);

-- Grants
grant select on public.seasons to authenticated;
grant insert, update, delete on public.seasons to authenticated;

-- Añadir season_id a clothes
alter table public.clothes
  add column if not exists season_id uuid references public.seasons(id) on delete set null;

create index if not exists clothes_season_idx on public.clothes (user_id, season_id);
