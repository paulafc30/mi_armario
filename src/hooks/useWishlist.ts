import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { WishlistItem } from '@/types/database'

/**
 * Lee items de la wishlist. Si se pasa `folderId`, filtra por esa lista;
 * si se pasa `null`/undefined, devuelve todos los items de la usuaria.
 */
export function useWishlist(folderId?: string | null) {
  return useQuery({
    queryKey: ['wishlist', folderId ?? 'all'],
    queryFn: async (): Promise<WishlistItem[]> => {
      let q = supabase.from('wishlist').select('*').order('created_at', { ascending: false })
      if (folderId) q = q.eq('wishlist_id', folderId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as WishlistItem[]
    },
  })
}

export function useCreateWishlistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<WishlistItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('wishlist').insert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

export function useUpdateWishlistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<WishlistItem> & { id: string }) => {
      const { data, error } = await supabase.from('wishlist').update(patch).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

export function useDeleteWishlistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('wishlist').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}
