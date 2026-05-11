import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { deleteImage } from '@/lib/images'
import type { Clothe, ClothesStatus } from '@/types/database'

export function useClothes(statuses: ClothesStatus[]) {
  return useQuery({
    queryKey: ['clothes', statuses],
    queryFn: async (): Promise<Clothe[]> => {
      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .in('status', statuses)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateClothe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Clothe> & { user_id: string; name: string }) => {
      const { data, error } = await supabase.from('clothes').insert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clothes'] }),
  })
}

export function useUpdateClothe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Clothe> & { id: string }) => {
      const { data, error } = await supabase.from('clothes').update(patch).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clothes'] }),
  })
}

export function useDeleteClothe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (clothe: Clothe) => {
      // Recoger todas las rutas en el bucket (cover + galería) y borrarlas
      const { data: imgs } = await supabase
        .from('clothe_images')
        .select('path')
        .eq('clothe_id', clothe.id)
      const paths = new Set<string>()
      if (clothe.image_path) paths.add(clothe.image_path)
      ;(imgs ?? []).forEach((r: { path: string | null }) => r.path && paths.add(r.path))
      for (const p of paths) await deleteImage(p)

      const { error } = await supabase.from('clothes').delete().eq('id', clothe.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clothes'] }),
  })
}

/** Cambia el estado de una prenda. Si pasa a 'vendida' marca sold_at; si vuelve atrás lo limpia. */
export function useChangeClothesStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ClothesStatus }) => {
      const patch: Partial<Clothe> = { status }
      if (status === 'vendida') patch.sold_at = new Date().toISOString()
      if (status === 'baul' || status === 'en_venta' || status === 'closet') patch.sold_at = null
      const { data, error } = await supabase.from('clothes').update(patch).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clothes'] }),
  })
}
