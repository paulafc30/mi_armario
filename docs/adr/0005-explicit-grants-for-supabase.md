# ADR-0005: GRANTs explícitos en todas las tablas

**Estado:** aceptado
**Fecha:** 2026-05-13

## Contexto

El 30 de octubre de 2026, Supabase cambia el comportamiento por defecto: las tablas en el esquema `public` **dejarán de ser accesibles automáticamente** desde el Data API (PostgREST / supabase-js / GraphQL). Habrá que conceder GRANTs explícitos a los roles `anon`, `authenticated` y `service_role`.

Para proyectos creados antes del 30 de mayo de 2026, las tablas existentes conservan sus permisos actuales, pero **tablas nuevas creadas después del 30 de octubre necesitarán los GRANTs explícitos**.

Mejor curarnos en salud y aplicarlo a todas las tablas desde ya.

## Decisión

Cada migración que crea una tabla en `public` termina con el bloque estándar:

```sql
grant select                          on public.<tabla> to anon;
grant select, insert, update, delete  on public.<tabla> to authenticated;
grant all                             on public.<tabla> to service_role;
```

Además, la migración `0005_grants.sql` aplica esos GRANTs a todas las tablas existentes en un bloque `DO $$ ... $$` idempotente que comprueba `information_schema.tables` antes de cada `GRANT`, así se puede correr en cualquier momento sin riesgo de error si una tabla no existe.

## Alternativas consideradas

### No anticiparse: esperar al 30 de octubre

Atractivo pero descartado:
- Si una tabla nueva se crea después de esa fecha sin grants, los `INSERT`/`SELECT` del frontend fallan en producción → bug silencioso.
- Si se nos olvida, la primera vez que pase será cuando una usuaria intente algo.

### Conceder `anon` privilegios completos (no solo SELECT)

Descartado:
- `anon` representa "no autenticado". Como toda la app está detrás de login y RLS filtra por `auth.uid()`, dar `INSERT/UPDATE/DELETE` a anon no aporta nada útil.
- Mayor superficie de ataque si alguien encuentra un endpoint sin auth.

### Grantear solo `authenticated`, omitir `anon` y `service_role`

- `anon` necesita SELECT porque supabase-js anónimo es lo que arranca antes del login (e.g., en la página `/login` el JWT está vacío). Si quitamos SELECT, hasta el chequeo de sesión falla.
- `service_role` se usa desde Supabase para backfills, migraciones manuales y triggers `SECURITY DEFINER`. Mejor explícito.

## Consecuencias

### Positivas

- Tablas nuevas funcionan en cualquier momento, antes o después del 30-oct-2026.
- Las migraciones son **autocontenidas**: leerlas dice exactamente qué permisos tienen las tablas.
- `0005_grants.sql` actúa como red de seguridad: si en algún momento alguien olvida los GRANTs en una migración nueva, ejecutar `0005` los aplica retroactivamente.

### Negativas

- Tres líneas más por cada tabla nueva. Coste asumible.
- Si en algún momento queremos restringir `authenticated` (e.g., una tabla solo de lectura), hay que recordar quitar los GRANTs de mutación. Por defecto damos CRUD completo y RLS filtra.

### Patrón establecido

Cualquier migración que cree una tabla en `public` **debe** terminar con los 3 GRANTs estándar. Si no los lleva, está incompleta. Esta regla está documentada también en `CODE_STYLE.md` y `.cursorrules`.
