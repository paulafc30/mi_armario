import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Wear } from '@/types/database'

export interface WearWithRefs extends Wear {
  clothes: { id: string; name: string; image_url: string | null } | null
  outfits: { id: string; name: string; cover_image_url: string | null } | null
}

export function useWearsInRange(startISO: string, endISO: string) {
  return useQuery({
    queryKey: ['wears', startISO, endISO],
    queryFn: async (): Promise<WearWithRefs[]> => {
      const { data, error } = await supabase
        .from('wears')
        .select('*, clothes(id, name, image_url), outfits(id, name, cover_image_url)')
        .gte('wear_date', startISO)
        .lte('wear_date', endISO)
        .order('wear_date', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as WearWithRefs[]
    },
  })
}

export function useCreateWear() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      user_id: string
      wear_date: string
      clothe_id?: string | null
      outfit_id?: string | null
      notes?: string | null
    }) => {
      const { data, error } = await supabase
        .from('wears')
        .insert({
          user_id: input.user_id,
          wear_date: input.wear_date,
          clothe_id: input.clothe_id ?? null,
          outfit_id: input.outfit_id ?? null,
          notes: input.notes ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wears'] }),
  })
}

export function useDeleteWear() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('wears').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wears'] }),
  })
}
