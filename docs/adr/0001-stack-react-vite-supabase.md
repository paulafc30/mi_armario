# ADR-0001: Stack — React + Vite + Supabase

**Estado:** aceptado
**Fecha:** 2026-05-04

## Contexto

Necesitábamos elegir stack para una app personal que:

- Una sola usuaria (modelo single-user, aunque arquitectura multi-tenant por si acaso).
- Móvil-first instalable (PWA), también usable en escritorio.
- CRUD de prendas con fotos, búsqueda, filtros, calendario.
- Auth con email/password.
- Sin presupuesto recurrente: ideal $0/mes.
- Mantenida por una sola persona aprendiendo en paralelo.

## Decisión

**Frontend:** React 18 + Vite + TypeScript + TailwindCSS.
**Backend:** Supabase (Auth + PostgreSQL + Storage) en plan gratuito.
**Despliegue:** Vercel (frontend) + Supabase managed (backend).
**Sin SSR, sin backend propio, sin contenedores.**

## Alternativas consideradas

### Next.js + Supabase

Más popular en 2025-2026, pero:
- No necesitamos SSR (la app está detrás de login, no hay SEO público).
- App Router añade complejidad (server components, server actions) que no aporta valor para una PWA single-user.
- El build es más lento que Vite.

→ Vite gana por simplicidad y velocidad de iteración.

### React + Firebase

Firebase Auth + Firestore + Cloud Storage cubrirían lo mismo, pero:
- Firestore es NoSQL: queries menos potentes que SQL para nuestro caso (filtros, joins).
- Las reglas de seguridad de Firestore son menos expresivas que el SQL + RLS de Postgres.
- Menos cómodo para evolucionar el esquema (no hay `ALTER TABLE` natural).

### React + backend propio (Node/Express + Postgres)

Daría más control pero:
- Hay que mantener un servidor (Render, Railway, Fly.io) → fricción operacional.
- Auth from scratch es trabajo serio (sesiones, refresh tokens, recuperación, etc.).
- Para una app personal sin escala, es over-engineering.

### Solo local (IndexedDB, sin backend)

Tentador por simpleza, pero:
- Una sola pantalla = todos los datos en ese navegador. Cambias de móvil y se pierde.
- Sin auth no hay backup ni sincronía.

## Consecuencias

### Positivas

- **Cero infraestructura que mantener.** Supabase y Vercel son managed.
- **RLS resuelve aislamiento por usuario** sin lógica en backend.
- **Migraciones SQL en archivos versionados** dentro del repo → reproducible.
- **Costes**: $0/mes mientras estemos dentro del free tier de ambos (Vercel 100GB bandwidth, Supabase 500MB DB + 1GB Storage). Suficiente para uso personal.
- **Type safety end-to-end** con TypeScript en frontend y tipos manuales que reflejan el schema SQL.
- **PWA "for free"** con Vite + manifest + service worker.

### Negativas

- **Dependencia de Supabase.** Si cambian políticas (e.g., el cambio de GRANTs del 30-oct-2026), nos afecta. Mitigado con migraciones explícitas y RLS en el repo.
- **Sin tipos auto-generados de DB.** Los mantenemos a mano en `src/types/database.ts`. Coste asumible para una sola persona.
- **Vendor lock-in moderado.** Las funciones de Supabase (RLS, Storage policies, triggers) son SQL estándar; migrar a otro PostgreSQL es factible aunque tedioso.
- **No SSR** → si en el futuro queremos páginas públicas SEO (compartir un outfit con link público sin login), tendríamos que añadir SSR o pre-rendering.

### Restricciones que esto impone

- No podemos hacer integraciones server-side (e.g., llamar a APIs de pago como Claude/OpenAI con secret keys) sin añadir Edge Functions de Supabase. Cuando lleguemos a "Escáner IA", habrá que dar ese salto.
- El bundle se envía entero al cliente → si la app crece mucho, hay que considerar code-splitting agresivo.
