# Frontend - Agro IoT (Etapa 1)

Aplicación web de solo lectura para monitorear los sensores de suelo: dashboard, áreas, detalle de sensores, históricos, mapa y alertas. Mientras no exista el backend, funciona con datos simulados (mocks).

La guía completa de trabajo (reparto, contrato de API, especificación de cada Issue) está en el documento "Guía de trabajo del Frontend - Etapa 1".

## Requisitos

- Node.js **24.22.1** (LTS). La versión exacta está en `.nvmrc`: todo el equipo usa la misma.
- npm (viene con Node).

Para comprobarlo: `node -v`.

## Primeros pasos

1. Instalar las dependencias exactas del `package-lock.json`:

   ```
   npm ci
   ```

2. Crear el archivo de variables de entorno a partir del ejemplo:

   ```
   cp .env.example .env
   ```

   En PowerShell: `Copy-Item .env.example .env`

3. Levantar la app:

   ```
   npm run dev
   ```

   Se abre en http://localhost:5173

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Revisa los tipos y genera la versión de producción |
| `npm run lint` | Revisa el código con ESLint |
| `npm test` | Corre todas las pruebas una vez |
| `npm run test:watch` | Corre las pruebas y vuelve a correrlas al guardar |
| `npm run preview` | Sirve la versión de producción |

Antes de abrir un Pull Request tienen que pasar `npm test`, `npm run lint` y `npm run build`.

## Variables de entorno

| Variable | Valor de ejemplo | Para qué sirve |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api/v1` | Dirección base de la API |
| `VITE_USE_MOCKS` | `true` | Si es `true`, MSW responde con datos de ejemplo |

Las variables `VITE_*` son **públicas**: Vite las incluye en el código que se descarga. Nunca van contraseñas, tokens ni claves. El archivo `.env` no se sube al repositorio.

## Datos de ejemplo (mocks)

Con `VITE_USE_MOCKS=true` la app usa datos simulados. Todos salen de `src/mocks/data/db.ts` y cada endpoint tiene su handler en `src/mocks/handlers/` (se registran solos).

Para ver cada estado de una pantalla se agrega `?mock=` a la URL, por ejemplo `http://localhost:5173/dashboard?mock=vacio`:

| `?mock=` | Efecto |
| --- | --- |
| (sin parámetro) | Respuestas normales |
| `lento` | Cada respuesta tarda 3 segundos |
| `vacio` | Las listas vuelven vacías |
| `error` | Responde 500 |
| `offline` | El pedido falla como si no hubiera red |
| `error-reintento` | El primer pedido sale bien y los siguientes fallan |

Se puede limitar a un endpoint con `escenario:endpoint`, por ejemplo `?mock=error:area-sensores`. Endpoints: `login`, `dashboard`, `areas`, `area`, `area-sensores`, `sensor`, `historico`, `mapa` y `alertas`.

Los datos son ilustrativos y no representan mediciones reales.

## Estructura

```
src/
  api/        cliente HTTP (apiFetch), sesión y funciones por endpoint
  app/        router, protección de rutas y contexto de sesión
  components/ componentes compartidos y layout
  hooks/      useApi y otros hooks
  mocks/      datos de ejemplo, escenarios y handlers de MSW
  pages/      una carpeta por pantalla
  styles/     tokens.css (colores, espaciados) y global.css
  test/       configuración y utilidades de pruebas
  types/      tipos TypeScript del contrato de la API
```

## Flujo de trabajo

Una rama `feature/*` por trabajo, Pull Request, revisión de la otra persona, QA y fusión a `develop`. Nadie trabaja directo sobre `develop` ni sobre `main`. Los Pull Requests se escriben con `Refs #N` y no con `Closes #N`, porque muchos Issues incluyen trabajo de backend.