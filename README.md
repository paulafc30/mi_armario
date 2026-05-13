# Mi Armario

App web para gestionar tu ropa: armario digital, ropa a la venta (Wallapop / Vinted) y lista de deseos.

Stack: **React + Vite + TypeScript + Tailwind CSS + Supabase** (Auth + PostgreSQL + Storage).

---

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Entra en [supabase.com](https://supabase.com) y abre tu proyecto (ya lo tienes creado).
2. Ve a **Settings → API** y copia:
   - `Project URL`
   - `anon public` key
3. Crea el archivo `.env` en la raíz del proyecto a partir de `.env.example`:

   ```env
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

### 3. Ejecutar las migraciones SQL

En el panel de Supabase → **SQL Editor → New query**, pega y ejecuta una a una, **en orden**, las migraciones de `supabase/migrations/`:

1. `0001_initial_schema.sql` — tablas base (profiles, categories, clothes, outfits, outfit_items, wishlist), RLS, bucket de Storage `clothes-images`, categorías por defecto al registrarte.
2. `0002_extra_fields.sql` — añade brand, size, color a las prendas.
3. `0003_clothe_images.sql` — tabla `clothe_images` para varias fotos por prenda + trigger que mantiene la portada sincronizada.
4. `0004_wears.sql` — tabla `wears` para el calendario "qué llevé hoy".
5. `0005_grants.sql` — GRANTs explícitos para futuro-proof (Supabase cambia su comportamiento por defecto el 30 de octubre de 2026).

> Para tablas que crees en el futuro, recuerda añadir el bloque de GRANTs (ver `0005_grants.sql` como plantilla) y activar RLS con sus políticas dentro de la misma migración.

### 4. Configurar email de Supabase (opcional pero recomendado)

En **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:5174` (o tu dominio en producción).
- **Redirect URLs**: añade `http://localhost:5174/restablecer` para que funcione el flujo de recuperar contraseña.

Si quieres saltarte la verificación de email para probar más rápido, en **Authentication → Providers → Email** desactiva *"Confirm email"*.

### 5. Arrancar el dev server

```bash
npm run dev
```

Abre [http://localhost:5174](http://localhost:5174). Crea una cuenta y entra. ¡Listo!

---

## Estructura del proyecto

```
mi-armario/
├── src/
│   ├── components/
│   │   ├── auth/          ProtectedRoute
│   │   ├── armario/       Cards y formularios del armario, gestor de categorías, outfits
│   │   ├── venta/         Tarjetas con flujo de estados Baúl→En Venta→Vendida→Archivada
│   │   ├── wishlist/      Formulario con preview automático de URL
│   │   └── shared/        AppShell (layout + bottom nav), Modal, ImagePicker, GlobalSearch
│   ├── hooks/             useAuth, useClothes, useCategories, useOutfits, useWishlist
│   ├── lib/               supabase.ts, images.ts (upload), utils.ts (helpers)
│   ├── pages/             Login, Register, ForgotPassword, ResetPassword, Profile,
│   │                      Armario, Venta, Wishlist
│   ├── store/             Zustand store (búsqueda global)
│   └── types/             database.ts (tipos TS del esquema)
├── supabase/
│   └── migrations/        SQL inicial (esquema + RLS + Storage)
└── .env.example
```

---

## Funcionalidades

### Mi Armario
- Galería de prendas con foto, nombre, categoría, etiquetas y notas.
- Categorías editables (CRUD) con colores personalizables.
- **Outfits**: agrupar prendas como colecciones (selección múltiple).
- Foto de la prenda: subir desde dispositivo o pegar URL externa.
- Botón **Mover a Venta** que pasa la prenda a "Baúl" automáticamente.

### Ropa a la Venta
- Cuatro estados con flujo progresivo: **Baúl → En Venta → Vendida → Archivada**.
- Toggles de **Wallapop** (naranja) y **Vinted** (verde) en cada tarjeta, visibles incluso en archivadas.
- Botones para avanzar o retroceder de estado.
- Al marcar "Vendida" se guarda automáticamente la fecha de venta.

### Lista de Deseos
- Pega un enlace → botón ✨ obtiene automáticamente título e imagen vía [microlink.io](https://microlink.io) (servicio gratuito que extrae `og:image`).
- Edición libre de nombre, precio, imagen y notas.
- Enlace clicable a la tienda original.

### Buscador global
- Caja de búsqueda en el header, accesible desde todas las secciones.
- Filtra por nombre, categoría y etiquetas según la sección activa.

### Auth
- Registro, login, recuperación de contraseña y cambio de email/contraseña.
- Toda la app está protegida tras el login.

---

## Backlog (futuro)

- 📸 **Escáner inteligente de prendas**: cámara que identifique tipo, marca, composición e instrucciones de lavado a partir de la etiqueta (Claude Vision API o Google ML Kit).
- 🔔 Notificaciones cuando una prenda lleve mucho tiempo "En Venta" sin moverse.
- 📊 Estadísticas: prendas más usadas, dinero ganado en ventas, etc.
- 🤝 Compartir outfits con amigas.

---

## Comandos útiles

```bash
npm run dev      # arrancar entorno de desarrollo
npm run build    # compilar para producción
npm run preview  # previsualizar el build
```
