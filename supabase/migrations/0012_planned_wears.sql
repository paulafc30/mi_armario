-- =====================================================================
-- Mi Armario - 0012: Outfits planeados (recordatorio del día)
-- =====================================================================
-- Añade un flag `planned` a la tabla `wears`:
--   - `true`  → la usuaria ha PLANEADO llevar esto ese día (recordatorio).
--   - `false` → ya lo llevó / lo está registrando como histórico.
--
-- Backfill: todos los registros existentes se asumen como ya llevados
-- (planned = false). Las nuevas filas creadas para fechas presentes o
-- futuras se marcarán como planned = true desde el cliente; las creadas
-- para fechas pasadas se quedarán como planned = false.
-- =====================================================================

alter table public.wears
  add column if not exists planned boolean default false not null;

create index if not exists wears_user_planned_today_idx
  on public.wears (user_id, wear_date, planned)
  where planned = true;
