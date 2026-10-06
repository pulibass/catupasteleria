# Catú Pastelería · Carta digital

Carta pública y panel privado (`/admin`) construidos con Next.js 16, Supabase (Auth, Postgres y Storage) y Vercel.

- La carta se guarda como JSON en `public.site_content` (fila `id = 'menu'`). Si todavía no existe, se muestra la carta predeterminada de `lib/menu-data.ts`.
- Las fotos nuevas se suben al bucket público `product-images` y la carta usa su URL pública. Se aceptan JPG, PNG y WebP de hasta **4 MB**: la subida pasa por `/api/upload`, una Vercel Function cuyo cuerpo de solicitud máximo es 4,5 MB.
- Cada persona ingresa con su propio correo y contraseña. El propietario invita empleados desde **Equipo**.

## Configuración de Supabase

1. Crear un proyecto en Supabase.
2. En **SQL Editor**, ejecutar completo `supabase/migrations/202610060001_catu_schema.sql`. Crea las tablas `site_content` y `admins` con RLS, y el bucket `product-images` (límite de 4 MB). Se puede volver a ejecutar sin riesgo: si el bucket ya existía, actualiza su límite y tipos permitidos.
3. En **Authentication → Users**, crear el usuario propietario (correo y contraseña) con el mismo correo que `OWNER_EMAIL`.
4. En **Authentication → URL Configuration**:
   - **Site URL**: la URL de producción (por ejemplo `https://catu.vercel.app`).
   - **Redirect URLs**: agregar `https://<tu-dominio>/admin/password` (y `http://localhost:3000/admin/password` para desarrollo).
5. Opcional: para que la invitación funcione aunque el correo se abra en otro navegador, cambiar la plantilla **Invite user** para que el enlace sea
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/admin/password`.

## Variables de entorno

Ver `.env.example`. Cargar en Vercel (Production y Preview) y en `.env.local` para desarrollo (no se versiona):

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable (`sb_publishable_…`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta, solo servidor. Nunca usar con prefijo `NEXT_PUBLIC_` |
| `OWNER_EMAIL` | Correo del propietario |

## Acceso al panel

- Ingresar en `/admin/login`. La carta pública no muestra ningún enlace al panel.
- El primer ingreso de `OWNER_EMAIL`, cuando aún no hay administradores, lo registra como `owner`.
- El propietario invita empleados desde **Equipo**: quedan registrados como `editor` y reciben un correo para crear su contraseña en `/admin/password`.

## Desarrollo

```bash
npm install
npm run dev
```

## Producción

```bash
npm run build
npm start
```

En Vercel, el framework se detecta como Next.js sin configuración adicional.
