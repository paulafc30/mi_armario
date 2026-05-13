import { Search, X } from 'lucide-react'
import { useSearchStore } from '@/store/search'

export default function GlobalSearch() {
  const { query, setQuery } = useSearchStore()
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/70" />
      <input
        type="search"
        placeholder="Buscar en mi armario…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input pl-9 pr-9"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface-soft text-muted"
          aria-label="Limpiar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
