# Mi Armario — Roadmap y notas

> Documento vivo. Aquí queda registrado **todo** lo que se ha construido,
> lo que está en curso, lo que está pendiente y las ideas para el futuro.
> Sirve como memoria del proyecto: si en cualquier momento se interrumpe
> la conversación, este archivo permite retomar exactamente donde se dejó.

Última actualización: 2026-05-15

---

## 0. Stack y arquitectura

- **Frontend:** Vite + React + TypeScript + TailwindCSS + Zustand + React Query + React Router + lucide-react.
- **Backend:** Supabase (Auth + PostgreSQL + Storage).
- **Despliegue:** Vercel (frontend) + Supabase managed (backend).
- **PWA:** manifest + service worker, instalable en iOS y Android.
- **Localhost:** puerto **5174**.

Estructura del repo:
```
src/
  ├── components/   (armario, venta, wishlist, calendario, profile, shared, auth)
  ├── hooks/        (useAuth, useClothes, useCategories, useOutfits, useWears, useWishlist)
  ├── lib/          (supabase, images, imageCompression, description, calendar, theme, utils)
  ├── pages/        (Login, Register, ForgotPassword, ResetPassword, Profile, Armario, Venta, Wishlist)
  ├── store/        (search)
  └── types/        (database)
supabase/migrations/
  ├── 0001_initial_schema.sql   (tablas base + RLS + bucket clothes-images)
  ├── 0002_extra_fields.sql     (brand, size, color en clothes)
  ├── 0003_clothe_images.sql    (tabla clothe_images + trigger portada)
  ├── 0004_wears.sql            (calendario)
  ├── 0005_grants.sql           (GRANTs explícitos)
  └── 0006_avatars.sql          (avatar_path + bucket avatars)
```

---

## 1. Implementado ✅

### 1.1 Auth y perfil
- Registro y login con email + contraseña.
- Recuperación de contraseña por email.
- ProtectedRoute → la app entera detrás de sesión.
- Página de Perfil rediseñada estilo Ajustes de iOS:
  - Avatar con upload (comprimido 480px, JPEG 0.85).
  - Filas tipo lista (Nombre, Email, Contraseña) con modales para editar.
  - Toggle Apariencia (Claro / Oscuro / Sistema).
  - Sección Acerca de.
  - Cerrar sesión como fila destructiva.
  - Quitar foto de perfil cuando existe.
- Persistencia del tema en localStorage; aplicación pre-render para evitar flash.

### 1.2 Mi Armario
- CRUD de prendas con: nombre, categoría, marca, talla, color (paleta visual), notas, etiquetas, precio.
- **MultiImagePicker** con galería de varias fotos:
  - Drag & drop.
  - Selección múltiple.
  - Botón ⭐ para cambiar portada.
  - Subir desde dispositivo o pegar URL.
  - Compresión automática (1600px máx, JPEG 0.82, salta si <400 KB).
- **ImageCarousel** en el detalle de la prenda (puntos, flechas, miniaturas).
- Trigger en BD que mantiene `clothes.image_url` sincronizado con la primera imagen.
- Categorías editables (CRUD) con colores personalizables.
- Categorías por defecto al registrarse (Camisetas, Pantalones, Vestidos, Zapatos, Accesorios, Abrigos).
- Outfits: colecciones de prendas con previsualización en mosaico.
- Búsqueda global filtrando por nombre, marca, color, talla, etiquetas, categoría.

### 1.3 Ropa a la Venta
- Cuatro estados con flujo progresivo: **Baúl → En Venta → Vendida → Archivada**.
- Botones para avanzar/retroceder estado en cada card.
- Toggles **Wallapop** y **Vinted** con iconos oficiales (Simple Icons CDN, con fallback).
- Generador de descripciones automáticas (`lib/description.ts`):
  - Concordancia de género (fem/masc) y número (singular/plural).
  - Evita redundancia "color X" si ya está en el nombre.
  - 4 aperturas + 5 condiciones + 6 cierres por género/número → >100 variantes.
  - Versión Wallapop (larga, narrativa) y Vinted (corta con hashtags).
  - Botón "Regenerar" para nueva redacción.
  - Botón "Copiar" al portapapeles.

### 1.4 Lista de Deseos
- CRUD de items.
- Preview automático de URL (título + imagen) usando microlink.io.
- Mostrar nombre, precio, imagen, enlace clicable a la tienda.

### 1.5 Calendario
- Pestaña dentro de Mi Armario.
- Vista mensual (grid 7x6 empezando en lunes).
- Cada día muestra mini-thumbnails de lo que se llevó.
- Modal de detalle al tocar un día: lista de wears con miniatura, badge (prenda/outfit), botón eliminar.
- Añadir prenda u outfit a un día con buscador.
- Stats del mes activo: looks totales, días registrados, % cobertura, prenda top, outfit top.

### 1.6 Estética (paleta coral cálida)
- Paleta brand: coral cálido tirando a rojo (#fff3f0 → #400d08).
- Tokens semánticos via CSS variables → modo oscuro completo.
- Glass nav (header + bottom nav flotante con backdrop-blur).
- Hero gradient en pantallas de auth.
- Inter font desde Google Fonts.
- Sombras suaves con tinte coral.
- Animaciones sutiles (fade-in, scale-in).

### 1.7 Multi-color por prenda (hasta 3)
- Migración `0011_multi_color.sql` añade columna `colors text[]` y hace backfill desde el antiguo `color`.
- Type `Clothe.colors: string[]`; `color` queda como deprecated por backward compat.
- `ColorPicker` reescrito como **multi-select** con prop `max` (default 3): muestra un ✓ en cada color elegido, hace ring brand alrededor, deshabilita el resto cuando se alcanza el límite y muestra contador "X / 3".
- `ClotheForm` mantiene state como `colors[]`, alimenta también el campo legacy `color` con el primero para que nada se rompa.
- `ClotheDetail` itera los colores y pinta un chip por cada uno con su dot.
- `lib/description.ts` junta los colores con conjunción natural:
  - 1 color: "en blanco"
  - 2: "en blanco y negro"
  - 3: "en blanco, negro y gris"
- Filtra los colores ya presentes en el nombre (sigue evitando "camiseta blanca en blanco").
- Hashtags Vinted: uno por color (#blanco #negro #gris).
- Búsqueda global en Armario y Venta busca dentro del array de colores además del legacy.
- Tests actualizados con 2 casos extra (dos colores con "y", tres con comas y "y" final).

### 1.8 Medidas corporales + fit check
- **Migración `0009_measurements.sql`** añade a `profiles`: height_cm, bust_cm, waist_cm, hips_cm, shoulder_cm, weight_kg, top_size, bottom_size, shoe_size.
- **`lib/bodyType.ts`** calcula la silueta a partir de pecho/cintura/cadera. 5 tipos: reloj de arena, pera, triángulo invertido, rectángulo, manzana. Cada uno con descripción y 3-4 tips de moda.
- **`lib/sizeFit.ts`** tabla genérica europea XS-XXXL ↔ medidas en cm. Función `checkFit()` devuelve 5 verdicts: encaja / justa / holgada / pequeña / grande.
- **`MeasurementsModal`** con inputs para las medidas y preview en vivo del tipo de silueta calculado mientras escribes.
- **`BodyTypeCard`** en Perfil: muestra el tipo, descripción y tips o invita a hacer el test si aún no.
- **Chip de fit en `ClotheDetail`**: cuando hay medidas + talla de la prenda, sale una franja en verde/ámbar/rojo con el veredicto.
- **`useProfile` / `useUpdateProfile`** centralizan el acceso al perfil completo con cache via React Query.

### 1.9 Interacción y feedback
- **Modales de confirmación personalizados** (`src/components/shared/ConfirmModal.tsx`):
  - Sistema basado en promesas: `const confirm = useConfirm(); const ok = await confirm({ … })`.
  - `ConfirmProvider` montado en `main.tsx` envuelve toda la app.
  - Soporta título, mensaje multilínea, texto custom para Confirmar/Cancelar y modo destructivo (botón rojo + foco en Cancelar para evitar accidentes).
  - Sustituye al `window.confirm` nativo en TODOS los puntos: borrar prenda, borrar outfit, borrar categoría, borrar wishlist item, quitar foto de perfil, cerrar sesión, mover a Venta.
  - Z-index 40 → aparece sobre cualquier otro modal abierto.
- Toasts auto-desaparecibles (en perfil): operaciones rápidas con feedback no bloqueante.
- Loading states en formularios y botones críticos.

### 1.10 Infra y seguridad
- Row Level Security en todas las tablas.
- GRANTs explícitos (preparado para el cambio de Supabase del 30-oct-2026).
- Bucket `clothes-images` con políticas por carpeta de usuario.
- Bucket `avatars` con políticas por carpeta de usuario.
- PWA instalable: manifest, service worker v2, iconos PNG (192/512/maskable/apple-touch).
- vercel.json con rewrites para SPA routing.

---

## 2. En curso / pendiente inmediato 🔧

### 2.1 Auditoría visual de paleta ✅
- Hecho. Grep limpio: no quedan hex morados ni clases `purple/violet` en el código. Las únicas referencias al morado son intencionales (opción de color "Morado" para prendas y opción `#8b5cf6` en la paleta de colores de categorías). La paleta por defecto de categorías ahora arranca con coral.
- Si se sigue viendo morado, es cache de PWA / navegador → desinstalar la PWA o `Ctrl+Shift+R`.

### 2.2 Reorganizar acciones del ClotheDetail ✅
- "Descripción" ya **no aparece en el detalle**; vive dentro del formulario de edición (próximo a Notas, link `Generar ficha`).
- "Editar" es ahora la acción primaria full-width.
- "Mover a la sección de Venta" se ha movido a una línea de texto pequeña en gris debajo de un separador, con confirmación nativa antes de aplicar el cambio.

### 2.3 Tipos de descripción ✅
- Nueva función `generateProductDescription` en `src/lib/description.ts` que produce ficha catalográfica neutra (sin "¡Vendo!", sin precio, sin cierre amable).
- `DescriptionModal` acepta `mode='product' | 'sale'`.
- En armario: `mode='product'` (título "Ficha del producto", sin tabs).
- En venta: `mode='sale'` (mantiene tabs Wallapop/Vinted como antes).

### 2.4 Selectores en vez de input libre ✅
- Componente genérico **Combobox** (`src/components/shared/Combobox.tsx`) con desplegable, filtro en vivo, navegación con teclado y opción "libre" (acepta valores fuera de las sugerencias).
- **Talla**: usa `SIZE_OPTIONS` (XS…XXXL + 32-50 + Única) de `src/lib/options.ts`.
- **Material**: usa `MATERIAL_OPTIONS` con composiciones comunes.
- **Marca**: combobox alimentado por el hook `useBrands` que devuelve la lista distinta de marcas ya guardadas en BD → autocompletado consistente.
- Migración `0007_material.sql` añade columna `material` a `clothes`.
- El campo material se incorpora a la ficha de producto y a la descripción de venta como línea "Composición: …".

---

## 3. Funcionalidades planeadas 📦

### 3.6 Compartir desde Wallapop / Vinted al armario ✅
- Detección automática de plataforma según el dominio (`wallapop.*` o `vinted.*`).
- Parser de texto compartido: extrae el título de las comillas tipográficas (Wallapop manda `Vendo "TITULO" en Wallapop`, Vinted patrones similares).
- `fetchUrlPreview()` ampliado para devolver también descripción y precio cuando el listing lo expone vía `og:price:amount`, o parseando "N €" del título/descripción como fallback.
- `ClothePrefill` extendido con `price`, `platform`, `forceStatus`.
- `ClotheForm` al abrir desde share:
  - Banner coral arriba: "Datos extraídos de Wallapop/Vinted. Revisa el precio y rellena talla, color y composición si faltan."
  - Notes → descripción del listado.
  - Price → precio detectado.
  - Imagen → og:image.
  - On guardar: `on_wallapop=true` o `on_vinted=true` según la plataforma + status `'en_venta'` (ya está publicada).
- Página `Venta` cambia automáticamente a la pestaña *En Venta* cuando el share viene de una plataforma reconocida.
- Honesto: talla y composición no se extraen porque ninguna de las dos plataformas las expone en metadatos estructurados — se completan a mano.

### 3.1 Web Share Target ✅
- Manifest extendido con `share_target` (GET con title/text/url).
- Página `/share` con chooser entre armario / venta / wishlist.
- `src/lib/sharedItem.ts` para pasar el payload entre la pantalla de share y la página destino vía sessionStorage.
- `ClotheForm` y `WishlistForm` aceptan `prefill` y abren el formulario pre-rellenado.
- En wishlist, además, se dispara automáticamente la vista previa de microlink.io con el enlace.
- Si la URL compartida parece una imagen, se usa directamente como primera foto de la prenda.
- Se bumpó cache del SW a `mi-armario-v3` para forzar refresco del manifest.

### 3.2 Tracker de días en venta ✅
- Migración `0008_listed_at.sql` añade columna `listed_at` a `clothes`.
- `useChangeClothesStatus` sincroniza el timestamp:
  - pasar a *en_venta* → `listed_at = now()`
  - pasar a *baul/closet* → `listed_at = null`
  - pasar a *vendida/archivada* → se conserva (historial)
- Componente `DaysListedBadge` muestra "Publicada hoy/ayer/hace N días" en cada SaleCard en estado *en_venta*.
- Si pasa de 30 días → cambia a fondo ámbar con icono de aviso (sugerencia visual de bajar precio o retirar).

### 3.3 Stats de ventas
- Sección de dashboard: cuánto has ganado, cuánto invertiste, neto recuperado.
- Prenda mejor vendida (mayor margen).
- Plataforma más eficaz (Wallapop vs Vinted).
- Necesita: campo `purchase_price` opcional en `clothes`, fecha de venta ya guardada.

### 3.4 Drag-reorder de fotos ✅
- HTML5 drag-and-drop entre miniaturas en `MultiImagePicker`.
- Convive con el drop de archivos externos: se diferencia inspeccionando `dataTransfer.types` (`'Files'` vs reorder interno).
- Estados visuales: tile arrastrado al 40% opacity, tile destino con ring brand al hacer hover.
- Indicador `GripVertical` aparece al hacer hover para sugerir que es arrastrable.
- En móvil sigue funcionando el botón de estrella para promover a portada (HTML5 drag tiene poco soporte táctil).

### 3.5 Stats avanzadas del calendario
- "Prenda no usada en los últimos X días" → sugerencia para mover a Baúl/Venta.
- Histograma de looks por mes.
- Calor por día de la semana (qué día te arreglas más).

---

## 4. Backlog / ideas futuras 💡

### 4.0 Sincronización con Vinted y Wallapop
- Botón "Sincronizar" en la sección Venta que importa automáticamente las prendas publicadas.
- **Arquitectura**: Supabase Edge Function como proxy (evita CORS y bloqueos de IP de CDN).
  - Acepta perfil URL + cookies de sesión del usuario en Vinted/Wallapop.
  - Descarga imágenes server-side y las re-sube al bucket `clothes-images`.
  - Upsert en `clothes` comparando por `vinted_id` / `wallapop_id` para evitar duplicados.
- **Schema pendiente**: añadir columnas `vinted_id text` y `wallapop_id text` a `clothes`.
- **Por qué Edge Function**: las imágenes de Vinted requieren firma (`?s=...`) y bloquean por IP toda descarga fuera de su CDN allowlist. Desde el navegador, CORS impide fetch(). Solo un proxy server-side lo resuelve.
- De momento: las prendas se importan manualmente (datos sí, imágenes se añaden a mano).

### 4.1 Escáner inteligente de prendas con IA
- **Requiere API de pago (Claude Vision, Google Gemini, OpenAI).**
- Foto de la prenda o de la etiqueta → IA identifica:
  - Tipo de prenda + categoría sugerida.
  - Marca (si la etiqueta es legible).
  - Composición del tejido.
  - Instrucciones de lavado.
- Rellena automáticamente el formulario al añadir prenda.
- Aplazado mientras no haya presupuesto recurrente.

### 4.2 Compartir outfit como imagen ✅
- **`lib/outfitCollage.ts`** dibuja un PNG 1080×1080 en canvas client-side:
  - Grid automático según número de prendas (1→1×1, 2→2×1, 3→3×1, 4→2×2, 5-6→3×2, 7-9→3×3, cap a 9).
  - Esquinas redondeadas (28px), object-fit cover, gap de 14px entre celdas.
  - Título del outfit en negrita Inter 44px en la parte superior.
  - Fondo crema-rosa que case con la paleta.
  - `crossorigin="anonymous"` para evitar canvas tainting; placeholder si una imagen falla.
- **`shareOrDownloadBlob`** intenta `navigator.share({ files })` y cae a descarga si no está soportado o el usuario cancela.
- **`ShareOutfitModal`** muestra el preview generado y dos botones (Descargar / Compartir).
- Acceso desde `OutfitForm` con botón "Compartir como imagen" en la cabecera de la sección Prendas, deshabilitado hasta tener nombre + al menos una prenda.
- Funciona sin guardar el outfit: usa los datos actuales del formulario, así puedes compartir antes de confirmar.

### 4.3 Notificaciones push
- Recordatorios programados ("¿qué llevaste hoy?", "revisa tu armario").
- Avisos de prendas en venta sin movimiento.

### 4.4 Exportar todo el armario
- Botón en Perfil → genera CSV/JSON con todas las prendas, outfits, wears.
- Útil para backup personal o migración.

### 4.8 Sección Inspiración (Pinterest + Tiendas) ✅
- **Migración `0013_inspirations.sql`**: tabla `inspirations` con `kind` ('pinterest' | 'store'), título, url, imagen, posición + RLS + GRANTs.
- **Hook `useInspirations`** + CRUD (create/update/delete) y helper `isPinterestUrl`.
- **Nueva página `/inspiracion`** con dos secciones: "Pinterest" (boards y perfiles) y "Tiendas favoritas" (atajos a páginas de novedades).
- **`InspirationForm`** modal con segmented Pinterest/Tienda, input de URL, botón ✨ para autorellenar título+imagen vía microlink, edición y borrado con confirm destructivo.
- **5ª pestaña "Ideas"** en el bottom nav (icono Lightbulb) — `grid-cols-5` en móvil, `min-w-[56px]` por celda para que entre todo.
- Cero scraping y cero API externa: tap en cualquier card abre la URL en pestaña nueva. Combinado con el Web Share Target, si compartes desde Pinterest/Zara cuando estás navegando, va a la wishlist automáticamente.

### 4.5 Reconocimiento automático de color ✅
- **`lib/colorExtraction.ts`** sin dependencias externas:
  - Dibuja la imagen en un canvas 64×64.
  - Considera solo el rectángulo central (60%) para evitar fondos/marcos.
  - Bucketea píxeles en 8×8×8 cubos RGB, ignora cuasi-blancos y cuasi-negros (fondos).
  - Coge el bucket más poblado y promedia → color dominante.
  - Mapea al color más cercano de la paleta `CLOTHING_COLORS` usando distancia redmean (aproximación perceptual barata sin LAB).
- **Sugerencia inline en `ClotheForm`**: cuando se añade/cambia la primera imagen y la usuaria no ha elegido color manualmente, sale un banner coral debajo del ColorPicker tipo *"Tu foto parece ● Verde — Usar"*.
  - Botón "Usar" rellena automáticamente.
  - Botón X la descarta sin aplicar.
  - Si la usuaria ya pickeó un color a mano, no aparece.
- Maneja silenciosamente errores de CORS, canvas tainting, imágenes vacías, etc.

### 4.6 Múltiples wishlist ✅
- **Migración `0010_wishlist_folders.sql`**:
  - Nueva tabla `wishlists` (las listas/carpetas) con `name`, `color`, RLS y GRANTs.
  - Lista "Mis deseos" por defecto al registrarse (trigger sobre `profiles`) y backfill para usuarias existentes.
  - Columna `wishlist_id` añadida a la tabla `wishlist` (los items) con backfill a la primera lista del usuario.
- **`useWishlistFolders`** (nuevo) + `useWishlist(folderId?)` ahora filtra por lista.
- **`WishlistFoldersManager`**: modal estilo CategoryManager con CRUD de listas, picker de color, confirm destructivo al borrar.
- **`WishlistForm`** incluye selector de lista; por defecto coge la lista del filtro activo o la primera del usuario.
- **`Wishlist` page**: chips horizontales para filtrar (Todas + cada lista con su dot de color), botón engranaje para gestionar listas, empty states adaptados a la lista activa.

### 4.7 Tests 🔧 (parcialmente hecho)
- **Setup Vitest** completo: `vitest.config.ts` con alias `@/` resuelto, scripts `npm test` y `npm run test:run` en package.json.
- **Tests unitarios** sobre las librerías puras del proyecto:
  - `src/lib/__tests__/bodyType.test.ts` — calcula los 5 tipos de silueta, valida labels y tips.
  - `src/lib/__tests__/sizeFit.test.ts` — checkFit con todos los veredictos, normalización de tallas numéricas.
  - `src/lib/__tests__/description.test.ts` — concordancia de género/número, no-redundancia de color, ficha vs anuncio, hashtags.
- Pendientes (no hechos):
  - Tests de hooks de React Query (requieren mocks de Supabase, más complejo).
  - Tests E2E con Playwright sobre flujos de auth y CRUD.
  - Tests de componentes UI con Testing Library.

### 4.8 Política de privacidad y términos
- Páginas estáticas accesibles desde Perfil.
- Modelo de privacidad simple: tus datos viven solo en tu cuenta de Supabase.

---

## 5. Cambios importantes a recordar

- **30-oct-2026**: Supabase exigirá GRANTs explícitos para Data API en `public`. Mitigado con `0005_grants.sql` y patrón documentado.
- **Recreación del proyecto Supabase**: tras recrearlo, ejecutar **todas** las migraciones en orden (0001 → 0006).
- **PWA actualizada**: bumpear `CACHE` en `sw.js` cuando haya cambios grandes para forzar refresco.
- **Site URL en Supabase**: debe apuntar tanto a `http://localhost:5174` (dev) como a la URL de producción de Vercel.

---

## 6. Decisiones tomadas (para no rebatirlas)

- **Sin Tailwind dark variants explícitas en cada componente** → se usa CSS variables semánticas (surface, ink, muted, line) que se cambian automáticamente. Componentes solo usan tokens, no colores específicos.
- **Storage por bucket**: `clothes-images` para fotos de prendas, `avatars` para fotos de perfil. Ambos públicos pero con políticas que limitan escritura a la carpeta del usuario.
- **Tono de descripciones**: cercano y amigable, con emoji al final. Cuatro variantes por género/número.
- **Compresión client-side antes de subir** (no server-side) → más rápido, menos cuota de Supabase.
- **No usar plugins externos para drag-drop** → todo con APIs nativas HTML5 para mantener bundle ligero.
- **Stack sin Next.js** → Vite puro porque no necesitamos SSR ni rutas server-side. PWA + SPA funciona perfecto.

---

## 7. Cómo retomar el proyecto si han pasado semanas

1. `git pull` para traer los últimos cambios.
2. `npm install` por si han cambiado dependencias.
3. Revisar `supabase/migrations/` y ejecutar las que falten en Supabase.
4. `.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. `npm run dev` → http://localhost:5174.
6. Leer la sección **2. En curso** de este documento para saber por dónde íbamos.
