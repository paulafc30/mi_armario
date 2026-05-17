-- =====================================================================
-- Mi Armario - 0008: Fecha de publicación en venta
-- =====================================================================
-- Añade la columna `listed_at` que registra cuándo una prenda pasó a
-- estado *en_venta*. Sirve para mostrar "Llevas N días publicada" y
-- avisar cuando una prenda se queda sin moverse.
--
-- - Si ya estás en *en_venta* cuando se ejecuta la migración, asumimos
--   como fecha de publicación el `updated_at` actual (mejor aproximación
--   disponible sin historial).
-- - El hook `useChangeClothesStatus` se encarga de mantenerlo:
--     * pasar a *en_venta*  → `listed_at = now()`
--     * pasar a *baul/closet* → `listed_at = null` (se reinicia)
--     * pasar a *vendida/archivada* → se conserva (queda como histórico)
-- =====================================================================

alter table public.clothes add column if not exists listed_at timestamptz;

update public.clothes
   set listed_at = updated_at
 where status = 'en_venta' and listed_at is null;
