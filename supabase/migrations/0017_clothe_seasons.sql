-- ---------------------------------------------------------------
-- Cambiar season_id (1:1) por clothe_seasons (many-to-many)
-- ---------------------------------------------------------------

-- Tabla junction
create table if not exists public.clothe_seasons (
  clothe_id  uuid not null references public.clothes(id) on delete cascade,
  season_id  uuid not null references public.seasons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (clothe_id, season_id)
);

-- Migrar datos existentes de season_id -> clothe_seasons
insert into public.clothe_seasons (clothe_id, season_id)
  select id, season_id
  from public.clothes
  where season_id is not null
on conflict do nothing;

-- Quitar columna season_id de clothes
alter table public.clothes drop column if exists season_id;

-- Índices
create index if not exists clothe_seasons_clothe_idx on public.clothe_seasons (clothe_id);
create index if not exists clothe_seasons_season_idx on public.clothe_seasons (season_id);

-- RLS
alter table public.clothe_seasons enable row level security;

create policy "clothe_seasons_select" on public.clothe_seasons
  for select using (
    exists (select 1 from public.clothes c where c.id = clothe_id and c.user_id = auth.uid())
  );

create policy "clothe_seasons_insert" on public.clothe_seasons
  for insert with check (
    exists (select 1 from public.clothes c where c.id = clothe_id and c.user_id = auth.uid())
  );

create policy "clothe_seasons_delete" on public.clothe_seasons
  for delete using (
    exists (select 1 from public.clothes c where c.id = clothe_id and c.user_id = auth.uid())
  );

grant select, insert, delete on public.clothe_seasons to authenticated;
