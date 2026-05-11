-- =====================================================================
-- Mi Armario - 0002: Campos extra en prendas
-- Añade marca, talla y color para enriquecer la ficha y permitir
-- generar descripciones de anuncios automáticamente.
-- =====================================================================

alter table public.clothes add column if not exists brand text;
alter table public.clothes add column if not exists size  text;
alter table public.clothes add column if not exists color text;
