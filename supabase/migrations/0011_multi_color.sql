-- =====================================================================
-- Mi Armario - 0011: Múltiples colores por prenda (hasta 3 en la UI)
-- =====================================================================
-- Hasta ahora cada prenda tenía un único color en la columna `color`.
-- Esta migración añade `colors text[]` para guardar varios. La columna
-- antigua se conserva para no romper nada que aún la lea; la app pasa a
-- usar `colors`.
-- =====================================================================

alter table public.clothes
  add column if not exists colors text[] default array[]::text[];

-- Backfill: copiar el valor único de `color` al array si está vacío
update public.clothes
   set colors = array[color]
 where color is not null
   and (colors is null or array_length(colors, 1) is null);
