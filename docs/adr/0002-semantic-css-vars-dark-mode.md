# ADR-0002: Modo oscuro vía CSS variables semánticas

**Estado:** aceptado
**Fecha:** 2026-05-09

## Contexto

Queremos modo oscuro completo. Tailwind ofrece dos enfoques principales:

1. **`dark:` variants en cada clase**: `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`.
2. **CSS variables semánticas** definidas en `:root` y `.dark`, expuestas como colores en `tailwind.config.js`.

Los componentes ya tenían decenas de `bg-white`, `text-gray-500`, `border-gray-200` desperdigados. Migrar a la opción 1 implicaría añadir variantes `dark:` por todos lados; cualquier nuevo componente tendría que recordar repetir el patrón.

## Decisión

Usamos **CSS variables semánticas** definidas en `src/index.css` y expuestas en `tailwind.config.js` como colores con `rgb(var(--c-X) / <alpha-value>)`.

Los tokens son:

```
--c-page        → fondo de la página
--c-surface     → fondo de tarjetas / inputs
--c-surface-soft→ fondo sutil (chips, filas)
--c-ink         → texto principal
--c-muted       → texto secundario
--c-line        → bordes
--c-line-soft   → bordes muy suaves
--c-brand-soft  → fondo coral suave
```

Los componentes usan clases semánticas (`bg-surface`, `text-ink`, `border-line`) que **se invierten solas** cuando se cambia el tema.

Las clases hardcoded `bg-gray-*`, `text-gray-*`, `border-gray-*` están **proscritas** en código nuevo. Se hizo una pasada de migración para eliminar las existentes (ver auditoría en `ROADMAP.md`).

La clase `.dark` se aplica al `<html>` desde `src/lib/theme.ts:applyTheme()`, que se llama en `src/main.tsx` **antes** del primer render para evitar parpadeo (FOUC).

## Alternativas consideradas

### `dark:` variants directos en Tailwind

Lo natural según la docs de Tailwind, pero:
- Cada componente nuevo debe acordarse de añadir variantes oscuras.
- Verbosidad: triplica las clases en cada elemento.
- Cuando un diseño evoluciona, hay que tocar `bg-white dark:bg-X dark:hover:bg-Y` en N sitios.

### Tema con styled-components o emotion

Permite tema robusto pero:
- Añade una dependencia grande (~30kb).
- Rompe la consistencia "todo es Tailwind".
- Mayor curva de adopción al editar código existente.

### Daisy UI / shadcn semantic colors

Inyectan sus propios tokens, pero traen más opiniones de las que queríamos (componentes pre-hechos que no encajan con el diseño coral custom).

## Consecuencias

### Positivas

- Componentes nuevos heredan modo oscuro **automáticamente** si usan los tokens.
- Una sola palanca para todo el tema: cambiar valores en `:root` y `.dark` propaga al instante.
- Conserva el espíritu Tailwind sin librerías extra.
- La paleta brand (coral) **no se invierte** porque vive fuera de los tokens semánticos.

### Negativas

- Hay una pequeña curva: hay que recordar usar `bg-surface` en lugar de `bg-white`. ESLint no lo enforce — depende de disciplina humana o de las reglas en `.cursorrules` para IAs.
- Las opacidades funcionan con la sintaxis `bg-surface/60` (cortesía de `<alpha-value>` en la definición), no `bg-white/60`. Las paletas de tooltips externos no lo entienden.
- Cuando hay que pintar acentos hardcoded por necesidad (e.g., bg ámbar para aviso), no participa de los tokens — hay que añadir variantes `dark:` manualmente para esos casos.

### Excepciones aceptadas

- Estados de color forzados (rojo destructivo, verde éxito, ámbar aviso) siguen usando `bg-red-50 dark:bg-red-500/10` etc. La paleta semántica no cubre estos casos porque su significado es semánticamente "rojo independientemente del tema".
- Los colores que la usuaria elige (color de categoría, color de prenda) son hex inline, no tokens.
