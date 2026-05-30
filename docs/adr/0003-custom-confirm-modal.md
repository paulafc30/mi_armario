# ADR-0003: Sistema custom de confirmaciones

**Estado:** aceptado
**Fecha:** 2026-05-12

## Contexto

Las acciones destructivas (borrar prenda, cerrar sesión, mover a venta, etc.) necesitan confirmación del usuario. Hasta ese momento usábamos `window.confirm()` nativo, que:

- Tiene estética del navegador, rompe la coherencia visual de la app.
- No soporta texto rico ni iconos.
- En PWA instalada en móvil se ve como diálogo del sistema operativo.
- No respeta tema claro/oscuro.

Hay 8 puntos en el código donde se llama a `confirm()`.

## Decisión

Implementamos un sistema basado en **promesas** con un `ConfirmProvider` global y un hook `useConfirm()`.

API:

```tsx
const confirm = useConfirm()
const ok = await confirm({
  title: 'Eliminar prenda',
  message: 'No se puede deshacer.',
  confirmText: 'Eliminar',
  destructive: true,
})
if (!ok) return
// ejecutar acción
```

El `ConfirmProvider` se monta en `src/main.tsx` envolviendo a `BrowserRouter`. El modal renderiza con z-index 40, **por encima de cualquier otro Modal** (que usa z-30), para que también funcione desde dentro de formularios modales.

Soporta cola: si llamas `confirm()` mientras hay uno abierto, se encola y se muestra al cerrar el anterior.

Para destructivas (`destructive: true`):
- Icono de alerta triangular ámbar.
- Botón "Confirmar" en rojo (`btn-danger`).
- **Foco automático en Cancelar** para evitar pulsar Confirmar por error.

Para neutras:
- Icono de info coral.
- Botón "Confirmar" en coral (`btn-primary`).
- Foco en Confirmar.

## Alternativas consideradas

### React-confirm-alert / sweetalert2 / similar

Funcionan, pero:
- Bundle extra de 20-50kb.
- Estética que no encaja, hay que estilarla.
- API basada en callbacks anidados, no promesas.

### Component-based con state en el padre

Cada componente que necesita confirmar añade su propio `useState` + render condicional del modal. Verboso y repetitivo.

### Dialog HTML nativo (`<dialog>`)

Soporte aceptable en navegadores modernos, pero:
- Estilado en navegadores antiguos es inconsistente.
- API imperativa (`dialog.showModal()`) no encaja bien con React.

## Consecuencias

### Positivas

- API ergonómica: `const ok = await confirm(...)` se lee como pseudocódigo lineal.
- Estética 100% coherente con la app (mismo Modal base, animaciones, dark mode).
- Una sola implementación → menos superficie de bug.
- Z-index correcto para apilarse encima de Modals.
- Soporta queue de confirmaciones (raro pero posible).

### Negativas

- Es nuestro propio sistema → si queremos extenderlo (e.g., input dentro del confirm) toca tocar el componente.
- El provider está en `main.tsx` → si un componente se usa fuera del provider (e.g., en tests sin wrapper), `useConfirm()` lanza error.

### Restricciones derivadas

- **Cero `window.confirm` en código nuevo.** Es regla explícita en `CODE_STYLE.md` y `.cursorrules`.
- Mensajes de los modales en español, con tono amable pero claro. Usar `destructive: true` siempre que la acción borre o pierda datos.
