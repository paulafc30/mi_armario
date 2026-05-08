import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Outfit } from '@/types/database'

export interface OutfitWithItems extends Outfit {
  clothe_ids: string[]
}

export function useOutfits() {
  return useQuery({
    queryKey: ['outfits'],
    queryFn: async (): Promise<OutfitWithItems[]> => {
      const { data: outfits, error } = await supabase.from('outfits').select('*').order('created_at', { ascending: false })
      if (error) throw error
      const ids = (outfits ?? []).map((o) => o.id)
      if (ids.length === 0) return []
      const { data: items } = await supabase.from('outfit_items').select('*').in('outfit_id', ids)
      return (outfits ?? []).map((o) => ({
        ...o,
        clothe_ids: (items ?? []).filter((i) => i.outfit_id === o.id).map((i) => i.clothe_id),
      }))
    },
  })
}

export function useCreateOutfit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { user_id: string; name: string; clothe_ids: string[] }) => {
      const { data: outfit, error } = await supabase.from('outfits')
        .insert({ user_id: input.user_id, name: input.name }).select().single()
      if (error) throw error
      if (input.clothe_ids.length) {
        const rows = input.clothe_ids.map((cid) => ({ outfit_id: outfit.id, clothe_id: cid }))
        const { error: e2 } = await supabase.from('outfit_items').insert(rows)
        if (e2) throw e2
      }
      return outfit
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outfits'] }),
  })
}

export function useUpdateOutfit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; name?: string; clothe_ids?: string[] }) => {
      if (input.name) {
        const { error } = await supabase.from('outfits').update({ name: input.name }).eq('id', input.id)
        if (error) throw error
      }
      if (input.clothe_ids) {
        await supabase.from('outfit_items').delete().eq('outfit_id', input.id)
        if (input.clothe_ids.length) {
          const rows = input.clothe_ids.map((cid) => ({ outfit_id: input.id, clothe_id: cid }))
          await supabase.from('outfit_items').insert(rows)
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outfits'] }),
  })
}

export function useDeleteOutfit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('outfits').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outfits'] }),
  })
}
