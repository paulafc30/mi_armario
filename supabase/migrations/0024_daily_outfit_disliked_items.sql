-- =====================================================================
-- Mi Armario - 0024: Prendas concretas que no combinan dentro del outfit
-- =====================================================================
-- Al valorar negativamente un outfit sugerido, la usuaria puede señalar
-- qué prenda(s) concretas no encajaban con el resto (en vez de descartar
-- todo el outfit como "malo"). `daily-outfits` usa esto para aprender que
-- esa prenda concreta no combina bien con esas otras, no que la prenda en
-- sí sea mala.
-- =====================================================================

alter table public.daily_outfit_suggestions
  add column if not exists disliked_item_ids text[] not null default array[]::text[];
