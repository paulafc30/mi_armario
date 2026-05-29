-- =====================================================================
-- Mi Armario - 0014: Fotos propias para los outfits
-- =====================================================================
-- Hasta ahora un outfit era SOLO una colección de prendas. Ahora un
-- outfit puede tener además fotos propias (e.g. una foto de la usuaria
-- con el look puesto, o un mosaico curado).
--
-- Las fotos se almacenan en el bucket existente `clothes-images` para
-- no crear más infraestructura (la política ya permite la escritura
-- por carpeta de usuario, que es lo que importa).
--
-- Trigger que mantiene `outfits.cover_image_url` apuntando a la primera
-- foto del outfit (igual que con clothe_images).
-- =====================================================================

create table if not exists public.outfit_images (
  id uuid primary key default uuid_generate_v4(),
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  url  text not null,
  path text,                       -- ruta dentro del bucket si es subida local
  position int default 0 not null,
  created_at timestamptz default now() not null
);

create index if not exists outfit_images_outfit_idx
  on public.outfit_images (outfit_id, position);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY + GRANTs
-- ---------------------------------------------------------------------
alter table public.outfit_images enable row level security;

drop policy if exists "outfit_images all own" on public.outfit_images;
create policy "outfit_images all own" on public.outfit_images
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select                          on public.outfit_images to anon;
grant select, insert, update, delete  on public.outfit_images to authenticated;
grant all                             on public.outfit_images to service_role;

-- ---------------------------------------------------------------------
-- Trigger: mantener outfits.cover_image_url apuntando a la primera foto
-- ---------------------------------------------------------------------
create or replace function public.sync_outfit_cover_image()
returns trigger as $$
declare
  v_outfit_id uuid;
begin
  v_outfit_id := coalesce(new.outfit_id, old.outfit_id);
  update public.outfits o
  set cover_image_url = (
        select oi.url from public.outfit_images oi
        where oi.outfit_id = v_outfit_id
        order by oi.position asc, oi.created_at asc
        limit 1
      )
  where o.id = v_outfit_id;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists outfit_images_sync_cover on public.outfit_images;
create trigger outfit_images_sync_cover
  after insert or update or delete on public.outfit_images
  for each row execute procedure public.sync_outfit_cover_image();
