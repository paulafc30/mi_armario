-- =====================================================================
-- Mi Armario - 0005: GRANTs explícitos en tablas del esquema public
-- =====================================================================
-- A partir del 30 de octubre de 2026, Supabase exige GRANTs explícitos
-- para que el Data API (PostgREST / supabase-js) pueda acceder a una
-- tabla del esquema "public". Hasta ahora era automático.
--
-- Esta migración añade los GRANTs estándar a todas las tablas existentes
-- para que la app siga funcionando sin sorpresas tras esa fecha.
--
-- Patrón aplicado por tabla:
--   anon:          SELECT          (las consultas siguen filtradas por RLS)
--   authenticated: SELECT, INSERT, UPDATE, DELETE
--   service_role:  ALL
-- =====================================================================

-- profiles ------------------------------------------------------------
grant select                          on public.profiles      to anon;
grant select, insert, update, delete  on public.profiles      to authenticated;
grant all                             on public.profiles      to service_role;

-- categories ----------------------------------------------------------
grant select                          on public.categories    to anon;
grant select, insert, update, delete  on public.categories    to authenticated;
grant all                             on public.categories    to service_role;

-- clothes -------------------------------------------------------------
grant select                          on public.clothes       to anon;
grant select, insert, update, delete  on public.clothes       to authenticated;
grant all                             on public.clothes       to service_role;

-- clothe_images -------------------------------------------------------
grant select                          on public.clothe_images to anon;
grant select, insert, update, delete  on public.clothe_images to authenticated;
grant all                             on public.clothe_images to service_role;

-- outfits -------------------------------------------------------------
grant select                          on public.outfits       to anon;
grant select, insert, update, delete  on public.outfits       to authenticated;
grant all                             on public.outfits       to service_role;

-- outfit_items --------------------------------------------------------
grant select                          on public.outfit_items  to anon;
grant select, insert, update, delete  on public.outfit_items  to authenticated;
grant all                             on public.outfit_items  to service_role;

-- wishlist ------------------------------------------------------------
grant select                          on public.wishlist      to anon;
grant select, insert, update, delete  on public.wishlist      to authenticated;
grant all                             on public.wishlist      to service_role;

-- wears ---------------------------------------------------------------
grant select                          on public.wears         to anon;
grant select, insert, update, delete  on public.wears         to authenticated;
grant all                             on public.wears         to service_role;

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
