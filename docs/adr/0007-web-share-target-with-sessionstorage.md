# ADR-0007: Web Share Target con handoff vía sessionStorage

**Estado:** aceptado
**Fecha:** 2026-05-11

## Contexto

Queríamos que la usuaria pudiera **compartir desde otra app** (Wallapop, Vinted, Zara, Instagram, Pinterest, etc.) y que el contenido fuera a Mi Armario. El estándar es Web Share Target API de PWAs.

Cuando un sitio web está instalado como PWA y declara `share_target` en su manifest, aparece en el "Compartir con…" del sistema operativo. Al elegirlo, el navegador navega a la URL declarada con los datos como query params.

```json
"share_target": {
  "action": "/share",
  "method": "GET",
  "params": { "title": "title", "text": "text", "url": "url" }
}
```

El problema: después de `/share`, queremos enviar al usuario a `/armario`, `/venta` o `/wishlist` con un formulario pre-rellenado. ¿Cómo pasamos los datos?

## Decisión

Implementar `/share` como **pantalla intermedia** que:

1. Lee los query params (`title`, `text`, `url`).
2. Muestra un chooser con tres destinos (Armario, Venta, Wishlist).
3. Al elegir, **guarda el payload en sessionStorage** vía `storeSharedPayload({...})`.
4. Navega a la ruta de destino.

La página destino (Armario / Venta / Wishlist) en su `useEffect` de mount llama a `consumeSharedPayload(target)` — saca el payload de sessionStorage si está apuntando a ese target, lo borra (para no consumirlo dos veces), y abre el formulario correspondiente pre-rellenado.

Para Wallapop/Vinted, además, antes de pasar el payload, hacemos:

- `detectSalePlatform(url)` → detecta plataforma por dominio.
- `extractTitleFromShareText(text)` → saca el nombre de las comillas.

El formulario destino entonces puede llamar a `fetchUrlPreview(url)` (microlink) para sacar imagen, descripción y a veces precio.

## Alternativas consideradas

### Pasar los datos vía estado de React Router

`navigate('/armario', { state: { prefill: {...} } })`. Pero:
- El estado se pierde si el usuario refresca o si la PWA se reinicia.
- Es por defecto inaccesible para el destino sin importar el `useLocation`.

### Pasar todo por query string

`navigate('/armario?prefill=' + encodeURIComponent(JSON.stringify(...)))`. Pero:
- URLs largas (imágenes base64 no caben).
- Se ven en el historial.
- Limpieza tediosa.

### Procesar todo en `/share` y enviar al backend

Sin backend → no aplica. Si tuviéramos Edge Functions, podríamos crear la prenda directamente desde `/share` y enviar a Mi Armario. Pero es más complicado y menos reversible para la usuaria (no puede editar antes de guardar).

### POST en lugar de GET en el share_target

Web Share Target soporta POST con `multipart/form-data` para incluir archivos. Pero:
- Más complejo: necesita un service worker que intercepte el POST.
- La mayoría de los casos de uso (Wallapop, Vinted, Pinterest) comparten solo URL/texto.
- Lo dejamos para futuro si necesitamos compartir imágenes directamente.

## Consecuencias

### Positivas

- **Funciona en cualquier flujo de share**, sin backend.
- La usuaria **revisa y edita antes de guardar** — no se le crean prendas a sus espaldas.
- Si la primera elección fue incorrecta (e.g., pensaba que era para Venta y resulta que era Wishlist), puede cerrar el formulario y volver atrás.
- El payload muere con la sesión del navegador → no quedan datos pegados si reinicia.

### Negativas

- **Dependencia del PWA estar instalada**. Solo aparece en el chooser de share del SO si la app está añadida a pantalla de inicio (Android) o instalada (iOS).
- **iOS Safari** es restrictivo con share_target: a veces no aparece, otras sí, depende de la versión.
- Si Chrome / iOS rompen el flujo de query params en algún update, no nos enteramos hasta que falla. Mitigado con un log + redirect a `/armario` si no llegan params.

### Restricciones derivadas

- El `manifest.webmanifest` no se relee mientras la PWA está instalada. Cualquier cambio en `share_target` requiere desinstalar y reinstalar la PWA.
- `sessionStorage` se borra al cerrar el navegador completo. Si la usuaria comparte algo, abre la PWA un minuto después (no instantáneamente) y otra app cerró el contexto del navegador, el payload puede perderse. En la práctica no pasa porque el flujo es inmediato.

### Patrón establecido

Para añadir un nuevo destino en el share:

1. Añadir el `ShareTarget` en `src/lib/sharedItem.ts`.
2. Añadir el destino en `Share.tsx`.
3. En la página destino, hacer el `consumeSharedPayload(target)` y montar el prefill.

Tres pasos pequeños.
