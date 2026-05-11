-- =====================================================================
-- Mi Armario - 0004: Calendario de uso
-- =====================================================================
-- Tabla `wears` que registra qué prenda u outfit se llevó en una fecha.
-- Cada fila debe referenciar al menos una prenda o un outfit (constraint).
-- =====================================================================

create table if not exists public.wears (
  id uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  clothe_id uuid references public.clothes(id) on delete cascade,
  outfit_id uuid references public.outfits(id) on delete cascade,
  wear_date date not null,
  notes     text,
  created_at timestamptz default now() not null,
  constraint wears_target_check check (clothe_id is not null or outfit_id is not null)
);

create index if not exists wears_user_date_idx on public.wears (user_id, wear_date);
create index if not exists wears_clothe_idx    on public.wears (clothe_id) where clothe_id is not null;
create index if not exists wears_outfit_idx    on public.wears (outfit_id) where outfit_id is not null;

alter table public.wears enable row level security;

drop policy if exists "wears all own" on public.wears;
create policy "wears all own" on public.wears
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
