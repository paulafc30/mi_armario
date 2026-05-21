-- =====================================================================
-- Mi Armario - 0010: Múltiples listas de deseos
-- =====================================================================
-- Hasta ahora todos los items de la wishlist iban a un único cubo. Esta
-- migración añade el concepto de "listas" (carpetas) para poder agrupar:
-- "Verano", "Regalos", "Rebajas enero"…
--
--  1. Crea la tabla `wishlists` (las listas/carpetas).
--  2. Crea una lista por defecto ("Mis deseos") para cada usuaria existente.
--  3. Trigger para crear esa lista automáticamente al registrarse.
--  4. Añade `wishlist_id` a la tabla `wishlist` (los items) y rellena
--     los items existentes apuntando a la primera lista del usuario.
-- =====================================================================

create table if not exists public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text default '#FF5771',
  created_at timestamptz default now() not null,
  unique (user_id, name)
);

-- GRANTs explícitos (preparados para el cambio de Supabase de octubre)
grant select                          on public.wishlists to anon;
grant select, insert, update, delete  on public.wishlists to authenticated;
grant all                             on public.wishlists to service_role;

alter table public.wishlists enable row level security;

drop policy if exists "wishlists all own" on public.wishlists;
create policy "wishlists all own" on public.wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Lista por defecto para usuarias existentes (idempotente)
-- ---------------------------------------------------------------------
insert into public.wishlists (user_id, name)
  select p.id, 'Mis deseos'
  from public.profiles p
  where not exists (select 1 from public.wishlists w where w.user_id = p.id);

-- ---------------------------------------------------------------------
-- Trigger: nuevo perfil -> crear su lista por defecto
-- ---------------------------------------------------------------------
create or replace function public.create_default_wishlist()
returns trigger as $$
begin
  insert into public.wishlists (user_id, name) values (new.id, 'Mis deseos')
    on conflict (user_id, name) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_create_default_wishlist on public.profiles;
create trigger profiles_create_default_wishlist
  after insert on public.profiles
  for each row execute procedure public.create_default_wishlist();

-- ---------------------------------------------------------------------
-- Añadir wishlist_id a la tabla de items
-- ---------------------------------------------------------------------
alter table public.wishlist
  add column if not exists wishlist_id uuid references public.wishlists(id) on delete cascade;

-- Backfill: items existentes -> primera lista del usuario propietario
update public.wishlist
   set wishlist_id = (
     select id from public.wishlists w
      where w.user_id = wishlist.user_id
      order by created_at asc
      limit 1
   )
 where wishlist_id is null;

create index if not exists wishlist_list_idx on public.wishlist (wishlist_id);
