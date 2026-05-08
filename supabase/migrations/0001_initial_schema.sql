-- =====================================================================
-- Mi Armario - Esquema inicial
-- Ejecutar este SQL completo en el SQL Editor de Supabase
-- =====================================================================

-- Extensión para UUIDs
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- PROFILES (datos extra del usuario, vinculado a auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- CATEGORIES (editables por el usuario)
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text default '#a855f7',
  created_at timestamptz default now() not null,
  unique (user_id, name)
);

-- ---------------------------------------------------------------------
-- CLOTHES (prendas del armario y de venta - todo en una tabla)
-- status: 'closet' | 'baul' | 'en_venta' | 'vendida' | 'archivada'
-- ---------------------------------------------------------------------
create table if not exists public.clothes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  image_path text,            -- ruta dentro del bucket si es subida local
  notes text,
  tags text[] default '{}',
  status text not null default 'closet'
    check (status in ('closet', 'baul', 'en_venta', 'vendida', 'archivada')),
  on_wallapop boolean default false not null,
  on_vinted boolean default false not null,
  price numeric(10,2),
  sold_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists clothes_user_status_idx on public.clothes (user_id, status);
create index if not exists clothes_user_category_idx on public.clothes (user_id, category_id);

-- ---------------------------------------------------------------------
-- OUTFITS (colecciones de prendas)
-- ---------------------------------------------------------------------
create table if not exists public.outfits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cover_image_url text,
  created_at timestamptz default now() not null
);

create table if not exists public.outfit_items (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  clothe_id uuid not null references public.clothes(id) on delete cascade,
  primary key (outfit_id, clothe_id)
);

-- ---------------------------------------------------------------------
-- WISHLIST
-- ---------------------------------------------------------------------
create table if not exists public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  name text,
  price numeric(10,2),
  image_url text,
  notes text,
  created_at timestamptz default now() not null
);

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clothes_set_updated_at on public.clothes;
create trigger clothes_set_updated_at before update on public.clothes
  for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.clothes enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.wishlist enable row level security;

-- profiles
drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

-- categories
drop policy if exists "categories all own" on public.categories;
create policy "categories all own" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- clothes
drop policy if exists "clothes all own" on public.clothes;
create policy "clothes all own" on public.clothes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- outfits
drop policy if exists "outfits all own" on public.outfits;
create policy "outfits all own" on public.outfits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- outfit_items (a través del outfit padre)
drop policy if exists "outfit_items all own" on public.outfit_items;
create policy "outfit_items all own" on public.outfit_items
  for all using (
    exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid())
  );

-- wishlist
drop policy if exists "wishlist all own" on public.wishlist;
create policy "wishlist all own" on public.wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- STORAGE BUCKET
-- =====================================================================
-- Crear bucket público "clothes-images" desde el panel Storage de Supabase,
-- o ejecutar:
insert into storage.buckets (id, name, public)
  values ('clothes-images', 'clothes-images', true)
  on conflict (id) do nothing;

-- Políticas del bucket: cada usuario puede subir/leer/borrar sus propios archivos
-- Los archivos se organizan en carpetas por user_id: <user_id>/<filename>
drop policy if exists "clothes-images select own" on storage.objects;
create policy "clothes-images select own" on storage.objects
  for select using (
    bucket_id = 'clothes-images'
  );

drop policy if exists "clothes-images insert own" on storage.objects;
create policy "clothes-images insert own" on storage.objects
  for insert with check (
    bucket_id = 'clothes-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "clothes-images update own" on storage.objects;
create policy "clothes-images update own" on storage.objects
  for update using (
    bucket_id = 'clothes-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "clothes-images delete own" on storage.objects;
create policy "clothes-images delete own" on storage.objects
  for delete using (
    bucket_id = 'clothes-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- CATEGORÍAS POR DEFECTO al crear un perfil
-- =====================================================================
create or replace function public.create_default_categories()
returns trigger as $$
begin
  insert into public.categories (user_id, name, color) values
    (new.id, 'Camisetas',  '#a855f7'),
    (new.id, 'Pantalones', '#3b82f6'),
    (new.id, 'Vestidos',   '#ec4899'),
    (new.id, 'Zapatos',    '#f59e0b'),
    (new.id, 'Accesorios', '#10b981'),
    (new.id, 'Abrigos',    '#6366f1');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_create_default_categories on public.profiles;
create trigger profiles_create_default_categories
  after insert on public.profiles
  for each row execute procedure public.create_default_categories();
