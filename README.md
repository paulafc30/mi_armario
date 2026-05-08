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

### 3. Ejecutar la migración SQL

1. Abre el panel de Supabase → **SQL Editor → New query**.
2. Pega el contenido de [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql).
3. Ejecuta (botón **Run**).

Esto crea:
- Tablas: `profiles`, `categories`, `clothes`, `outfits`, `outfit_items`, `wishlist`.
- Políticas **Row Level Security** para que cada usuaria solo vea sus datos.
- Bucket de Storage `clothes-images` con políticas de acceso por carpeta de usuario.
- Categorías por defecto (Camisetas, Pantalones, Vestidos, Zapatos, Accesorios, Abrigos) que se crean automáticamente al registrarte.

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
