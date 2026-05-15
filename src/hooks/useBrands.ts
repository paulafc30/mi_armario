import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/** Devuelve la lista de marcas distintas que la usuaria ya ha introducido. */
export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('clothes')
        .select('brand')
        .not('brand', 'is', null)
      if (error) throw error
      const set = new Set<string>()
      for (const row of (data ?? []) as { brand: string | null }[]) {
        const b = row.brand?.trim()
        if (b) set.add(b)
      }
      return [...set].sort((a, b) => a.localeCompare(b, 'es'))
    },
    // Las marcas no cambian muy a menudo
    staleTime: 5 * 60_000,
  })
}
