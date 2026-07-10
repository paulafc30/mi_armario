import { create } from 'zustand'

export interface SearchFilters {
  colors: string[]
  sizes: string[]
  materials: string[]
  brands: string[]
}

const EMPTY_FILTERS: SearchFilters = {
  colors: [],
  sizes: [],
  materials: [],
  brands: [],
}

interface SearchState {
  query: string
  setQuery: (q: string) => void
  filtersOpen: boolean
  setFiltersOpen: (open: boolean) => void
  filters: SearchFilters
  toggleFilter: (key: keyof SearchFilters, value: string) => void
  clearFilters: () => void
  hasFilters: boolean
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  setQuery: (query) => set({ query }),

  filtersOpen: false,
  setFiltersOpen: (filtersOpen) => set({ filtersOpen }),

  filters: EMPTY_FILTERS,
  toggleFilter: (key, value) => {
    const current = get().filters[key]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    const filters = { ...get().filters, [key]: next }
    const hasFilters = Object.values(filters).some((arr) => arr.length > 0)
    set({ filters, hasFilters })
  },
  clearFilters: () => set({ filters: EMPTY_FILTERS, hasFilters: false }),
  hasFilters: false,
}))
