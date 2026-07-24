-- =====================================================================
-- Mi Armario - 0023: Valoración de los outfits sugeridos del día
-- =====================================================================
-- Permite puntuar (👍/👎) cada uno de los outfits diarios generados
-- (casual/gym/cena). Se usa en `daily-outfits` para:
--   1. No repetir la misma combinación exacta de un día para el siguiente.
--   2. Sesgar futuras sugerencias hacia lo que le gustó y evitar lo que no.
-- =====================================================================

alter table public.daily_outfit_suggestions
  add column if not exists rating text check (rating in ('positive', 'negative'));
