-- =====================================================================
-- Mi Armario - 0009: Medidas y tipo de cuerpo
-- =====================================================================
-- Añade campos opcionales a `profiles` para guardar las medidas
-- corporales del usuario y sus tallas habituales. Con estos datos
-- la app calcula el tipo de silueta (lib/bodyType.ts) y comprueba si
-- las prendas ya añadidas le cuadran (lib/sizeFit.ts).
-- =====================================================================

alter table public.profiles
  add column if not exists height_cm   numeric(5,1),
  add column if not exists bust_cm     numeric(5,1),
  add column if not exists waist_cm    numeric(5,1),
  add column if not exists hips_cm     numeric(5,1),
  add column if not exists shoulder_cm numeric(5,1),
  add column if not exists weight_kg   numeric(5,1),
  add column if not exists top_size    text,
  add column if not exists bottom_size text,
  add column if not exists shoe_size   text;
