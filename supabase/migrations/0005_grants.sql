-- =====================================================================
-- Mi Armario - 0005: GRANTs explícitos en tablas del esquema public
-- =====================================================================
-- A partir del 30 de octubre de 2026, Supabase exige GRANTs explícitos
-- para que el Data API (PostgREST / supabase-js) pueda acceder a una
-- tabla del esquema "public". Hasta ahora era automático.
--
-- Esta migración añade los GRANTs estándar a todas las tablas de la app.
-- Es idempotente y tolerante: si una tabla no existe (porque aún no se
-- ha corrido su migración), simplemente la salta sin fallar.
--
-- Patrón aplicado por tabla:
--   anon:          SELECT          (las consultas siguen filtradas por RLS)
--   authenticated: SELECT, INSERT, UPDATE, DELETE
--   service_role:  ALL
-- =====================================================================

do $$
declare
  tbl text;
  tables text[] := array[
    'profiles',
    'categories',
    'clothes',
    'clothe_images',
    'outfits',
    'outfit_items',
    'wishlist',
    'wears'
  ];
begin
  foreach tbl in array tables loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = tbl
    ) then
      execute format('grant select on public.%I to anon', tbl);
      execute format('grant select, insert, update, delete on public.%I to authenticated', tbl);
      execute format('grant all on public.%I to service_role', tbl);
      raise notice 'GRANTs aplicados a public.%', tbl;
    else
      raise notice 'Saltando public.% (la tabla no existe todavía)', tbl;
    end if;
  end loop;
end $$;

-- =====================================================================
-- Notas
-- =====================================================================
-- 1. No hay secuencias que conceder: todas las PK usan UUID (uuid_generate_v4).
-- 2. RLS sigue activado en todas las tablas, así que aunque "anon" tenga
--    SELECT, las consultas devuelven 0 filas si no hay sesión válida.
-- 3. El bucket de Storage 'clothes-images' usa políticas independientes
--    (storage.objects), no le afecta este cambio.
-- 4. Para tablas FUTURAS, recuerda añadir las tres líneas de grant en su
--    propia migración antes de habilitar RLS y crear políticas.
