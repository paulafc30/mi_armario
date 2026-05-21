import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { WishlistFolder } from '@/types/database'

export function useWishlistFolders() {
  return useQuery({
    queryKey: ['wishlist-folders'],
    queryFn: async (): Promise<WishlistFolder[]> => {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as WishlistFolder[]
    },
    staleTime: 60_000,
  })
}

export function useCreateWishlistFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { user_id: string; name: string; color?: string }) => {
      const { data, error } = await supabase
        .from('wishlists')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data as WishlistFolder
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist-folders'] }),
  })
}

export function useUpdateWishlistFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<WishlistFolder> & { id: string }) => {
      const { data, error } = await supabase
        .from('wishlists')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as WishlistFolder
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist-folders'] }),
  })
}

export function useDeleteWishlistFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // CASCADE en la BD se encarga de borrar también los items
      const { error } = await supabase.from('wishlists').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist-folders'] })
      qc.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}
