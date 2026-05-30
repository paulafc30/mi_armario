# Code Style

Convenciones que aplico en el repo. No son religión, pero ayudan a que el código se sienta de la misma mano.

## Idioma

- **Comentarios y mensajes de error** en español. La aplicación es para una sola usuaria hispanohablante; los comentarios en inglés añaden fricción innecesaria.
- **Nombres de variables, funciones, archivos** en inglés cuando son técnicos (`useClothes`, `MultiImagePicker`, `compressImage`).
- Cuando una variable representa un concepto del dominio que **solo existe en español** (categoría, talla, prenda), respetamos el término original: `prendas`, `tallas`, `colores`.

## TypeScript

- `strict: true` siempre. No `any` salvo en las dos zonas marcadas como tales (parsing de respuestas externas de microlink, mutaciones de Supabase sin tipo Database).
- Tipos generados manualmente en `src/types/database.ts` para reflejar el esquema. No hemos generado tipos automáticos con `supabase gen types` para evitar el ruido de tipos `never`.
- Cliente Supabase sin generic: `createClient(...)` en lugar de `createClient<Database>(...)`. Cada `queryFn` declara explícitamente su tipo de retorno (`Promise<Clothe[]>`).
- Prefiero `interface` para shapes de datos y `type` para uniones, tipos derivados o aliases.

## React

- Solo functional components con hooks. Cero clases.
- Naming:
  - Componentes: `PascalCase` (`ClotheForm`, `MultiImagePicker`).
  - Hooks: `useCamelCase` (`useClothes`, `useTodayPlannedWears`).
  - Helpers: `camelCase` (`compressImage`, `generateDescription`).
  - Archivos: mismo case que el export default.
- Props anidados se desestructuran en la firma. Si hay más de 4-5 props, los listo con sus tipos en un objeto inline.
- Estado local con `useState`. `useReducer` solo si tres+ estados están acoplados (de momento no lo uso en el repo).
- Estado global mínimo. Solo Zustand para el query del buscador global (`store/search.ts`). Todo lo demás va por React Query.

## React Query

- Convenciones de `queryKey` listadas en [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- En mutaciones, `onSuccess: () => qc.invalidateQueries({ queryKey: [...] })`. No actualizo cache manualmente; prefiero el refetch.
- `staleTime` largo para datos que cambian poco (`useBrands`: 5 min; `useProfile`: 60s; `useWishlistFolders`: 60s).
- `refetchOnWindowFocus: true` para datos que sí dependen de actualidad (planeados de hoy).

## TailwindCSS

Reglas de oro:

1. **Usa siempre los tokens semánticos en lugar de paletas raw.** `bg-surface`, no `bg-white`. `text-ink`, no `text-gray-900`. `border-line`, no `border-gray-200`. Estos tokens se invierten solos en modo oscuro.

   | Concepto | Token semántico |
   |---|---|
   | Fondo de la página | `bg-page` |
   | Fondo de tarjeta | `bg-surface` |
   | Fondo sutil (chips, filas) | `bg-surface-soft` |
   | Glass con backdrop-blur | `card-glass` (utilidad custom) |
   | Texto principal | `text-ink` |
   | Texto secundario | `text-muted` |
   | Bordes | `border-line` o `border-line-soft` |
   | Acento brand suave | `bg-brand-soft` |

2. **Paleta brand fija**: `brand-50` → `brand-950` con pivote en `#FF5771` (coral rosado). No cambia entre claro y oscuro porque el brand es marca, no fondo.

3. **Estados destructivos**: rojo (red-600 / rose-700 / red-50). Nunca rosa brand para borrar.

4. **Estados positivos**: emerald-500/700 + bg-emerald-50. Para "marcar como llevado", "vendida", etc.

5. **Estados de aviso**: amber-500/800 + bg-amber-100. Para "lleva mucho tiempo en venta", "talla justa", etc.

6. **Sombras**: utilidades `shadow-soft`, `shadow-lift`, `shadow-glow` (custom con tinte coral). No `shadow-md` raw.

7. **Border radius**: `rounded-xl` (botones), `rounded-2xl` (cards, modales), `rounded-3xl` (hero, glass), `rounded-full` (chips circulares).

8. **Animaciones**: `animate-fade-in` (240ms) para entrada de elementos, `animate-scale-in` (200ms) para modales.

## Componentes utility

Existen clases custom en `index.css` que simplifican patrones repetidos. Usadlas en lugar de re-crearlas:

- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost`
- `.input`, `.label` (label usa uppercase + tracking-wide)
- `.card`, `.card-lift`, `.card-glass`
- `.chip`
- `.heading-xl`, `.heading-lg`, `.heading-md`
- `.nav-pill`
- `.divider`
- `.no-scrollbar`, `.safe-top`, `.safe-bottom`

## Confirmaciones

Cero `window.confirm` nativos. Siempre vía `useConfirm()`:

```tsx
const confirm = useConfirm()
async function handleDelete() {
  const ok = await confirm({
    title: 'Eliminar prenda',
    message: 'No se puede deshacer.',
    confirmText: 'Eliminar',
    destructive: true,
  })
  if (!ok) return
  // …
}
```

Razón → [`adr/0003-custom-confirm-modal.md`](./adr/0003-custom-confirm-modal.md).

## Subida de imágenes

Nunca llames a `supabase.storage` directamente. Usa los helpers de `src/lib/images.ts`:

```ts
import { uploadImage, deleteImage, uploadAvatar, deleteAvatar } from '@/lib/images'

const { url, path } = await uploadImage(file, userId)  // → bucket clothes-images
await deleteImage(path)
```

Antes de subir, comprime con `compressImage(file)` desde `src/lib/imageCompression.ts`. El `MultiImagePicker` ya lo hace solo.

## Imports

Orden:

1. React y librerías (`useEffect`, `clsx`, `lucide-react`).
2. Imports absolutos con alias `@/` (`@/components/...`, `@/hooks/...`, `@/lib/...`).
3. Tipos (`import type { Clothe } from '@/types/database'`).

Una línea en blanco entre grupos. El alias `@/` apunta a `src/`.

## Comentarios

- **Explica el porqué, no el qué.** El código ya dice qué hace; los comentarios añaden valor cuando explican una restricción, una decisión o un trade-off.
- Si una decisión es lo bastante importante, su sitio es un ADR, no un comentario inline.

✅ Bueno:

```ts
// Reintentamos sin sold_at/listed_at si fallan: pueden no existir
// todavía si la usuaria no ha corrido la migración 0008.
```

❌ Malo:

```ts
// Filtra el array por status
return list.filter(c => c.status === 'closet')
```

Para funciones públicas de `lib/`, JSDoc completo:

```ts
/**
 * Genera una descripción cercana y amigable para anuncio de venta.
 *
 * Detecta género y número español para concordancia correcta y elige
 * aleatoriamente entre variantes para que "Regenerar" dé otra redacción.
 */
export function generateDescription(clothe: Clothe, category?: Category): string {
  …
}
```

## Manejo de errores

- **Nunca silenciar.** Si una mutación de Supabase falla, surface al usuario via toast o inline. Nunca `mutate()` sin error handling para acciones críticas.
- **Mutaciones críticas usan `await mutateAsync` + try/catch** para que el usuario vea el error. `mutate()` (fire-and-forget) solo para acciones reversibles tipo toggle.
- **Mensajes de error en español** y orientados a acción ("No se pudo subir la foto. Comprueba conexión.").
- **Console.error** para errores que la usuaria no necesita ver pero el desarrollador sí (e.g., reintentos automáticos).

## Migraciones SQL

- Numeradas `0001_descripcion.sql` ... `0014_descripcion.sql`.
- **Siempre idempotentes**: `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS` antes de crear.
- Si se cambian datos existentes, usar `WHERE` que detecte si ya está aplicado (e.g., `WHERE colors IS NULL OR array_length(colors, 1) IS NULL`).
- Cada tabla nueva añade los 3 GRANTs explícitos al final (anon SELECT, authenticated CRUD, service_role ALL). Razón → [`adr/0005-explicit-grants-for-supabase.md`](./adr/0005-explicit-grants-for-supabase.md).

## Tests

- Vitest sobre `src/lib/__tests__/` para funciones puras.
- Cobertura actual: `bodyType`, `sizeFit`, `description`.
- No testeamos componentes UI ni hooks de React Query (con mocks de Supabase) — fricción alta vs valor. Si en algún momento crece la complejidad, lo replanteamos.

## Lo que NO hacemos

- ❌ No usamos shadcn/ui ni Material UI. UI custom con Tailwind directo + lucide-react para iconos.
- ❌ No usamos clsx ni classnames. Helper propio `cx()` en `lib/utils.ts`.
- ❌ No usamos formik ni react-hook-form. Forms controlados con `useState` (los formularios son pequeños).
- ❌ No usamos i18n. App en español, una sola usuaria.
- ❌ No usamos lodash. JS moderno es suficiente.
- ❌ No usamos un state manager global más allá de Zustand para una cosa. Todo lo demás → React Query.
