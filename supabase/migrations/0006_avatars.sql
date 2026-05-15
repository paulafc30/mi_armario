-- =====================================================================
-- Mi Armario - 0006: Foto de perfil del usuario
-- =====================================================================
-- - Añade `avatar_path` a profiles (para borrar el archivo previo al
--   reemplazarlo).
-- - Crea el bucket `avatars` con políticas: cualquiera puede leer las
--   fotos (son públicas, como un avatar), pero solo la dueña puede
--   subir/actualizar/borrar las suyas.
-- =====================================================================

alter table public.profiles add column if not exists avatar_path text;

insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

drop policy if exists "avatars select" on storage.objects;
create policy "avatars select" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars insert own" on storage.objects;
create policy "avatars insert own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
