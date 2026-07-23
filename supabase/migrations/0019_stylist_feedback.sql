-- Guarda las valoraciones de las recomendaciones de Ada.
-- Cada fila = una respuesta valorada (positiva o negativa) con las prendas sugeridas.
create table if not exists public.stylist_feedback (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  reply_text  text        not null,
  clothe_ids  text[]      not null default '{}',
  rating      text        not null check (rating in ('positive', 'negative')),
  occasion    text,                        -- resumen de la ocasion para recuperacion semantica
  created_at  timestamptz not null default now()
);

alter table public.stylist_feedback enable row level security;

create policy "Usuarios gestionan su propio feedback"
  on public.stylist_feedback for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indice para recuperar feedback reciente por usuario rapidamente
create index if not exists stylist_feedback_user_created
  on public.stylist_feedback (user_id, created_at desc);
