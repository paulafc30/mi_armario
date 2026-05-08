import { supabase, STORAGE_BUCKET } from './supabase'

/** Sube un File al bucket clothes-images bajo <user_id>/<uuid>-<name> y devuelve la URL pública y el path. */
export async function uploadImage(file: File, userId: string): Promise<{ url: string; path: string }> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${crypto.randomUUID()}.${ext}`
  const path = `${userId}/${fileName}`

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

/** Borra un objeto del bucket si existe. */
export async function deleteImage(path: string | null | undefined) {
  if (!path) return
  await supabase.storage.from(STORAGE_BUCKET).remove([path])
}
