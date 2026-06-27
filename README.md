# Patito Admin Front

Frontend web Admin, para gestionar usuarios, problemas, concursos, cursos académicos, archivos de casos de prueba, cronogramas, temas y clasificaciones de problemas

## 1. Resumen

| Elemento | Detalle |
| --- | --- |
| Framework | React 18 + Vite 5 |
| Lenguaje principal | JavaScript / JSX |
| Estilos | Tailwind CSS, Radix UI, CSS local |
| Cliente HTTP | Axios |
| Autenticación | Cookie `accessToken` con JWT y cabecera `Authorization: Bearer` |
| Ruta base | `/admin/` |
| Puerto de desarrollo | `3002` |

## 2. Funcionalidades principales

- Inicio de sesión y cierre de sesión administrativo.
- Dashboard con gráficos y métricas.
- Gestión de usuarios, perfiles, roles y contraseñas.
- Gestión de problemas del juez virtual.
- Editor de enunciados con CKEditor, MathType y soporte HTML.
- Gestión de concursos.
- Gestión de cursos académicos, miembros, asignaciones y reportes CSV.
- Gestión de temas y clasificaciones.
- Administración de archivos asociados a problemas y casos aceptados.
- Gestión de cronogramas.
- Consumo configurable de API backend mediante variables de entorno o configuración en tiempo de ejecución.

## 3. Requisitos

- Node.js 20 recomendado. El `Dockerfile` usa `node:20` para construir la aplicación.
- npm compatible con `package-lock.json`.
- API backend disponible y accesible desde el navegador.
- Servicio de autenticación integrado que emita la cookie `accessToken`.

## 4. Estructura relevante

```text
.
├── Dockerfile                 # Build de Vite y publicación con Nginx
├── nginx.conf                 # Configuración Nginx para servir /admin/
├── package.json               # Scripts y dependencias npm
├── public/config.js           # Configuración runtime expuesta en window.__APP_CONFIG__
├── src/
│   ├── Routes.jsx             # Rutas principales de la SPA
│   ├── PrivateRoute.jsx       # Protección de rutas privadas
│   ├── components/            # Componentes compartidos
│   ├── context/               # Estado global/contextos
│   ├── hooks/                 # Hooks de autenticación y soporte
│   ├── pages/                 # Pantallas funcionales
│   ├── services/apiService.js # Cliente de API centralizado
│   └── utils/                 # Utilidades y configuración runtime
└── vite.config.js             # Configuración Vite, alias @ y base /admin/
```

## 5. Configuración

La aplicación puede configurarse de dos formas:

### 5.1 Variables de entorno de build/desarrollo

Crear un archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base del API backend | `http://localhost:8088/api` |
| `VITE_LOGOUT_URL` | URL del cierre de sesión del juez / OJ | `http://localhost:8082/oj/logout.php` |
| `VITE_SITE_ID` | Identificador del sitio académico por defecto | `1` |

> Nota: las variables `VITE_*` se incorporan al bundle durante el build.

### 5.2 Configuración en tiempo de ejecución

El archivo `public/config.js` define `window.__APP_CONFIG__`:

```js
window.__APP_CONFIG__ = window.__APP_CONFIG__ || {
  API_URL: 'http://localhost:8088/api',
  SITE_ID: 1,
  LOGOUT_URL: 'http://localhost:8082/oj/logout.php'
};
```

Esta opción permite ajustar endpoints sin recompilar la aplicación, siempre que el archivo `config.js` sea reemplazado o generado en el entorno de despliegue.

## 6. Instalación y ejecución local

Instalar dependencias:

```bash
npm ci
```

Levantar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:3002/admin/
```

## 7. Scripts disponibles

| Comando | Uso |
| --- | --- |
| `npm run dev` | Ejecuta Vite en `0.0.0.0:3002` con puerto estricto. |
| `npm run build` | Genera el build de producción en `dist/`. |
| `npm run preview` | Sirve localmente el build generado por Vite. |
| `npm run lint` | Ejecuta ESLint sobre archivos JS/JSX. |

## 8. Build de producción

Ejecutar:

```bash
npm run build
```

El resultado se genera en `dist/` y está preparado para servirse bajo la ruta base `/admin/`.

## 9. Despliegue con Docker

Construir imagen:

```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:8088/api \
  --build-arg VITE_SITE_ID=1 \
  --build-arg VITE_LOGOUT_URL=http://localhost:8082/oj/logout.php \
  -t juezvirtualbo-admin-front .
```

Ejecutar contenedor:

```bash
docker run --rm -p 8080:80 juezvirtualbo-admin-front
```

Acceso esperado:

```text
http://localhost:8080/admin/
```

El `Dockerfile` realiza dos etapas:

1. Construye la aplicación con Node.js 20.
2. Copia `dist/` a `/usr/share/nginx/html/admin` y sirve la SPA con Nginx.

## 10. Integración con backend

El cliente está en `src/services/apiService.js`.

- La URL base se obtiene desde `window.__APP_CONFIG__.API_URL` o `VITE_API_URL`.
- El token se lee desde la cookie `accessToken`.
- Si existe token, las solicitudes incluyen `Authorization: Bearer <token>`.
- El `SITE_ID` se toma del JWT si está disponible; en caso contrario se usa el valor configurado.
- Las respuestas esperadas son JSON, excepto descargas CSV y cargas multipart.

## 11. Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/admin` | Dashboard principal |
| `/admin/login` | Inicio de sesión |
| `/admin/logout` | Cierre de sesión |
| `/admin/users` | Perfiles de usuario |
| `/admin/problems` | Listado de problemas |
| `/admin/problems/add` | Alta de problemas |
| `/admin/problems/edit/:problemId` | Edición de problemas |
| `/admin/contests` | Listado de concursos |
| `/admin/contests/add` | Alta de concursos |
| `/admin/contests/edit/:contestId` | Edición de concursos |
| `/admin/academic/courses` | Cursos académicos |
| `/admin/academic/courses/:courseId` | Detalle y administración de curso |
| `/admin/topicsClassifications` | Temas y clasificaciones |
| `/admin/schedules` | Cronogramas |
| `/admin/fileManager/:problemId` | Archivos del problema |
| `/admin/fileManager/:problemId/ac` | Archivos/casos aceptados del problema |
| `/admin/management/users` | Administración de usuarios |

## 12. Consideraciones

- La aplicación está configurada para funcionar bajo `/admin/`; si se cambia esta ruta se debe ajustar `vite.config.js`, `nginx.conf` y las rutas definidas en `src/Routes.jsx`.
- `public/config.js` debe servirse sin caché para permitir cambios de configuración post-build; `nginx.conf` ya define `Cache-Control: no-store` para `/admin/config.js`.
- Las rutas privadas dependen de que la cookie `accessToken` esté disponible para el dominio desde donde se sirve el frontend.
- El backend debe permitir CORS para el origen del frontend cuando se usen dominios o puertos distintos.
- No se deben versionar credenciales reales en `.env` ni en `public/config.js`.

## 13. Verificación sugerida para entrega

Antes de entregar a ambiente técnico:

```bash
npm ci
npm run lint
npm run build
```

Validación funcional mínima:

1. Abrir `/admin/login`.
2. Autenticarse con un usuario administrativo.
3. Confirmar carga del dashboard `/admin`.
4. Verificar listado de problemas y usuarios.
5. Crear o editar un registro de prueba en un ambiente no productivo.
6. Validar que una recarga del navegador en una ruta interna mantiene la SPA funcionando.
