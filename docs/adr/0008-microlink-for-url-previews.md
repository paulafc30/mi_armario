# ADR-0008: microlink.io como servicio externo para previews de URL

**Estado:** aceptado
**Fecha:** 2026-05-08

## Contexto

Necesitamos extraer metadatos (`og:title`, `og:image`, `og:description`, a veces `og:price:amount`) de URLs de tiendas o plataformas para:

- Pre-rellenar Wishlist items.
- Pre-rellenar prendas compartidas desde Wallapop/Vinted/Zara.
- Pre-rellenar atajos de Inspiración.

Hacerlo desde el navegador con `fetch(url)` no funciona por CORS — las tiendas no exponen sus páginas con `Access-Control-Allow-Origin: *`. Necesitamos un intermediario que haga la request server-side y devuelva los metadatos parseados.

## Decisión

Usamos **microlink.io** como servicio externo. Tiene API pública gratuita:

```
GET https://api.microlink.io?url=<encoded-url>
```

Sin auth, sin signup. Devuelve JSON con título, imagen, descripción, logo y otros metadatos.

El helper `fetchUrlPreview(url)` en `src/lib/utils.ts` encapsula la llamada y normaliza la respuesta:

```ts
{
  title?: string
  image?: string
  description?: string
  price?: number  // intentamos parsear de og:price:amount o de "N €" en title/desc
}
```

Si el servicio no responde o la URL no tiene metadatos, devolvemos `null` y el flujo continúa sin pre-rellenar (la usuaria mete los datos a mano).

## Alternativas consideradas

### Backend propio que haga el scraping

Levantar un endpoint en Edge Function de Supabase que use `fetch` + `cheerio` o parser HTML para extraer `og:*` tags.

- Pros: control total, sin dependencia externa.
- Contras: hay que mantener el parser, añadir Edge Functions a la infra, y la lógica de parsing es exactamente la misma que microlink ya hace.

→ Lo dejamos como **posible futuro** si microlink falla o nos pone problemas.

### Open Graph parsing service equivalente

Hay otros: linkpreview.net, opengraph.io, screenshotmachine, etc. Microlink elegido porque:
- API pública sin auth para casos básicos.
- Respuesta JSON sencilla.
- Lleva años activo.
- Plan gratuito permite ~50 requests/día sin signup.

### Llamar directo desde el navegador (`fetch` con proxy CORS)

CORS proxies públicos (`cors-anywhere`, `corsproxy.io`, etc.) son inestables y a menudo se cierran. Microlink es más fiable y específicamente diseñado para este caso de uso.

## Consecuencias

### Positivas

- **Cero infraestructura nuestra**. Una sola línea de fetch.
- Cubre el 90% de los casos: extracción de title + image + description funciona prácticamente con cualquier sitio decente (e-commerce, marketplaces, Pinterest, Instagram).
- El usuario puede editar todo manualmente si la sugerencia es mala. La extracción es ayuda, no requisito.

### Negativas

- **Dependencia externa**. Si microlink cae, la auto-extracción no funciona. Pero la app sigue funcionando (los formularios aceptan input manual).
- **Sin auth = sin cuotas individuales**. El plan gratuito puede tener rate limiting agresivo si microlink cambia política. En la práctica para una sola usuaria estamos lejos de hitos.
- **Algunos sitios bloquean User-Agent de microlink** (sobre todo grandes retailers anti-bot). Cuando pasa, la respuesta es genérica o vacía.
- **Privacidad**: cada URL que pegamos en wishlist/share se reenvía a microlink. No es PII crítica pero conviene tenerlo en cuenta.

### Restricciones derivadas

- `fetchUrlPreview()` **nunca debe ser bloqueante**: si tarda o falla, el formulario debe quedar usable. Implementado con `try/catch` que devuelve `null`.
- El precio que microlink extrae **no es fiable** para todos los sitios. Si el parsing por regex tampoco lo pilla, dejamos vacío y la usuaria lo rellena.
- Las imágenes de microlink a veces vienen de CDNs externos (Stradivarius CDN, etc.). Cuando se usan en collages de outfit (canvas), el CORS puede fallar y se cae al placeholder. Acceptable.
