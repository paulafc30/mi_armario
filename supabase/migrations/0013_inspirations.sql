-- =====================================================================
-- Mi Armario - 0013: Sección Inspiración
-- =====================================================================
-- Tabla `inspirations` que guarda enlaces curados por la usuaria a:
--   - kind = 'pinterest' → boards/perfiles de Pinterest
--   - kind = 'store'     → secciones de novedades de tiendas favoritas
--
-- Cada fila es un atajo con título, URL e imagen (autorrellenada al
-- guardar usando microlink desde el cliente).
-- =====================================================================

create table if not exists public.inspirations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('pinterest', 'store')),
  title text,
  url text not null,
  image_url text,
  position int default 0 not null,
  created_at timestamptz default now() not null
);

create index if not exists inspirations_user_kind_idx
  on public.inspirations (user_id, kind, position);

alter table public.inspirations enable row level security;

drop policy if exists "inspirations all own" on public.inspirations;
create policy "inspirations all own" on public.inspirations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select                          on public.inspirations to anon;
grant select, insert, update, delete  on public.inspirations to authenticated;
grant all                             on public.inspirations to service_role;
