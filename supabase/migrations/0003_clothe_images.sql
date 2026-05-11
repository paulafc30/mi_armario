-- =====================================================================
-- Mi Armario - 0003: Soporte de varias imágenes por prenda
-- =====================================================================
-- Hasta ahora cada prenda tenía un único `image_url`/`image_path`.
-- Pasamos a tener una tabla `clothe_images` con todas las fotos
-- y un trigger que mantiene `clothes.image_url` apuntando siempre
-- a la primera imagen (la portada / cover).
-- =====================================================================

create table if not exists public.clothe_images (
  id uuid primary key default uuid_generate_v4(),
  clothe_id uuid not null references public.clothes(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  url  text not null,
  path text,                       -- ruta dentro del bucket si es subida local
  position int default 0 not null,
  created_at timestamptz default now() not null
);

create index if not exists clothe_images_clothe_idx
  on public.clothe_images (clothe_id, position);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.clothe_images enable row level security;

drop policy if exists "clothe_images all own" on public.clothe_images;
create policy "clothe_images all own" on public.clothe_images
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Trigger: mantener clothes.image_url/path apuntando a la primera imagen
-- ---------------------------------------------------------------------
create or replace function public.sync_cover_image()
returns trigger as $$
declare
  v_clothe_id uuid;
begin
  v_clothe_id := coalesce(new.clothe_id, old.clothe_id);
  update public.clothes c
  set image_url = (
        select ci.url from public.clothe_images ci
        where ci.clothe_id = v_clothe_id
        order by ci.position asc, ci.created_at asc
        limit 1
      ),
      image_path = (
        select ci.path from public.clothe_images ci
        where ci.clothe_id = v_clothe_id
        order by ci.position asc, ci.created_at asc
        limit 1
      )
  where c.id = v_clothe_id;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists clothe_images_sync_cover on public.clothe_images;
create trigger clothe_images_sync_cover
  after insert or update or delete on public.clothe_images
  for each row execute procedure public.sync_cover_image();

-- ---------------------------------------------------------------------
-- Migrar las imágenes existentes (las que están en clothes.image_url)
-- ---------------------------------------------------------------------
insert into public.clothe_images (clothe_id, user_id, url, path, position)
  select id, user_id, image_url, image_path, 0
  from public.clothes
  where image_url is not null
    and not exists (
      select 1 from public.clothe_images ci where ci.clothe_id = clothes.id
    );
