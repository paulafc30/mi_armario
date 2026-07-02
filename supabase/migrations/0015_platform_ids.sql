-- Añade vinted_id y wallapop_id a clothes para sync sin duplicados
ALTER TABLE public.clothes
  ADD COLUMN IF NOT EXISTS vinted_id  text,
  ADD COLUMN IF NOT EXISTS wallapop_id text;

-- Índices únicos por usuario (sin WHERE: PostgreSQL trata NULL como distinto entre sí,
-- por lo que filas sin vinted_id no colisionan y ON CONFLICT funciona con el cliente JS)
CREATE UNIQUE INDEX IF NOT EXISTS clothes_vinted_id_user_idx
  ON public.clothes (user_id, vinted_id);

CREATE UNIQUE INDEX IF NOT EXISTS clothes_wallapop_id_user_idx
  ON public.clothes (user_id, wallapop_id);

-- GRANTs (patrón del proyecto)
GRANT ALL ON public.clothes TO anon, authenticated, service_role;
