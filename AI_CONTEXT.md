# Contexto para IA — `juezvirtualbo-admin-front`

> Generado: 2026-08-14. Documento vivo: si cambian endpoints consumidos o páginas,
> actualizar este archivo en el mismo PR. No duplica el `INVENTORY.md` propio del
> repo si existe uno más profundo — este archivo se centra en el contrato HTTP.

## 1. Qué es este proyecto

Panel administrativo del juez (React 18 + Vite 5 + JavaScript/JSX), servido bajo
`/admin/`. Único consumidor de gran parte de los endpoints de gestión de
`onlinejudgebo-admin-api` (usuarios/roles, problemas, concursos, cursos académicos,
rutas de aprendizaje, temas, horarios, archivos). Requiere rol
`Administrador`/`Docente`/`Auxiliar` según la pantalla.

- Entradas: `src/main.jsx`, `src/App.jsx`, `src/Routes.jsx`.
- Todo el HTTP pasa por `src/services/apiService.js` (`BASE_URL` = `VITE_API_URL` o
  `/api`, más `window.__APP_CONFIG__` en runtime).
- Sesión: JWT en cookie `accessToken`, decodificada con `jwt-decode` para leer
  `site_id`.
- Sin suite de tests automatizada.

## 2. Endpoints consumidos, por página

Todos apuntan a `onlinejudgebo-admin-api` (ver su `AI_CONTEXT.md` para el contrato
completo). Verificado línea por línea contra los controllers reales en esta sesión —
no hay rutas rotas al día de este documento.

| Página / componente | Endpoints (verbo + ruta) |
| --- | --- |
| `AcademicPage/ListAcademicCoursePage.jsx`, `CourseAdminDetailPage.jsx` | `GET academic/sites/{s}/courses/manageable`, `GET .../courses/{id}`, `POST .../courses`, `GET/POST/DELETE .../courses/{id}/members(/{userId})`, `POST/PUT .../courses/{id}/assignments(/{id})`, `GET .../courses/{id}/report(.csv)` |
| `ProblemsPage/*` | `GET problems(?searchTerm)`, `POST problems`, `PUT problems/{id}`, `DELETE problems/{id}`, `PUT Problems/{id}/visibility`, `GET judge/rejudge/problem/{id}` |
| `ContestPage/*` | `GET contests`, `GET contests/{id}`, `POST contests`, `PUT contests/{id}`, `PUT Contests/{id}/promote`, `GET programmingLanguages` |
| `TopicsClassificationsPage/*` | `GET topics`, `POST topics`, `POST topics/{id}/classification` |
| `UsersPage/*`, `Managment/Users/*` | `GET users(?searchTerm)`, `PUT users/{username}`, `PUT users/changePassword/{userId}`, `DELETE users/{userId}`, `DELETE users/{userId}/role/{roleId}`, `POST roles/{username}/{role}` |
| `FileManagerPage/*` | `GET/POST/DELETE FileManager/local-storage(?problemId=&fileName=)`, `GET FileManager/local-storage/ac`, `GET FileManager/local-storage/content` |
| `Schedule/AddSubjetPage.jsx`, `ScheduleTable.jsx` | `GET/POST schedule-management/teachers`, `GET/POST schedule-management/subjects`, `PUT/DELETE schedule-management/{teachers|subjects}/{id}`, `GET/POST/DELETE schedule-management/schedules(/{id})`, `GET schedule-management/schedules/teachers` |
| `CKEditor/upload_adapter.js` | `POST filemanager/cloud-storage` |
| `IndexPage/*` | `GET Statics/GetLast365DaysSubmissionsByMonth`, `GET Statics/GetSubmissionsByLanguageAsync` |

## 3. `apiService.js` — funciones nombradas vs. wrappers genéricos

El archivo mezcla dos estilos:
1. Funciones nombradas para Academic/Roles/Rejudge/LearningPaths/SubjectAssistant
   (bloque agregado en una sesión reciente, ver §4).
2. Wrappers genéricos `get/create/update/delete/postFile(endpoint, ...)` usados con
   strings literales directamente en cada página (patrón más antiguo, mayoría del
   código).

No hay una migración en curso documentada hacia un único estilo — al tocar una
página, seguir el estilo que ya usa esa página.

## 4. Estado de git al momento de este documento (IMPORTANTE)

`src/services/apiService.js`, `src/pages/AcademicPage/ListAcademicCoursePage.jsx`,
`src/pages/Schedule/AddSubjetPage.jsx` y `src/utils/getApiErrorMessage.js` tenían
cambios **staged sin commitear** sobre `main` detectados en esta sesión. Traen:

- Manejo global de 401 (`handleUnauthorized`: borra cookie, redirige a
  `/admin/login`) — útil, corregido.
- Fix real de una ruta rota en `AddSubjetPage.jsx`
  (`schedule-management/teachers/teachers` → `schedule-management/teachers`) —
  corregido.
- 20 métodos nuevos (`fetchAvailableRoles`, `addRoleToUser`, `removeRoleFromUser`,
  `rejudge*`, `*AcademicLearningPath*`) que **duplican funcionalidad que ya existe**
  vía los wrappers genéricos en páginas existentes (`AddUserRuleComponent.jsx`,
  `DisableAdminUserComponent.jsx`, `ListProblemPage.jsx`,
  `LanguageListComponent.jsx`) y que **no tienen ningún consumidor** — pertenecen al
  trabajo de la rama sin pushear `feature/rejudge-roles-learning-paths`
  (`RejudgePage.jsx`, `RoleManagementPage.jsx`, páginas de learning-paths que no
  existen en `main`).

Si alguien retoma este working tree: decidir si ese trabajo va a `main` (y entonces
faltan las páginas) o si vuelve a `feature/rejudge-roles-learning-paths` (y entonces
sobra en `main`). Ver también `API_CONTRACT.md` (no trackeado) en la raíz de este
repo, que audita lo mismo pero referencia archivos que solo existen en esa rama.

## 5. Riesgos/brechas observadas

- Ver §4 — código muerto/duplicado pendiente de resolución de rama.
- No hay pruebas automatizadas; el build (`npm run build`) es la validación real de
  CI (`npm run lint` puede fallar sin bloquear, `continue-on-error` en el workflow).
