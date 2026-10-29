# Frontend de monitoreo de suelo — Informe técnico de la Etapa 1

**Proyecto A26T02 · Red IoT de sensores de suelo**
Paloma Macchión y Juliana Galiano

> **Síntesis del trabajo.** Se desarrolló una aplicación web de monitoreo de suelo, de solo lectura, con una base compartida de navegación, sesión, consultas HTTP, componentes y datos simulados. La interfaz permite recorrer áreas y sensores, consultar mediciones, explorar históricos, visualizar la ubicación de los dispositivos y revisar las alertas activas.

## Objetivo

Transformar los wireframes y las historias de usuario de la Etapa 1 en una interfaz consistente, verificable y preparada para integrarse con una API. El desarrollo se organizó para avanzar sin depender de la disponibilidad del backend y para mantener los mismos criterios de datos, estados y diseño en todas las pantallas.

## Alcance de la entrega

El alcance funcional de la etapa comprende ocho pantallas: Login, Dashboard, Áreas, Detalle de área, Detalle de sensor, Históricos, Mapa y Alertas. Se implementaron la base común y las ocho pantallas, todas integradas en `develop` mediante Pull Requests revisados por el otro integrante del equipo.

La aplicación funciona sobre **datos simulados mediante MSW**. El backend real, la ingesta MQTT, la persistencia y el aislamiento efectivo por cliente no están integrados. Análisis/IA corresponde a una etapa posterior y se presenta como una opción deshabilitada.

## Contenido del informe

Se explican las tecnologías utilizadas, las decisiones y sus motivos, la arquitectura, el comportamiento de las pantallas, la estrategia de simulación, las pruebas, el flujo de trabajo y los puntos necesarios para continuar la integración.

El informe toma como referencia la Guía de trabajo del Frontend - Etapa 1 (A26T02), el desarrollo revisado del repositorio y la documentación técnica del equipo.

---

## 01 / Decisiones — Tecnologías elegidas y sus motivos

Se priorizó una solución simple y modular: reutilizar componentes, centralizar decisiones y sumar dependencias cuando resolvieran una necesidad concreta de la etapa.

| Pieza | Uso y justificación |
|---|---|
| React + TypeScript | Componentes reutilizables para tarjetas, listas, insignias y estados. Los tipos expresan el contrato y permiten detectar incompatibilidades al compilar. Frente a JavaScript puro, reducen errores de datos; Angular requería mayor estructura y aprendizaje para este plazo. |
| Vite | Servidor de desarrollo y build con poca configuración. Se eligió para simplificar el arranque y mantener una única base de herramientas. |
| React Router | Rutas anidadas, parámetros de área/sensor y protección por sesión. Evita resolver manualmente la navegación con estado local. |
| Recharts | Gráfico temporal declarativo, con ejes, tooltip y cortes por valores ausentes. D3 ofrecía un control innecesario para una serie de esta complejidad. |
| Leaflet + react-leaflet | Mapa interactivo sin requerir una clave de API. Se utiliza OpenStreetMap con atribución; su disponibilidad depende de Internet y de las condiciones del proveedor de tiles. |
| MSW | Simula respuestas HTTP en el navegador y las pruebas. Evita escribir datos dentro de las páginas y permite mantener los mismos clientes de API para la integración real. |
| Vitest + Testing Library | Pruebas integradas con Vite y centradas en roles, textos y acciones del usuario. Se evitó incorporar una configuración paralela de Jest. |
| CSS Modules + tokens | Clases locales por componente y variables CSS compartidas para colores, fuentes y espaciados. Se evita una segunda convención de estilos y se reduce el riesgo de colisiones. |
| fetch + apiFetch | Un envoltorio concentra URL base, token y errores. No se agregó axios porque las necesidades actuales se resuelven con fetch. |
| Hook useApi | Comparte carga, éxito, error, recarga y descarte de respuestas antiguas. Se pospuso una librería de consultas más compleja hasta que la escala de la aplicación la justifique. |

El PR #38 unificó el helper `cantidad` en `lib/formato.ts`, compartido por Dashboard y Áreas, sin cambiar el comportamiento funcional y con pruebas de singular y plural. Las referencias antiguas al PR de paleta en la documentación de Históricos y Mapa se reemplazaron por una referencia a `styles/tokens.css`.

---

## 02 / Arquitectura — Cómo se organiza y circula la información

| Carpeta en `frontend/src` | Responsabilidad |
|---|---|
| `app/` | Router, rutas protegidas y contexto de autenticación. |
| `api/` | Cliente HTTP, token y funciones específicas por endpoint. |
| `pages/` | Una carpeta por pantalla con componente, CSS Module y pruebas. |
| `components/` | Piezas de interfaz y layout compartido. Incluye mensajes, indicadores, insignias y breadcrumb. |
| `hooks/` y `lib/` | `useApi`, `useBreadcrumb`, contador de alertas y formateadores de fechas/valores. |
| `types/` | Tipos del contrato y dominio común, incluida una única unión `Variable`. |
| `mocks/` | Handlers de MSW, escenarios, configuración de navegador/pruebas y datos de `db.ts`. |
| `styles/` y `test/` | Tokens de diseño, estilos globales y utilidades para preparar Router y sesión. |

La documentación de ejecución vive en `frontend/docs/`. El helper `test/utils.tsx` prepara Router y sesión para las pruebas; el proveedor de breadcrumb se incorpora explícitamente cuando la pantalla lo necesita. Las funciones por endpoint separan el contrato de la presentación y los tipos evitan duplicar definiciones de dominio.

### Flujo de una consulta

Pantalla → función de `api/` → `apiFetch` → MSW o backend. La página presenta datos y estados; el cliente agrega el prefijo de API y, cuando corresponde, el token. Los handlers de ejemplo obtienen la información de la base común. Las funciones de consulta aceptan `AbortSignal` para cancelar pedidos.

Los errores HTTP se representan con `ErrorApi` y su código de estado; una falla de conexión se distingue con estado `null`. El login utiliza `sinSesion` para no enviar un token previo ni interpretar una contraseña incorrecta como una sesión expirada.

### Estados y concurrencia con `useApi`

El hook devuelve `estado`, `datos`, `error`, `recargar` y `desactualizado`. Si falla una recarga con los mismos parámetros, conserva los datos anteriores y marca su posible desactualización. Si cambia el sensor, el área o un filtro, descarta los datos anteriores. Los pedidos cancelados no pueden reemplazar la respuesta nueva.

### Sesión y límites de seguridad

`AuthContext` guarda el token en `sessionStorage` como solución provisional, limitada a la sesión de la pestaña. Las rutas privadas redirigen a `/login` sin token; con sesión, `/login` redirige al Dashboard. Un 401 fuera del login borra la sesión y permite avisar que expiró; un 401 del login se trata como credenciales inválidas.

`sessionStorage` es accesible desde JavaScript: no sustituye la protección del backend ni una futura decisión sobre cookies `httpOnly`. El frontend no envía `cliente_id` para autorizar datos ni accede directamente a MongoDB o MQTT.

---

## 03 / Funcionalidades — Pantallas y decisiones de comportamiento

| Pantalla / referencia | Qué se desarrolló |
|---|---|
| Login · #12 / PR #31 | Formulario con campos requeridos, botón deshabilitado al enviar y redirección al Dashboard. Credenciales inválidas generan un mensaje genérico y vacían la contraseña. Una falla de conexión permite reintentar. |
| Dashboard · #13 / PR #32 | Cuatro métricas, actualización, áreas y últimas alertas. Un solo pedido agregado evita resúmenes parciales. Cada área y alerta enlaza al detalle correspondiente. Las cinco alertas recientes incluyen resueltas identificadas; es un criterio provisional a acordar con backend. |
| Áreas · #14 / PR #33 | Tarjetas con sensores, conectividad, alertas y actualización. El botón Actualizar conserva la respuesta previa si falla la recarga, incluso cuando era vacía, y muestra el aviso con reintento. |
| Detalle de área · #15 / PR #26 | Dos pedidos independientes permiten mostrar el nombre del área sin esperar la lista. Cada sensor presenta estado, última comunicación, ubicación y alertas, y enlaza a su detalle. |
| Detalle de sensor · #16 / PR #27 | Ficha y seis mediciones con sus unidades. La desconexión no se trata como error de API: conserva las últimas lecturas con fecha visible. Un dato faltante se diferencia de cero. |
| Históricos · #17 / PR #28 | Rango inicial de siete días calendario e inputs de fecha. Se convierte desde el inicio y hasta el fin del día local a UTC. Validación antes del pedido, gráfico con huecos, tabla alternativa y aviso de truncamiento con límite centralizado. |
| Mapa · #18 / PR #29 | Pines por conectividad, resumen y enlace al sensor. Filtros por área/estado, zoom por área y Vista general con dispositivos sin coordenadas válidas. Se mantiene el mapa base en carga/error y un listado alternativo. |
| Alertas · #19 / PR #34 | Alertas activas ordenadas por severidad, con filtros por área, tipo y severidad. El desplegable de Área se arma con `GET /areas`; si ese pedido falla, la lista de alertas sigue disponible. Vacío positivo, conservación de filtros ante un error y aviso de resultados parciales. Cada alerta enlaza al sensor que la originó. 14 pruebas automáticas. |

El layout (#10 / PR #25) aporta menú persistente, navegación móvil, insignia de alertas, breadcrumb y cierre de sesión. Los atajos temporales se retiraron cuando el recorrido normal permitió acceder a las pantallas.

---

## 04 / Contrato — Consultas y acuerdos de comportamiento

Los endpoints se agrupan bajo `/api/v1`. Sus formas de respuesta constituyen un contrato de trabajo del frontend y los mocks: deben acordarse con backend antes de conectar datos reales. Las páginas no traducen directamente documentos de la base de datos.

| Endpoint | Uso |
|---|---|
| `POST /auth/login` | Inicio de sesión; es la excepción al envío de token. |
| `GET /dashboard/resumen` | Resumen agregado, áreas y últimas alertas. |
| `GET /areas` | Listado con conectividad, alertas y actualización por área. También alimenta el filtro de Área de Alertas. |
| `GET /areas/{area_id}` | Identidad y nombre del área. |
| `GET /areas/{area_id}/sensores` | Sensores y estado técnico del área. |
| `GET /sensores/{device_id}` | Ficha y últimas mediciones del dispositivo. |
| `GET /sensores/{device_id}/historico` | Serie filtrada por variable, desde, hasta y limit. |
| `GET /mapa/sensores` | Ubicación, estado y resumen de los sensores. |
| `GET /alertas` | Alertas, filtros (`area_id`, `tipo`, `severidad`, `estado`), total de resultados y límite de respuesta. |

### Criterios de la pantalla de Alertas

La consulta de referencia utiliza `estado=activa` y `limit=50`. Los filtros de tipo, severidad y área se envían juntos al pulsar Aplicar filtros y se conservan ante un error, de modo que Reintentar no obligue a seleccionarlos de nuevo. El filtro `area_id` está implementado en el frontend y en el mock; falta confirmar con backend que el endpoint real lo soporta y cuál es el conjunto definitivo de opciones.

Sin alertas activas se muestra un vacío positivo con ícono de confirmación. Si los filtros no devuelven resultados, se ofrece limpiarlos. Cuando `total` supera la cantidad recibida, se informa "Mostrando N de M alertas activas"; no se inventa un paginador hasta definir cursor o desplazamiento.

### Interpretación de los datos

El Dashboard muestra las cinco alertas más recientes y puede incluir resueltas identificadas; el contador de activas se calcula por separado. Ausencia de alertas no equivale a severidad baja. La interpretación de un campo `null` debe estar definida por el endpoint: no se presupone una severidad ni una medición inexistente.

Las magnitudes previstas son humedad, temperatura, conductividad eléctrica, nitrógeno, fósforo y potasio. Las unidades viajan con cada medida; las usadas en la demostración son %, °C, dS/m y mg/kg y siguen pendientes de confirmación de dominio.

---

## 05 / Simulación — Datos coherentes y escenarios reproducibles

Los mocks permiten desarrollar y probar el frontend sin un servidor real. Se activan antes de dibujar la aplicación cuando `VITE_USE_MOCKS=true`. El mismo conjunto de handlers atiende las consultas del navegador y de las pruebas.

### Decisiones sobre datos

- **Fuente única:** `db.ts` reúne áreas, sensores, alertas y funciones derivadas. Los totales se calculan desde esa base; no se repiten números independientes en las pantallas.
- **Reloj compartido:** `ahoraMock` fija la referencia al iniciar. Las comunicaciones se derivan de minutos transcurridos y el umbral de desconexión está centralizado en 30 minutos como valor provisional.
- **Registro automático:** `import.meta.glob` descubre los archivos de handlers. Los patrones comodín permiten trabajar con distintos orígenes sin editar el registro por pantalla.
- **Datos de ejemplo:** 4 áreas, 15 sensores y 5 alertas activas. Los generadores producen lecturas reproducibles y series cada 30 minutos hasta 30 días; no son mediciones ni umbrales agronómicos reales.
- **Identificación explícita:** `DemoBanner` informa que los valores son ilustrativos. El usuario de demostración pertenece al mock del login; no es una credencial de un servicio real.

| Escenario por URL | Comportamiento |
|---|---|
| `lento` | Demora de 3 segundos para observar la carga. La demora normal es 400 ms y se desactiva en pruebas. |
| `vacio` | Respuesta sin datos para probar el mensaje contextual. |
| `error` / `offline` | Respuesta 500 o falla de red, respectivamente. |
| `error-reintento` | El primer pedido de cada endpoint responde normalmente y los siguientes fallan. Permite probar una recarga fallida con datos previos. |

Se limita un escenario con, por ejemplo, `?mock=error:area-sensores`. Las claves disponibles son `login`, `dashboard`, `areas`, `area`, `area-sensores`, `sensor`, `historico`, `mapa` y `alertas`. Se recarga al cambiar el escenario.

En desarrollo, StrictMode puede consumir la primera respuesta correcta en el efecto que luego cancela; por eso `error-reintento` puede mostrarse fallido desde el inicio. No es un escenario de "fallar una vez y luego recuperarse". Para esa recuperación, las pruebas sustituyen el handler con `server.use(..., { once: true })`.

---

## 06 / Experiencia y calidad — Reglas comunes y verificación

### Presentación de la información

Se mantuvo el tema oscuro de grises neutros de los wireframes y una paleta semántica común: verde para conectado/baja, ámbar para severidad media y rojo para desconectado/alta. El color siempre se acompaña de texto. Los estilos usan los tokens compartidos para evitar diferencias entre pantallas.

| Regla | Motivo y aplicación |
|---|---|
| Carga, vacío y error | Skeletons en listas/tarjetas, spinner en históricos y envío del login, mapa base con carga superpuesta. El vacío tiene un mensaje útil y el error recuperable ofrece Reintentar. |
| Ausencias y desconexión | `null` se muestra como "sin datos", nunca como cero. Sensor desconectado conserva las últimas mediciones; coordenadas faltantes se listan aparte. |
| Fechas, unidades y números | API en UTC y presentación local. Valores con unidad y coma decimal; coordenadas con punto y cuatro decimales. Unidades reales y frecuencia pendientes de confirmación. |
| 404 y navegación | "No encontramos lo que buscás", enlace a Áreas y sin reintento para un área o sensor inexistente. Breadcrumb orienta el recorrido sin duplicar niveles. |
| Accesibilidad y móvil | Botones/enlaces reales, labels, foco visible y roles para estados. Revisión en escritorio y a 390 px; las visualizaciones ofrecen alternativas textuales. |

### Pruebas automáticas

Vitest y Testing Library comprueban acciones, roles y textos, sin depender de clases CSS. Los tests se ubican junto a sus componentes y vinculan los casos con criterios de aceptación. MSW permite forzar fallos, vacíos y datos incompletos; `BreadcrumbProvider` se agrega cuando la pantalla declara migas de pan.

Se verifican casos positivos, negativos, borde, reintentos, navegación, filtros y descarte de respuestas antiguas. jsdom no reemplaza el navegador: gráficos, mapa, media queries, foco y tamaños se revisan también manualmente.

> **Resultado verificado más reciente.** Con Alertas integrada y el helper compartido del PR #38, se aprobaron 155 pruebas en 22 archivos, incluidas 14 de Alertas; lint y build también finalizaron correctamente. Se verificaron en navegador los filtros aplicados, los enlaces al sensor, limpiar filtros, la vista móvil, el vacío y los errores independientes de Alertas. El recorrido final completo y la revisión de teclado se registran por separado, después de los últimos merges.

El PR #30 agregó `fsModuleCache: false` para evitar que Vitest reutilice un registro de módulos obsoleto al incorporar handlers. Esto permitió mantener un registro automático común. El PR #35 subió `testTimeout` a 15 s: al correr toda la suite en paralelo, en equipos lentos el primer test de cada archivo superaba los 5 s por defecto y fallaba con "Test timed out" aunque el código fuera correcto. Un test que realmente se cuelga sigue fallando.

---

## 07 / Reproducibilidad — Cómo ejecutar y cómo se integró el trabajo

### Arranque local

Todos los comandos se ejecutan dentro de `frontend/`. En Windows:

```bash
cd frontend
npm ci
copy .env.example .env
npm run dev
```

En macOS/Linux se usa `cp .env.example .env`. La URL de desarrollo se consulta en la salida de Vite. El login de ejemplo con mocks utiliza `demo@agro.com` y `demo1234`.

| Configuración | Propósito |
|---|---|
| `VITE_USE_MOCKS=true` | Activa MSW. Sin esta opción, las consultas se dirigen a la API configurada y fallarán si no hay backend disponible. |
| `VITE_API_BASE_URL=/api/v1` | Prefijo público de la API; las variables `VITE_*` se incluyen en el código del navegador y no deben contener secretos. |
| `.env` / `.env.example` | La configuración local se ignora en Git; el ejemplo se versiona sin secretos reales. |

**Por qué `npm ci`:** instala las versiones fijadas por `package-lock.json` sin actualizarlo. Los cambios del lockfile se revisan y se suben cuando hay una modificación deliberada de dependencias; se evitan cambios accidentales del entorno.

### Ramas, Pull Requests y revisión

El trabajo se integró mediante ramas `feature/*`, PR hacia `develop` y revisión cruzada. Los commits distinguen implementación, pruebas y documentación. Antes de integrar, se actualiza la rama desde `origin/develop` y se resuelven conflictos localmente. No se trabaja directamente en `develop` o `main`.

La revisión comprueba alcance, criterios, estados, datos incompletos, coherencia de tipos y documentación. Se usa `Refs #N`: los issues compartidos con backend permanecen abiertos hasta la integración completa. La publicación desde `develop` hacia `main` se acuerda como cierre de etapa.

Las ramas se nombran `feature/<issue>-<tema>` (y `chore/` o `docs/` para ajustes sin Issue) y los commits usan categorías como feat, fix, test, docs o chore. La plantilla del PR incluye descripción, issue, cambios, cómo probar, evidencias y checklist. Se procura un PR por funcionalidad con sus pruebas y se resuelven los comentarios antes del merge.

### Comprobaciones habituales

```bash
npm test
npm run lint
npm run build
```

---

## 08 / Continuidad — Integración, pendientes y operación

### Pasar de mocks a una API real

Se configurará `VITE_USE_MOCKS=false` y la URL del backend. Mantener los clientes en `api/` permite conservar las pantallas si el contrato coincide. Antes de darlo por integrado deben comprobarse rutas, nombres y anidamiento de campos, token, errores, fechas, unidades y paginación. Los handlers de MSW seguirán sirviendo a las pruebas.

El backend debe autorizar y filtrar por cliente a partir del token, sin confiar en un `cliente_id` enviado por la interfaz. El almacenamiento de sesión es provisional y deberá acordarse con el mecanismo de autenticación real.

### Pendientes de cierre

- Confirmar con backend la paginación cuando `total` supera `limit`, el soporte del filtro `area_id` en `GET /alertas` y el alcance de las alertas recientes del Dashboard.
- Ejecutar el recorrido final completo, revisión de teclado, estados, escritorio/móvil y suite de regresión después de los últimos merges.
- Mantener el helper `cantidad` centralizado en `lib/formato.ts` (resuelto en PR #38).
- Confirmar unidades, frecuencia, umbrales y relación área/campo con los responsables de backend, ingesta y dominio; Análisis/IA permanece fuera de esta etapa.

### Problemas frecuentes y resolución

| Síntoma | Revisión o solución |
|---|---|
| No encuentra Vitest / `package.json` | Entrar en `frontend/` y ejecutar `npm ci`; comprobar que se usa la carpeta y entorno correctos. |
| Pedidos fallidos al iniciar | Revisar `.env` y `VITE_USE_MOCKS`; reiniciar Vite si cambió la configuración. Sin mocks se necesita una API accesible. |
| Lockfile modificado sin intención | Revisar el diff; conservar cambios deliberados de dependencias y revertir solo los accidentales. Usar `npm ci` para reproducir el entorno. |
| No encuentra los tests | Comprobar ruta y sufijo `.test.ts` o `.test.tsx`; ejecutar desde `frontend/`. |
| Módulos o handlers desactualizados | Confirmar `fsModuleCache: false`; si persiste una caché vieja, probar `npx vitest --clearCache`. |
| Test timed out | Suele deberse a una máquina saturada: cerrar otros programas y probar `npx vitest run --maxWorkers=4` (el límite ya es de 15 s desde el PR #35). |
| Doble clic / nombre del botón | El texto cambia a "Ingresando…". En pruebas se conserva la referencia o se consulta el botón por su función y estado. |

**Conclusión.** El desarrollo estableció una base común, pantallas conectadas y criterios verificables para avanzar con independencia del backend. La continuidad consiste en completar el QA conjunto y validar el contrato con datos reales.

Referencias: Guía de trabajo del Frontend - Etapa 1 (A26T02), §§1-16; documentación técnica aportada por el equipo; repositorio `proyectoagrouade-iot/agro` y revisiones de PR #21-#38.