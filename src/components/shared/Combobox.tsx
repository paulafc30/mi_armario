import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'
import { cx } from '@/lib/utils'

interface ComboboxProps {
  value: string
  onChange: (v: string) => void
  suggestions: string[]
  placeholder?: string
  /** Permite teclear valores fuera de las sugerencias. true por defecto. */
  allowCustom?: boolean
  /** Texto a mostrar cuando no hay coincidencias. */
  emptyLabel?: string
  id?: string
}

/**
 * Input con desplegable de sugerencias y filtrado en vivo.
 *  - Sirve como "select" cuando se le pasan opciones cerradas (tallas, materiales).
 *  - Sirve como combobox dinámico cuando las sugerencias vienen de la BD (marcas).
 *  - Si `allowCustom` está activo, el usuario puede teclear cualquier texto libre.
 */
export default function Combobox({
  value,
  onChange,
  suggestions,
  placeholder,
  allowCustom = true,
  emptyLabel,
  id,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincronizar el query interno con cambios externos del value
  useEffect(() => { setQuery(value) }, [value])

  // Cerrar el dropdown al hacer click fuera
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? suggestions.filter((s) => s.toLowerCase().includes(q))
    : suggestions

  function selectOption(option: string) {
    onChange(option)
    setQuery(option)
    setOpen(false)
    inputRef.current?.blur()
  }

  function clear() {
    onChange('')
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && open) {
      e.preventDefault()
      if (filtered.length > 0) selectOption(filtered[0])
      else if (allowCustom) { onChange(query); setOpen(false) }
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown' && !open) {
      setOpen(true)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (allowCustom) onChange(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input pr-16"
          autoComplete="off"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
          {query && (
            <button
              type="button"
              onClick={clear}
              className="p-1 rounded hover:bg-surface-soft text-muted"
              tabIndex={-1}
              aria-label="Limpiar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => { setOpen((o) => !o); inputRef.current?.focus() }}
            className="p-1 rounded hover:bg-surface-soft text-muted"
            tabIndex={-1}
            aria-label="Mostrar opciones"
          >
            <ChevronDown className={cx('w-4 h-4 transition', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      {open && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-surface border border-line rounded-xl shadow-lift max-h-60 overflow-y-auto z-20 animate-fade-in">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">
              {emptyLabel ?? (allowCustom
                ? `Sin coincidencias — se guardará "${query}"`
                : 'Sin coincidencias')}
            </li>
          ) : (
            filtered.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => selectOption(option)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surface-soft flex items-center justify-between"
                >
                  <span>{option}</span>
                  {value === option && <Check className="w-4 h-4 text-brand-600 shrink-0 ml-2" />}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
