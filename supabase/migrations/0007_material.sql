-- =====================================================================
-- Mi Armario - 0007: Composición (material) en prendas
-- =====================================================================
-- Añade un campo opcional para la composición/material principal
-- de la prenda (algodón, poliéster, lana, denim, etc.). Se usa para
-- enriquecer la ficha del producto y las descripciones de venta.
-- =====================================================================

alter table public.clothes add column if not exists material text;
