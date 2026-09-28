# SPEC — Panel de administración (juezvirtualbo-admin-front)

Actualizado: 2026-09-27.

## Propósito

SPA para que administradores, docentes y auxiliares gestionen el contenido del juez: problemas, concursos/exámenes, cursos, temas, horarios, usuarios y casos de prueba. No tiene lógica de negocio propia: todo pasa por `onlinejudgebo-admin-api`.

## Stack

React 18 + Vite 5, React Router 6, Tailwind + Radix/shadcn, Formik/React Hook Form + Yup, CKEditor 5 (MathType), ECharts, axios. Ruta base `/admin/`, servida por Nginx en la imagen Docker.

## Actores

| Rol | Acceso |
| --- | --- |
| Administrador | todo, incluidos roles, export/import de problemas y rutas de aprendizaje |
| Docente / Auxiliar | problemas, concursos, cursos, temas, horarios, archivos, rejuzgar |
| Sin sesión | solo `/admin/login` |

## Pantallas (src/Routes.jsx)

| Ruta | Función |
| --- | --- |
| `/admin` | dashboard: envíos de los últimos 365 días y por lenguaje |
| `/admin/users` | perfil propio: editar, cambiar contraseña, borrar cuenta |
| `/admin/problems` | listado, visibilidad, borrado, export |
| `/admin/problems/add`, `/edit/:problemId` | editor de enunciado (HTML + LaTeX), límites, temas |
| `/admin/problems/import` | importar paquete (ICPC) |
| `/admin/problems/import-boca` | importar paquete BOCA (preview + confirmar) |
| `/admin/problems/rejudge` | rejuzgar por problema/solución/concurso/rango/lenguaje e historial |
| `/admin/fileManager/:problemId` | casos `.in/.out` en almacenamiento local |
| `/admin/fileManager/:problemId/ac` | soluciones AC guardadas del problema |
| `/admin/topicsClassifications` | temas y clasificaciones |
| `/admin/academic/courses`, `/:courseId` | cursos: miembros, tareas, materiales, ranking, reporte |
| `/admin/contests`, `/add`, `/edit/:contestId` | concursos: problemas, usuarios, lenguajes, promover; campos de examen |
| `/admin/contests/:contestId/monitor` | monitor de examen: IPs por participante y alertas |
| `/admin/machines` | exámenes con acceso al control de PCs del laboratorio |
| `/admin/contests/:contestId/machines` | estado, alertas y acciones remotas de las máquinas del examen |
| `/admin/schedules` | horarios, materias, docentes, auxiliares |
| `/admin/management/users` | asignar/quitar roles |
| `/admin/login`, `/admin/logout` | sesión |

## Requisitos funcionales clave

- **Sesión:** token JWT en cookie `accessToken`; `apiService` lo envía como `Authorization: Bearer`. `PrivateRoute` redirige a login si no hay sesión válida. El logout vuelve a `LOGOUT_URL` de la web PHP.
- **Multi-sitio:** cada request usa el `site_id` del token o, si falta, `SITE_ID` de la configuración.
- **Exámenes:** un concurso puede marcarse como examen y declarar IPs/rangos de laboratorio (`ExamFields`). El monitor lo ve cualquier Administrador, Docente o Auxiliar del sitio; las alertas (`OUTSIDE_LAB`, `CONCURRENT_USE`, `MULTIPLE_IPS`, `SHARED_IP`, `IP_CAPTURE`) son indicios para el supervisor, no veredictos.
- **Máquinas de examen:** el panel consume el proxy de `onlinejudgebo-admin-api` hacia `control-server`; permite agrupar por IP, ver telemetría/capturas/alertas, asignar ubicación o participante y enviar acciones a una o varias PCs. No muestra credenciales de equipos.
- **Clasificación asistida:** edición de problemas e importación BOCA muestran hasta dos clasificaciones existentes sugeridas por la API, con motivo; las aceptadas se guardan como selecciones normales.
- **Errores de API:** se muestran con `getApiErrorMessage` + SweetAlert/toast.

## Configuración

Prioridad: `public/config.js` (`window.__APP_CONFIG__`) > variables Vite en build.

| Clave | Vite | Obligatoria |
| --- | --- | --- |
| `API_URL` | `VITE_API_URL` (incluye `/api`) | sí |
| `LOGOUT_URL` | `VITE_LOGOUT_URL` | sí |
| `SITE_ID` | `VITE_SITE_ID` | no (1) |

`config.js` es público: nunca poner secretos.

## Dependencias externas

`onlinejudgebo-admin-api` (todas las operaciones), `patito-client-web` (logout), MariaDB indirectamente.

## Verificación

```bash
npm run lint && npm run build
```

E2E: `patito-selenium-tests` (`@admin`: login, problemas, file manager, concursos).

## Pendientes conocidos

- `/admin/management/roles` renderiza `CreateContestPage` (ruta sin pantalla propia).
- No hay tests unitarios en el proyecto.
- El lint completo conserva errores legados; `MachinesPage.jsx` sí pasa ESLint de forma aislada.
- El control de máquinas depende de que la API tenga configurado `control-server` y los grupos de examen.
