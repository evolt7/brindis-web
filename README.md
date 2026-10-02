# Brindis — web

Landing page, registro de parejas y proveedores, ingreso y panel. Hecho con Next.js (la web) y Supabase (cuentas y base de datos). Se publica gratis en Vercel.

## Qué incluye

| Página | Qué hace |
| --- | --- |
| `/` | Landing page. El buscador lleva al registro con la fecha y los datos ya llenos. |
| `/registro` | Elegir tipo de cuenta: evento o negocio. |
| `/registro/pareja` | Registro de parejas y familias con los datos de su evento. |
| `/registro/proveedor` | Registro de negocios (quedan "En revisión" hasta que los apruebes). |
| `/ingresar`, `/recuperar`, `/nueva-clave` | Ingreso y recuperación de clave. |
| `/panel` | Panel de cada usuario: su evento o su negocio y los siguientes pasos. |
| `/terminos`, `/privacidad` | Borradores legales a nombre de CODELAS S.A.S. |
| `/panel/perfil`, `/panel/fotos`, `/panel/paquetes`, `/panel/calendario` | Panel del proveedor: datos del negocio, hasta 12 fotos, paquetes con precio y fechas ocupadas. |
| `/proveedores/[id]` | Página pública de cada proveedor (solo aprobados; el dueño ve una vista previa). |
| `supabase/schema.sql` | Tablas, reglas de seguridad y el alta automática de cada cuenta. |
| `supabase/002_perfil_proveedor.sql` | Fotos, paquetes, calendario y el espacio para guardar las fotos. |
| `/proveedores` | Catálogo para parejas: filtros por fecha, categoría, ciudad e invitados; con fecha, solo muestra a los libres. |
| `supabase/003_eventos_proveedores.sql` | Proveedores que cada pareja guarda en su evento ("Agregar a mi evento"). |

## Publicar la web, paso a paso

Todo se hace desde el navegador; no necesitas instalar nada. Calcula una o dos tardes.

### 1. Dominio

1. Busca `brindis.ec` (o `brindis.com.ec`) en un registrador autorizado de dominios .ec y cómpralo a nombre de CODELAS S.A.S.
2. Guarda el acceso al panel del registrador: ahí vas a pegar los registros DNS de los pasos 4 y 5.

### 2. GitHub (donde vive el código)

1. Crea una cuenta en github.com.
2. Crea un repositorio privado llamado `brindis-web`.
3. En el repositorio: **Add file › Upload files** y arrastra todo el contenido de esta carpeta (sin `node_modules` ni `.next`, que no vienen en el zip). Guarda con **Commit changes**.

### 3. Supabase (cuentas y base de datos)

1. Crea una cuenta en supabase.com y un proyecto nuevo llamado `brindis`. Región: la más cercana a Ecuador que ofrezca (por ejemplo, São Paulo o este de EE. UU.). Guarda la contraseña de la base de datos en un lugar seguro.
2. Ve a **SQL Editor › New query**, pega todo el contenido de `supabase/schema.sql` y presiona **Run**. Debe decir "Success". Repite, en ese orden y cada uno en una consulta nueva, con `supabase/002_perfil_proveedor.sql` y `supabase/003_eventos_proveedores.sql`.
3. Ve a **Project Settings › API** y copia:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / publishable key** → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (Nunca copies ni uses la `service_role` o `secret` key en la web.)
4. Ve a **Authentication › URL Configuration**:
   - **Site URL:** `https://brindis.ec`
   - **Redirect URLs:** agrega `https://brindis.ec/**`, `https://*.vercel.app/**` y `http://localhost:3000/**`
5. Ve a **Authentication › Emails** (plantillas) y pon los textos en español (abajo tienes unos listos).

### 4. Vercel (publicar la web)

1. Entra a vercel.com con tu cuenta de GitHub.
2. **Add New › Project** › elige `brindis-web` › **Import**.
3. En **Environment Variables** agrega las tres de `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://brindis.ec`
4. Presiona **Deploy**. En uno o dos minutos tendrás una dirección tipo `brindis-web.vercel.app` funcionando.
5. **Settings › Domains** › agrega `brindis.ec` y `www.brindis.ec`. Vercel te muestra los registros DNS exactos; cópialos en el panel de tu registrador. El dominio puede tardar desde minutos hasta 48 horas en activarse.

### 5. Correo de confirmación (obligatorio antes de abrir al público)

El correo que trae Supabase es solo para pruebas y permite muy pocos envíos por hora: con tráfico real, la gente no recibiría su correo de confirmación. Conecta un servicio de correo propio:

1. Crea una cuenta en resend.com (tiene plan gratuito) y agrega tu dominio `brindis.ec`. Te dará registros DNS para pegar en tu registrador.
2. Crea una API key en Resend.
3. En Supabase: **Authentication › Emails › SMTP Settings** › activa **Custom SMTP**:
   - Remitente: `hola@brindis.ec`, nombre: `Brindis`
   - Host: `smtp.resend.com` · Puerto: `465` · Usuario: `resend` · Contraseña: tu API key de Resend
4. En **Authentication › Rate Limits** sube el límite de correos por hora (por ejemplo, 100).

### 6. Probar

1. Abre la web, crea una cuenta de pareja con tu correo y confírmala desde el correo que te llega.
2. Crea una cuenta de proveedor con otro correo.
3. En Supabase, **Table Editor**: verás las tablas `profiles`, `events`, `vendors` y la vista `registros` con todos los registros juntos.
4. Para publicar a un proveedor: en `vendors` cambia su `status` de `pendiente` a `aprobado`.

## Cambios frecuentes

- **Correo, WhatsApp e Instagram de Brindis:** `lib/config.js`, bloque `CONTACT`. Al guardar el cambio en GitHub, Vercel republica solo.
- **Categorías, ciudades, rangos de invitados y presupuesto:** también en `lib/config.js`.
- **Textos de la landing:** `app/page.js`.
- **Colores y estilos:** `app/globals.css` (arriba están los colores de la marca).

## Antes del lanzamiento público

- [ ] Completar `[RUC]`, `[DIRECCIÓN]` y `[FECHA]` en `/terminos` y `/privacidad`, y que un abogado revise ambos textos (Ley Orgánica de Protección de Datos Personales).
- [ ] Definir cómo se cobran y liberan los anticipos antes de activar pagos en línea.
- [ ] Cambiar los datos de contacto en `lib/config.js`.

## Plantillas de correo en español (Supabase › Authentication › Emails)

**Confirm signup**

- Asunto: `Confirma tu cuenta en Brindis`
- Mensaje:

```html
<h2>¡Bienvenido a Brindis!</h2>
<p>Confirma tu correo para activar tu cuenta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
<p>Si no creaste una cuenta en Brindis, ignora este correo.</p>
```

**Reset password**

- Asunto: `Crea una clave nueva para Brindis`
- Mensaje:

```html
<h2>Recupera tu clave</h2>
<p>Haz clic para crear una clave nueva:</p>
<p><a href="{{ .ConfirmationURL }}">Crear clave nueva</a></p>
<p>Si no pediste este cambio, ignora este correo.</p>
```

## Para trabajar en tu computadora (opcional)

Necesitas Node.js 20 o superior.

```bash
npm install
cp .env.example .env.local   # y llena las variables
npm run dev                   # abre http://localhost:3000
```
