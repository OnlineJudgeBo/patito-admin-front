# Panel de administración de Patito

Frontend del panel administrativo. Sirve para manejar usuarios, problemas, concursos, cursos, temas, cronogramas y archivos de prueba.

Está hecho con React y Vite. La ruta base es `/admin/`.

## Levantarlo localmente

Se necesita Node.js 20 y npm.

```bash
cp .env.example .env
npm ci
npm run dev
```

El panel abre en <http://localhost:3002/admin/>.

## Dependencias

Para iniciar y navegar el frontend solo hace falta Node.js. Para iniciar sesión y cargar datos necesita:

1. `patito-db`, porque ahí están usuarios, problemas y concursos.
2. `onlineJudgeAdmin-back`, que expone la API.
3. `patito-client-web`, porque el cierre de sesión vuelve a la web del juez.

El orden ya está configurado en el Compose de la raíz. Desde `src-new/` puedes levantar todo con:

```bash
docker compose up -d --build
```

En ese stack el panel queda en <http://localhost:8083/admin/> y la API en <http://localhost:8088/api>.

En `.env` se define la conexión con la API:

```env
VITE_API_URL=http://localhost:8088/api
VITE_LOGOUT_URL=http://localhost:8082/oj/logout.php
VITE_SITE_ID=1
```

| Variable | Para qué sirve | Obligatoria |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API. Debe incluir `/api`. | Sí |
| `VITE_LOGOUT_URL` | Ruta de logout de la web PHP. | Sí |
| `VITE_SITE_ID` | Sitio usado cuando el token no trae `site_id`. | No, usa `1` |

Las variables `VITE_*` se guardan dentro del build. Para una imagen ya construida usa `public/config.js`, que tiene prioridad sobre `.env`.

## Configuración del despliegue

`public/config.js` permite cambiar la URL de la API sin volver a construir la imagen:

```js
window.__APP_CONFIG__ = {
  API_URL: 'https://mi-dominio.com/api',
  SITE_ID: 1,
  LOGOUT_URL: 'https://mi-dominio.com/oj/logout.php'
};
```

No pongas claves ni tokens ahí. El navegador puede leer todo el contenido del archivo.

## Comandos

```bash
npm run dev       # desarrollo
npm run lint      # ESLint
npm run build     # genera dist/
npm run preview   # abre el build localmente
```

## Arquitectura

La aplicación no tiene una capa de estado complicada. El recorrido normal es este:

```text
Routes.jsx
   └── PrivateRoute
       └── página
           └── apiService
               └── API de administración
```

- `Routes.jsx` decide qué página mostrar.
- `UseAuth` revisa la sesión y `PrivateRoute` bloquea las rutas privadas.
- Las páginas juntan formularios y componentes de cada módulo.
- `apiService.js` concentra las llamadas HTTP, el token y el `SITE_ID`.
- `runtimeConfig` lee primero `public/config.js` y después las variables de Vite.

Así evitamos repetir la URL de la API y el manejo del token en cada pantalla.

## Estructura del proyecto

```text
.
├── public/
│   └── config.js        configuración que se cambia al desplegar
├── src/
│   ├── assets/          imágenes y recursos
│   ├── components/      componentes compartidos y UI
│   ├── context/         estado compartido
│   ├── hooks/           autenticación y hooks propios
│   ├── lib/             helpers de componentes
│   ├── pages/           pantallas por módulo
│   ├── services/        cliente de la API
│   ├── utils/           configuración y utilidades
│   ├── App.jsx          entrada de la aplicación
│   └── Routes.jsx       rutas y layout principal
├── .env.example           variables para desarrollo
├── Dockerfile             build y contenedor Nginx
├── nginx.conf            ruta /admin/ y fallback de la SPA
├── package.json          dependencias y comandos
└── vite.config.js        configuración de Vite
```

El inicio de sesión usa la cookie `accessToken`. Si la cookie existe, el mismo token se manda en la cabecera `Authorization`.

## Docker

```bash
docker build -t patito-admin-ui .
docker run --rm -p 8080:80 patito-admin-ui
```

Queda disponible en <http://localhost:8080/admin/>. Para cambiar `/admin/` hay que revisar `vite.config.js`, `nginx.conf` y las rutas de React.
