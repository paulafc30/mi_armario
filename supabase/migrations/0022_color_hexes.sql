-- =====================================================================
-- Mi Armario - 0022: Hex exacto de color por prenda
-- =====================================================================
-- Hasta ahora `colors text[]` solo guardaba el NOMBRE de familia elegido
-- en un picker de 14 colores fijos (ej. "Azul"). Con el nuevo selector
-- de tono (slider HSL), la usuaria puede elegir un matiz preciso (ej. un
-- turquesa concreto), que se sigue clasificando en una familia para
-- `colors` (así el filtro de búsqueda por color sigue agrupando por
-- familia sin cambios), pero además guardamos el hex exacto elegido en
-- `color_hexes`, alineado por índice con `colors` (color_hexes[i] es el
-- tono exacto de colors[i]).
-- =====================================================================

alter table public.clothes
  add column if not exists color_hexes text[] not null default array[]::text[];
