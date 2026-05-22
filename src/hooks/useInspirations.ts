import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Inspiration, InspirationKind } from '@/types/database'

export function useInspirations(kind?: InspirationKind) {
  return useQuery({
    queryKey: ['inspirations', kind ?? 'all'],
    queryFn: async (): Promise<Inspiration[]> => {
      let q = supabase
        .from('inspirations')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })
      if (kind) q = q.eq('kind', kind)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Inspiration[]
    },
  })
}

export function useCreateInspiration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<Inspiration, 'id' | 'created_at' | 'position'> & { position?: number }) => {
      const { data, error } = await supabase
        .from('inspirations')
        .insert({ ...input, position: input.position ?? 0 })
        .select()
        .single()
      if (error) throw error
      return data as Inspiration
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspirations'] }),
  })
}

export function useUpdateInspiration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Inspiration> & { id: string }) => {
      const { data, error } = await supabase
        .from('inspirations')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Inspiration
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspirations'] }),
  })
}

export function useDeleteInspiration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inspirations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspirations'] }),
  })
}

/** Detecta si una URL parece de Pinterest. */
export function isPinterestUrl(url: string): boolean {
  return /(^|\.)pinterest\.[a-z.]+/i.test(url) || /(^|\.)pin\.it\b/i.test(url)
}
