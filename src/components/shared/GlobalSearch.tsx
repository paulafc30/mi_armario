import { SlidersHorizontal, Search, X } from 'lucide-react'
import { useSearchStore } from '@/store/search'
import { cx } from '@/lib/utils'

export default function GlobalSearch() {
  const { query, setQuery, filtersOpen, setFiltersOpen, hasFilters, clearFilters } = useSearchStore()

  return (
    <div className="relative w-full flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/70" />
        <input
          type="text"
          placeholder="Buscar en mi armario…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pl-9 pr-9 w-full"
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

      <button
        onClick={() => setFiltersOpen(!filtersOpen)}
        className={cx(
          'relative shrink-0 p-2 rounded-xl border transition',
          filtersOpen || hasFilters
            ? 'bg-brand-gradient text-white border-transparent shadow-lift'
            : 'bg-surface-soft border-line text-muted hover:text-ink',
        )}
        aria-label="Filtros"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {hasFilters && !filtersOpen && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-500 border-2 border-page" />
        )}
      </button>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="shrink-0 text-xs text-muted hover:text-ink underline whitespace-nowrap"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
