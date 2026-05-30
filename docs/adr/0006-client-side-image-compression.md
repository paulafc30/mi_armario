# ADR-0006: Compresión de imágenes client-side antes del upload

**Estado:** aceptado
**Fecha:** 2026-05-09

## Contexto

Las fotos del móvil pesan 3-5 MB cada una (iPhone 12 Pro: ~4MB, Pixel: ~3MB). La usuaria sube varias fotos por prenda. Si dejamos pasar todo, en un mes nos comemos los 1 GB de Storage gratuito de Supabase con 250 fotos.

Además, Wallapop y Vinted **comprimen las imágenes a ≤ 1MB internamente** cuando las publicas. Subir originales de 4MB es desperdiciar tanto la cuota nuestra como el ancho de banda de la usuaria.

## Decisión

Comprimir las imágenes **en el navegador, antes del upload**, en `src/lib/imageCompression.ts`:

```ts
compressImage(file, { maxSize: 1600, quality: 0.82 })
```

- **Redimensiona** si el lado más largo supera 1600px (preserva resolución suficiente para web).
- **Re-encoda** como JPEG con calidad 0.82 (buen punto en la curva calidad/tamaño).
- **Salta** si la imagen ya pesa < 400KB (no merece la pena, podría empeorarla).
- **Fallback seguro**: si por cualquier razón falla (HEIC sin decoder, OOM en canvas, etc.), devuelve el archivo original y deja que el upload proceda.

Resultado típico: 4MB → 250-400KB con pérdida visual imperceptible para el caso de uso (ropa en plana).

Para avatares: parámetros más agresivos (`maxSize: 480, quality: 0.85`) → 30-60KB.

## Alternativas consideradas

### Comprimir en el servidor (Supabase Edge Function)

- Implica añadir backend y dependencias (sharp, jimp).
- Mayor latencia: subir 4MB, esperar compresión, descargar URL.
- Coste de invocación.

→ Cliente gana en velocidad percibida y simplicidad.

### Subir originales y comprimir on-demand al servir

- Supabase no tiene image transformation por defecto en plan gratuito.
- Podríamos usar un CDN tipo Cloudinary, pero añade un servicio externo más.
- Subir 4MB cada vez sigue siendo lento desde móvil.

### Pedir manualmente a la usuaria que comprima

- Fricción horrible para el caso de uso.
- Defrauda el "abre cámara, hace foto, sube".

### No comprimir

- Insostenible para el plan gratuito de Supabase.
- Carga lenta en datos móviles.

## Consecuencias

### Positivas

- Cuota de Storage de Supabase dura órdenes de magnitud más.
- Velocidad de upload mucho mayor (5x-10x).
- App utilizable con datos móviles sin enfadar a la usuaria.
- Trabajo se hace en el dispositivo de la usuaria, no en infraestructura nuestra.

### Negativas

- **HEIC de iPhone** puede no decodificarse en Chrome Android (Safari iOS sí). Cuando esto pasa, devolvemos el original y el upload continúa. La foto se sube grande, pero al menos no se pierde el flujo.
- **JPEG con calidad 0.82** introduce artefactos en imágenes con texto fino o gradientes muy suaves. Para fotos de ropa es invisible; para tickets/etiquetas igual no lo sería tanto, pero no es nuestro caso.
- La usuaria espera **~500ms - 1.5s** mientras se comprime (canvas operation). Aparece spinner "Comprimiendo…" en el `MultiImagePicker` para feedback.

### Restricciones derivadas

- Cualquier nuevo flujo de subida de imágenes **debe** usar `compressImage` antes de `uploadImage`. Los helpers de `lib/images.ts` no lo hacen por sí solos: comprimir es responsabilidad de quien llama (el `MultiImagePicker` lo hace; el código de avatar en `Profile.tsx` lo hace explícitamente).
- Si en algún momento añadimos un caso de uso donde la fidelidad sea crítica (escáner de etiquetas, lectura de números de tallaje), hay que considerar permitir saltar la compresión opcionalmente.
