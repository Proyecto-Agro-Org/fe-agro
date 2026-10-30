# A11 — QA integral del frontend Agro IoT

## 1. Resumen ejecutivo

Fecha: 30/10/2026. Rama: `dev`. Revisión base:
`bef66f28f2686c32e6b2df878cf069774cbada2c`. El árbol estaba limpio al comenzar.
Entorno: Windows/PowerShell, Node `v24.19.0`, npm `11.17.0`, Vitest `5.0.5` y jsdom.

**Estado integral: PENDIENTE.** Las tres ejecuciones independientes de la suite
aprobaron las mismas 321 pruebas en 38 archivos (963 ejecuciones de casos).
No se reprodujeron fallos intermitentes. Los resultados corresponden a pruebas
automatizadas y no acreditan un recorrido real en navegador.

Se confirmó un hallazgo documental de baja severidad: las instrucciones antiguas
de Alertas indican conteos globales que ya no corresponden a la cuenta demo.
No se confirmó un nuevo bug funcional en los casos ejecutados. La revisión
visual, responsive e interacción real de Leaflet está **PENDIENTE** por falta de
navegador conectado. La aprobación para producción está **BLOQUEADA** por esas
validaciones y por la autorización real de backend aún no implementada/validada.

No se modificaron funcionalidades, pruebas, configuración, APIs, handlers, modelos,
autenticación ni estilos. El único archivo entregable nuevo es este informe.
No se instalaron dependencias ni se hicieron commits o push.

## 2. Alcance y metodología

Se revisaron A01–A10.2: modelos, datos y generadores, servicios HTTP, sesión,
contextos de autenticación y campo, rutas protegidas, hooks de consulta,
handlers y validadores compartidos de MSW, pantallas, estilos, gráficos,
mapa, documentación y pruebas existentes. No se editaron bugs encontrados.

La matriz automatizada del apartado 4 se deriva de los reportes JSON reales
de las tres ejecuciones, emparejando archivo y nombre completo de cada caso.
Cada fila representa un caso ejecutado, no una deducción a partir del código.
Las pruebas que verifican un rechazo esperado cuentan como OK si el rechazo
se obtuvo y sus aserciones pasaron. No hubo pruebas omitidas ni reintentos.

Se utilizaron tres niveles de evidencia:

- **Ejecución automatizada:** Vitest, Testing Library, MemoryRouter y MSW.
  Algunas pantallas usan proveedores de prueba; las integraciones de `src/app/`
  ejercitan los contextos de sesión/campo y las pantallas indicadas en cada test.
- **Revisión manual estática:** lectura y contraste de implementación, datos,
  contratos y documentación. No equivale a uso manual de la aplicación.
- **Navegador real:** no ejecutado en esta sesión; se registra PENDIENTE.

Los reportes y logs locales se guardan en `test-results/a11/`. Son artefactos
ignorados por Git por terminar en `.log`; este informe conserva el inventario
de resultados aunque no se incorporen esos archivos al repositorio.

## 3. Comportamiento esperado y cobertura por módulo

| ID | Módulo / escenario | Resultado | Evidencia ejecutada o límite |
| --- | --- | --- | --- |
| AUT-01 | Login tradicional válido de Ana, Lucía y alias demo | OK | `AuthContext.test.tsx`, `LoginPage.test.tsx`, `mocks/login.test.ts` |
| AUT-02 | Credenciales inválidas y contraseña vaciada | OK | `LoginPage.test.tsx`, `mocks/login.test.ts` |
| AUT-03 | Google simulado, redirección, carga, reintento y solicitudes simultáneas | OK | `LoginPage.test.tsx`, `api/login.test.ts`, `AuthContext.test.tsx` |
| AUT-04 | Google deshabilitado sin mocks; no invocar endpoints demo | OK | `LoginPage.test.tsx`, `api/login.test.ts` |
| AUT-05 | Recuperación, StrictMode e identidad inválida | OK | `AuthContext.test.tsx` |
| AUT-06 | Cierre, expiración por 401, cambio de cuenta y respuestas tardías | OK | `AuthContext.test.tsx`, `api/client.test.ts` |
| AUT-07 | Rutas protegidas y redirección de /login con sesión | OK | `RutasProtegidas.test.tsx` |
| AUT-08 | Expiración por TTL, refresh y autenticación de backend real | PENDIENTE | El mock valida tokens públicos; se probó expiración por 401, no JWT/TTL real |
| DOM-01 | Usuario → cliente → campo → área → sensor; IDs y referencias sin huérfanos | OK | `dominio.test.ts`, `multicliente.test.ts`, `db.test.ts` |
| CAM-01 | Campos permitidos de cada cliente y selección inicial | OK | `api/campos.test.ts`, `SelectorCampo.test.tsx` |
| CAM-02 | Cambio, navegación, recarga y preferencias separadas por cliente | OK | `SelectorCampo.test.tsx` |
| CAM-03 | IDs inválidos, ajenos, respuesta de cliente incorrecto y storage no disponible | OK | `SelectorCampo.test.tsx`, `api/campos.test.ts` |
| CAM-04 | Sin campos, carga, error y reintento | OK | `SelectorCampo.test.tsx`; integraciones sin campo |
| CAM-05 | Campo/usuario anterior no repone datos con respuestas tardías | OK | `SelectorCampo.test.tsx`, integraciones de `src/app/`, `useApi.test.ts` |
| DAS-01 | Totales, sensores conectados, áreas, alertas y última comunicación por campo | OK | `mocks/alcance.test.ts`, `mocks/dashboard.test.ts`, `DashboardPage.test.tsx` |
| DAS-02 | Alertas recientes, orden y máximo visible | OK | `mocks/dashboard.test.ts`, `DashboardPage.test.tsx` |
| DAS-03 | Campo vacío sin inventar datos ni fechas; cambios de campo y cliente | OK | `alcance.test.ts`, `CampoFiltrado.test.tsx` |
| DAS-04 | Carga, error, reintento y descarte de respuestas tardías | OK | `DashboardPage.test.tsx`, `CampoFiltrado.test.tsx` |
| ARE-01 | Listados, sensores por área, conexión, última comunicación y filtros | OK | `mocks/areas.test.ts`, `AreasPage.test.tsx`, `AreaDetallePage.test.tsx` |
| ARE-02 | Actualización, datos desactualizados y reintento | OK | `AreasPage.test.tsx`, `AreaDetallePage.test.tsx`, `useApi.test.ts` |
| ARE-03 | URL directa de área ajena, otro campo y cliente | OK | `alcance.test.ts`, `CampoFiltrado.test.tsx` |
| SEN-01 | Sensor propio, seis variables, unidades, fechas y valores especiales | OK | `SensorDetallePage.test.tsx`, `formato.test.ts`, `generadores.test.ts` |
| SEN-02 | Sensor desconectado, lectura ausente y sin ubicación | OK | `SensorDetallePage.test.tsx` |
| SEN-03 | URL directa ajena, campo propio incorrecto, inexistente y 403 | OK | `SensorCampo.test.tsx`, `sensores-alcance.test.ts` |
| SEN-04 | Carga, error y reintento | OK | `SensorDetallePage.test.tsx` |
| HIS-01 | Histórico propio/ajeno, autorización previa a generación | OK | `sensores-alcance.test.ts`, `SensorCampo.test.tsx` |
| HIS-02 | Variables, fechas locales a UTC, rango inválido, límite y truncamiento | OK | `HistoricoPage.test.tsx`, `sensores-alcance.test.ts`, `generadores.test.ts` |
| HIS-03 | Gráfico Recharts, tabla accesible, unidades y huecos conservados | OK | `HistoricoPage.test.tsx`; gráfico real con ResizeObserver simulado |
| HIS-04 | Sin datos, error, reintento, cambio rápido y respuesta tardía | OK | `HistoricoPage.test.tsx`, `SensorCampo.test.tsx` |
| MAP-01 | Solo sensores propios, ubicaciones válidas, ceros y lista sin ubicación | OK | `MapaPage.test.tsx`, `mapa-alertas-alcance.test.ts` |
| MAP-02 | Filtros de área/conexión y reinicio al cambiar de campo | OK | `MapaPage.test.tsx`, `MapaAlertasCampo.test.tsx` |
| MAP-03 | Campo vacío, carga, error, cliente distinto y respuestas tardías | OK | `MapaPage.test.tsx`, `MapaAlertasCampo.test.tsx` |
| MAP-04 | Marcadores Leaflet, zoom, teselas y popups interactivos reales | PENDIENTE | El motor Leaflet se sustituye en jsdom; requiere navegador |
| ALE-01 | Alertas, relaciones, totales y contador por campo | OK | `mapa-alertas-alcance.test.ts`, `MapaAlertasCampo.test.tsx`, `AppLayout.test.tsx` |
| ALE-02 | Área, severidad y tipo, aplicar/limpiar, enlaces al sensor | OK | `AlertasPage.test.tsx` |
| ALE-03 | Estado activa/resuelta y rango temporal en el servicio | OK | `mapa-alertas-alcance.test.ts`; la pantalla actual consulta activas y no ofrece selector de estado |
| ALE-04 | Total antes del límite, orden, vacío, error, reintento y catálogo independiente | OK | `mocks/alertas.test.ts`, `AlertasPage.test.tsx` |
| ALE-05 | Campo/cliente distintos, catálogo/contador tardío y ausencia de campos | OK | `MapaAlertasCampo.test.tsx` |
| TEM-01 | Oscuro inicial, cambio en ambos sentidos y preferencia inválida | OK | `tema.test.ts` |
| TEM-02 | Luna/oscuro y sol/claro; teclado y nombre accesible | OK | `SelectorTema.test.tsx`, actualizado en A10.2 |
| TEM-03 | Persistencia, arranque previo a React, sesión, Login y selección de campo | OK | `tema.test.ts`, `TemaIntegracion.test.tsx` |
| TEM-04 | Contraste calculado de tokens, insignias, pines, foco y rejilla | OK | `styles/temas.test.ts`; no certifica superficies renderizadas ni teselas |
| TEM-05 | Legibilidad real, gráficos, mapa y popups en ambos temas | PENDIENTE | Matriz visual del apartado 5 |
| ACC-01 | Nombres accesibles, estados textuales/status/alert, menú y etiquetas | OK | `ui.test.tsx`, `AppLayout.test.tsx`, consultas por rol/etiqueta de las pantallas |
| ACC-02 | Tab/Enter/Espacio y conservación de foco del selector de tema | OK | `SelectorTema.test.tsx`; ejecución de userEvent en jsdom |
| ACC-03 | Recorrido integral por teclado, foco visible real y lector de pantalla | PENDIENTE | Sin navegador; las pruebas DOM no acreditan todo el recorrido |
| SEG-01 | Sin token/desconocido, campo ausente/vacío/repetido/ajeno | OK | `alcance.test.ts`, `sensores-alcance.test.ts`, `mapa-alertas-alcance.test.ts`, `api/campos.test.ts` |
| SEG-02 | Parámetro cliente_id y preferencias alteradas no otorgan alcance ajeno | OK | `AuthContext.test.tsx`, `SelectorCampo.test.tsx`, pruebas de alcance |
| SEG-03 | Backend autentica y autoriza toda la cadena antes de devolver datos | BLOQUEADO | No se modifica ni se dispone de validación del backend en este alcance |
| DOC-01 | Instrucciones de Alertas consistentes con datos actuales | NO OK | Hallazgo A11-DOC-01 del apartado 7 |

Los nombres de archivo abreviados de esta tabla se expanden a su ruta y caso
exactos en el inventario automatizado siguiente. Un OK automatizado no aprueba
la variante visual del mismo escenario.

## 4. Resultados automatizados

Los comandos de las tres suites fueron `npm.cmd test` con reporteros `default`
y `json` para conservar evidencia, sin cambiar la selección de pruebas. Los
reportes JSON están en `suite-1.json.log`, `suite-2.json.log` y `suite-3.json.log`.
Sus logs de consola son `suite-1.log`, `suite-2.log` y `suite-3.log`.

| Orden | Ejecución | Resultado | Evidencia |
| --- | --- | --- | --- |
| 1 | Suite independiente 1, 11:44:25; 15,73 s | OK — 321/321, 38 archivos | `test-results/a11/suite-1.log` |
| 2 | Suite independiente 2, 11:45:34; 18,05 s | OK — 321/321, 38 archivos | `test-results/a11/suite-2.log` |
| 3 | Suite independiente 3, 11:46:26; 52,45 s | OK — 321/321, 38 archivos | `test-results/a11/suite-3.log` |
| 4 | `npm.cmd run lint`, ejecución final posterior a la suite 3 | OK — código 0 | `test-results/a11/lint.log` |
| 5 | `npm.cmd run build` | OK — código 0, TypeScript y Vite completos | `test-results/a11/build.log` |
| 6 | `git diff --check` | OK — código 0, sin errores | `test-results/a11/diff-check.log` |

Hubo una ejecución adicional de lint con código 0 que se inició mientras aún
terminaba la tercera suite. No se la usa para acreditar la secuencia solicitada:
se repitió lint después de terminar ambas. Se conserva en `lint-adicional.log`.
Las tres suites se ejecutaron sin superposición entre sí.

No hubo errores intermitentes que investigar en esta sesión. La variación de
duración no produjo fallos. A10.1 conserva su aislamiento de MSW por caso y sus
esperas de persistencia. No se ajustaron timeouts, concurrencia ni reintentos.

### Inventario completo de casos ejecutados

321 casos únicos, todos OK en las tres ejecuciones. Los reportes JSON contienen
el nombre completo de cada caso y su estado; los nombres parametrizados se conservan.

| ID | Módulo / archivo | Escenario ejecutado | Resultado | Evidencia |
| --- | --- | --- | --- | --- |
| AUTO-001 | [src/api/campos.test.ts](../src/api/campos.test.ts) | campos del cliente autenticado consulta únicamente los campos asociados a token-demo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-002 | [src/api/campos.test.ts](../src/api/campos.test.ts) | campos del cliente autenticado consulta únicamente los campos asociados a token-demo-lucia | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-003 | [src/api/campos.test.ts](../src/api/campos.test.ts) | campos del cliente autenticado el mock ignora un cliente elegido en la URL y utiliza el token | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-004 | [src/api/campos.test.ts](../src/api/campos.test.ts) | campos del cliente autenticado no llama endpoints demo sin mocks | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-005 | [src/api/campos.test.ts](../src/api/campos.test.ts) | campos del cliente autenticado rechaza respuestas inválidas: {"campos":[{"campo_id":"","nombre":"El Molino","cliente_id":"cliente_horizonte_verde"}]} | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-006 | [src/api/campos.test.ts](../src/api/campos.test.ts) | campos del cliente autenticado rechaza respuestas inválidas: {"campos":[{"campo_id":"campo_el_molino","nombre":"","cliente_id":"cliente_horizonte_verde"}]} | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-007 | [src/api/campos.test.ts](../src/api/campos.test.ts) | campos del cliente autenticado rechaza respuestas inválidas: {"campos":[{"campo_id":"campo_el_molino","nombre":"El Molino","cliente_id":"cliente_horizonte_verde"},{"campo_id":"campo_el_molino","nombre":"El Molino","cliente_id":"cliente_horizonte_verde"}]} | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-008 | [src/api/campos.test.ts](../src/api/campos.test.ts) | campos del cliente autenticado rechaza respuestas inválidas: {"campos":[{"campo_id":"campo_la_ribera","nombre":"La Ribera","cliente_id":"cliente_los_aromos"}]} | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-009 | [src/api/campos.test.ts](../src/api/campos.test.ts) | campos del cliente autenticado rechaza respuestas inválidas: {"campos":null} | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-010 | [src/api/campos.test.ts](../src/api/campos.test.ts) | campos del cliente autenticado rechaza tokens desconocidos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-011 | [src/api/client.test.ts](../src/api/client.test.ts) | apiFetch con sinSesion no manda el token aunque exista | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-012 | [src/api/client.test.ts](../src/api/client.test.ts) | apiFetch devuelve el JSON y manda el token cuando hay sesión | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-013 | [src/api/client.test.ts](../src/api/client.test.ts) | apiFetch no manda Authorization si no hay sesión | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-014 | [src/api/client.test.ts](../src/api/client.test.ts) | apiFetch sin conexión lanza ErrorApi con estado null | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-015 | [src/api/client.test.ts](../src/api/client.test.ts) | apiFetch un 401 del login no cierra la sesión | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-016 | [src/api/client.test.ts](../src/api/client.test.ts) | apiFetch un 401 fuera del login cierra la sesión y avisa | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-017 | [src/api/client.test.ts](../src/api/client.test.ts) | apiFetch un POST manda el cuerpo como JSON | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-018 | [src/api/client.test.ts](../src/api/client.test.ts) | apiFetch un error HTTP lanza ErrorApi con el estado y el mensaje del servidor | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-019 | [src/api/client.test.ts](../src/api/client.test.ts) | conParametros arma la query y sasaltea los parámetros sin valor | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-020 | [src/api/client.test.ts](../src/api/client.test.ts) | conParametros sin parámetros devuelve la ruta sola | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-021 | [src/api/login.test.ts](../src/api/login.test.ts) | loginGoogleDemo no envía un token previo ni credenciales al endpoint demo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-022 | [src/api/login.test.ts](../src/api/login.test.ts) | loginGoogleDemo no realiza solicitudes sin mocks (TRUE) | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-023 | [src/api/login.test.ts](../src/api/login.test.ts) | loginGoogleDemo no realiza solicitudes sin mocks (false) | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-024 | [src/api/login.test.ts](../src/api/login.test.ts) | loginGoogleDemo no realiza solicitudes sin mocks (undefined) | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-025 | [src/api/login.test.ts](../src/api/login.test.ts) | loginGoogleDemo recibe del mock una sesión demo sin credenciales | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-026 | [src/api/login.test.ts](../src/api/login.test.ts) | recuperarIdentidadDemo no consulta endpoints demo cuando los mocks están apagados | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-027 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente Google simulado usa la identidad demo de Ana | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-028 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente al cambiar de usuario no conserva nombres, cliente ni token de la sesión anterior | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-029 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente cerrar sesión limpia token e identidad y no recupera al recargar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-030 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente el mock ignora el cliente suministrado junto con las credenciales | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-031 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente ignora la identidad de otra cuenta si no corresponde al token demo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-032 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente invalida una sesión no recuperable: desconocido | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-033 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente invalida una sesión no recuperable: identidad-invalida | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-034 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente invalida una sesión no recuperable: offline | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-035 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente login tradicional: ana.rios@horizonte-verde.example conserva su identidad y cliente | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-036 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente login tradicional: demo@agro.com conserva su identidad y cliente | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-037 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente login tradicional: lucia.vega@los-aromos.example conserva su identidad y cliente | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-038 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente mantiene el contrato real con solo token sin inventar un cliente | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-039 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente no envía una sesión demo al modo sin mocks | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-040 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente recupera la identidad bajo StrictMode, como en la aplicación real | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-041 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente recupera token-demo al recargar, consultando el mock | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-042 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente recupera token-demo-lucia al recargar, consultando el mock | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-043 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente un 401 de la API limpia toda la identidad y avisa que la sesión expiró | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-044 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente una recuperación tardía no revive la sesión tras expiracion | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-045 | [src/app/AuthContext.test.tsx](../src/app/AuthContext.test.tsx) | sesión con usuario y cliente una recuperación tardía no revive la sesión tras salida | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-046 | [src/app/CampoFiltrado.test.tsx](../src/app/CampoFiltrado.test.tsx) | Dashboard y Áreas con el selector real actualiza el Dashboard al cambiar de campo y no inventa datos en el vacío | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-047 | [src/app/CampoFiltrado.test.tsx](../src/app/CampoFiltrado.test.tsx) | Dashboard y Áreas con el selector real actualiza Áreas y mantiene la selección al navegar entre ambas pantallas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-048 | [src/app/CampoFiltrado.test.tsx](../src/app/CampoFiltrado.test.tsx) | Dashboard y Áreas con el selector real descarta respuestas tardías de areas del campo anterior | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-049 | [src/app/CampoFiltrado.test.tsx](../src/app/CampoFiltrado.test.tsx) | Dashboard y Áreas con el selector real descarta respuestas tardías de dashboard del campo anterior | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-050 | [src/app/CampoFiltrado.test.tsx](../src/app/CampoFiltrado.test.tsx) | Dashboard y Áreas con el selector real el cambio de cliente reemplaza métricas, áreas y alertas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-051 | [src/app/CampoFiltrado.test.tsx](../src/app/CampoFiltrado.test.tsx) | Dashboard y Áreas con el selector real el detalle se invalida al seleccionar un campo al que el área no pertenece | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-052 | [src/app/CampoFiltrado.test.tsx](../src/app/CampoFiltrado.test.tsx) | Dashboard y Áreas con el selector real no muestra datos de un área de otro cliente al entrar directamente por URL | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-053 | [src/app/CampoFiltrado.test.tsx](../src/app/CampoFiltrado.test.tsx) | Dashboard y Áreas con el selector real no realiza consultas globales si el cliente no tiene campos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-054 | [src/app/CampoFiltrado.test.tsx](../src/app/CampoFiltrado.test.tsx) | Dashboard y Áreas con el selector real un error al cambiar areas no conserva datos del campo anterior y permite reintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-055 | [src/app/CampoFiltrado.test.tsx](../src/app/CampoFiltrado.test.tsx) | Dashboard y Áreas con el selector real un error al cambiar dashboard no conserva datos del campo anterior y permite reintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-056 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales Alertas consulta las áreas del campo y conserva la aplicación de filtros | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-057 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales cambiar de cliente reemplaza los datos de alertas y su contador | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-058 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales cambiar de cliente reemplaza los datos de mapa y su contador | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-059 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales descarta respuestas tardías de alertas, incluido el contador | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-060 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales descarta respuestas tardías de mapa, incluido el contador | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-061 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales el catálogo de áreas tardío no repone opciones del campo anterior | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-062 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales el mapa recibe solo marcadores propios y sus filtros contienen solo áreas del campo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-063 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales limpia filtros del mapa y actualiza el contador al cambiar de campo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-064 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales no consulta datos globales ni contadores sin campo: alertas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-065 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales no consulta datos globales ni contadores sin campo: mapa | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-066 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales un error en el nuevo campo no conserva datos previos de alertas y permite reintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-067 | [src/app/MapaAlertasCampo.test.tsx](../src/app/MapaAlertasCampo.test.tsx) | Mapa, Alertas y contador con campo e identidad reales un error en el nuevo campo no conserva datos previos de mapa y permite reintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-068 | [src/app/RutasProtegidas.test.tsx](../src/app/RutasProtegidas.test.tsx) | protección de rutas con sesión, /login redirige al dashboard | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-069 | [src/app/RutasProtegidas.test.tsx](../src/app/RutasProtegidas.test.tsx) | protección de rutas con sesión, entra a la ruta protegida | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-070 | [src/app/RutasProtegidas.test.tsx](../src/app/RutasProtegidas.test.tsx) | protección de rutas sin sesión, una ruta protegida redirige a /login | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-071 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión bloquea por URL directa un sensor de otro cliente:  | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-072 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión bloquea por URL directa un sensor de otro cliente: /historico | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-073 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión elimina los datos al cambiar a otro campo del mismo cliente:  | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-074 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión elimina los datos al cambiar a otro campo del mismo cliente: /historico | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-075 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión no consulta sensores sin un campo disponible:  | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-076 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión no consulta sensores sin un campo disponible: /historico | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-077 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión no muestra metadatos de navegación sin validar primero el histórico | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-078 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión permite ir del sensor propio a su histórico con las mediciones y filtros existentes | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-079 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión trata una respuesta 403 como acceso no disponible:  | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-080 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión trata una respuesta 403 como acceso no disponible: /historico | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-081 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión un cambio rápido descarta las respuestas tardías de historico | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-082 | [src/app/SensorCampo.test.tsx](../src/app/SensorCampo.test.tsx) | sensor e histórico con el campo de la sesión un cambio rápido descarta las respuestas tardías de sensor | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-083 | [src/app/TemaIntegracion.test.tsx](../src/app/TemaIntegracion.test.tsx) | tema independiente de sesión y campo aplica la preferencia guardada al Login sin necesitar una sesión | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-084 | [src/app/TemaIntegracion.test.tsx](../src/app/TemaIntegracion.test.tsx) | tema independiente de sesión y campo conserva el tema al navegar, recargar, cerrar sesión y volver a ingresar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-085 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema alterna en ambos sentidos y recupera la preferencia al iniciar de nuevo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-086 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema descarta una preferencia inválida:  | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-087 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema descarta una preferencia inválida: CLARO | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-088 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema descarta una preferencia inválida: dark | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-089 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema descarta una preferencia inválida: light | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-090 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema descarta una preferencia inválida: {"tema":"claro"} | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-091 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema el arranque previo a React aplica la misma preferencia: claro | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-092 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema el arranque previo a React aplica la misma preferencia: oscuro | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-093 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema el arranque previo a React aplica la misma preferencia: valor-invalido | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-094 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema notifica a todos los controles activos y permite cancelar la suscripción | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-095 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema permite cambiar en memoria si no se puede guardar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-096 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema usa oscuro si no puede leer el almacenamiento | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-097 | [src/app/tema.test.ts](../src/app/tema.test.ts) | preferencia centralizada de tema usa oscuro sin preferencia guardada | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-098 | [src/components/layout/AppLayout.test.tsx](../src/components/layout/AppLayout.test.tsx) | AppLayout Análisis/IA está deshabilitado, con la etiqueta Próximamente, y no es un enlace | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-099 | [src/components/layout/AppLayout.test.tsx](../src/components/layout/AppLayout.test.tsx) | AppLayout Cerrar sesión borra el token y vuelve al login | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-100 | [src/components/layout/AppLayout.test.tsx](../src/components/layout/AppLayout.test.tsx) | AppLayout el menú aparece en una ruta protegida | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-101 | [src/components/layout/AppLayout.test.tsx](../src/components/layout/AppLayout.test.tsx) | AppLayout el menú no aparece en /login | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-102 | [src/components/layout/AppLayout.test.tsx](../src/components/layout/AppLayout.test.tsx) | AppLayout en móvil, el botón Menú abre y cierra la navegación | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-103 | [src/components/layout/AppLayout.test.tsx](../src/components/layout/AppLayout.test.tsx) | AppLayout la insignia de Alertas muestra el total de alertas activas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-104 | [src/components/layout/AppLayout.test.tsx](../src/components/layout/AppLayout.test.tsx) | AppLayout la insignia no aparece cuando el total es 0 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-105 | [src/components/layout/AppLayout.test.tsx](../src/components/layout/AppLayout.test.tsx) | AppLayout si el pedido de alertas falla, la insignia se oculta y el menú sigue | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-106 | [src/components/layout/AppLayout.test.tsx](../src/components/layout/AppLayout.test.tsx) | AppLayout Áreas queda activa también en el detalle de un sensor | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-107 | [src/components/layout/Breadcrumb.test.tsx](../src/components/layout/Breadcrumb.test.tsx) | useBreadcrumb y Breadcrumb al desmontarse la página, las migas desaparecen | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-108 | [src/components/layout/Breadcrumb.test.tsx](../src/components/layout/Breadcrumb.test.tsx) | useBreadcrumb y Breadcrumb con tres niveles, los dos primeros son enlaces y el último no | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-109 | [src/components/layout/Breadcrumb.test.tsx](../src/components/layout/Breadcrumb.test.tsx) | useBreadcrumb y Breadcrumb sin etiqueta muestra un indicador de carga y luego el nombre | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-110 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado contempla un cliente sin campos sin bloquear la pantalla | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-111 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado descarta la preferencia inválida El Molino | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-112 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado descarta la preferencia inválida campo_inexistente | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-113 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado descarta la preferencia inválida campo_la_ribera | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-114 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado ignora la respuesta tardía del usuario anterior después de cambiar de cuenta | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-115 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado mantiene la selección en memoria si no puede guardarse la preferencia | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-116 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado muestra carga accesible sin exponer un campo hasta recibir la respuesta | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-117 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado muestra error y permite reintentar sin afectar el contenido principal | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-118 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado muestra solo los campos de token-demo y selecciona el primero | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-119 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado muestra solo los campos de token-demo-lucia y selecciona el primero | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-120 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado no acepta IDs ajenos ni inexistentes en el contexto | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-121 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado permite cambiar de campo y conserva la selección durante la navegación | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-122 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado rechaza una respuesta con campos de otro cliente | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-123 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado recupera la preferencia del cliente tras recargar y la valida contra la lista | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-124 | [src/components/layout/SelectorCampo.test.tsx](../src/components/layout/SelectorCampo.test.tsx) | selector de campos en el encabezado revalida la selección al cambiar de cuenta y conserva preferencias separadas por cliente | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-125 | [src/components/layout/SelectorTema.test.tsx](../src/components/layout/SelectorTema.test.tsx) | SelectorTema sincroniza todos los controles y conserva la selección al remontar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-126 | [src/components/layout/SelectorTema.test.tsx](../src/components/layout/SelectorTema.test.tsx) | SelectorTema tiene nombre accesible, ícono decorativo y funciona con teclado en ambos sentidos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-127 | [src/components/ui/ui.test.tsx](../src/components/ui/ui.test.tsx) | componentes de UI DemoBanner aparece solo con VITE_USE_MOCKS en true | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-128 | [src/components/ui/ui.test.tsx](../src/components/ui/ui.test.tsx) | componentes de UI EmptyState muestra título y descripción | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-129 | [src/components/ui/ui.test.tsx](../src/components/ui/ui.test.tsx) | componentes de UI ErrorBlock muestra el mensaje como alerta y llama a onReintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-130 | [src/components/ui/ui.test.tsx](../src/components/ui/ui.test.tsx) | componentes de UI SeverityBadge muestra la severidad con texto | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-131 | [src/components/ui/ui.test.tsx](../src/components/ui/ui.test.tsx) | componentes de UI Spinner anuncia la carga con role status y su etiqueta | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-132 | [src/components/ui/ui.test.tsx](../src/components/ui/ui.test.tsx) | componentes de UI StatusBadge muestra el estado con texto | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-133 | [src/hooks/useApi.test.ts](../src/hooks/useApi.test.ts) | useApi al cambiar los parámetros descarta los datos del pedido anterior | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-134 | [src/hooks/useApi.test.ts](../src/hooks/useApi.test.ts) | useApi al recargar conserva los datos anteriores mientras carga | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-135 | [src/hooks/useApi.test.ts](../src/hooks/useApi.test.ts) | useApi devuelve el error cuando el pedido falla | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-136 | [src/hooks/useApi.test.ts](../src/hooks/useApi.test.ts) | useApi pasa de cargando a éxito con los datos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-137 | [src/hooks/useApi.test.ts](../src/hooks/useApi.test.ts) | useApi si la recarga falla conserva los datos y queda desactualizado | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-138 | [src/hooks/useApi.test.ts](../src/hooks/useApi.test.ts) | useApi una respuesta vieja nunca reemplaza a la nueva | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-139 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | cantidad usa el plural para cero y para varios | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-140 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | cantidad usa el singular solo cuando el número es 1 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-141 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | formatFechaHora maneja fechas inválidas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-142 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | formatFechaHora muestra fecha y hora local con ceros iniciales | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-143 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | formatRelativo calcula minutos y horas con un reloj fijo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-144 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | formatRelativo muestra la fecha completa para lecturas antiguas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-145 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | formatRelativo no presenta una fecha futura como pasada | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-146 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | formatValor conserva una lectura real de cero | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-147 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | formatValor distingue una lectura ausente de cero | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-148 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | formatValor muestra temperaturas negativas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-149 | [src/lib/formato.test.ts](../src/lib/formato.test.ts) | formatValor usa coma decimal y conserva la unidad recibida | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-150 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas calcula datos reales de token-demo / campo_el_molino sin sumar otros campos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-151 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas calcula datos reales de token-demo / campo_la_esperanza sin sumar otros campos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-152 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas calcula datos reales de token-demo-lucia / campo_la_ribera sin sumar otros campos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-153 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas calcula datos reales de token-demo-lucia / campo_los_olivos sin sumar otros campos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-154 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas ignora el cliente elegido en la URL y usa el de la identidad | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-155 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas no revela un área ajena mediante /areas/campo_norte | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-156 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas no revela un área ajena mediante /areas/campo_norte/sensores | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-157 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas rechaza acceso sin sesión a /areas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-158 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas rechaza acceso sin sesión a /areas/campo_norte | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-159 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas rechaza acceso sin sesión a /areas/campo_norte/sensores | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-160 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas rechaza acceso sin sesión a /dashboard/resumen | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-161 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas valida el campo en consultas directas a /areas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-162 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas valida el campo en consultas directas a /areas/campo_norte | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-163 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas valida el campo en consultas directas a /areas/campo_norte/sensores | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-164 | [src/mocks/alcance.test.ts](../src/mocks/alcance.test.ts) | alcance por campo de Dashboard y Áreas valida el campo en consultas directas a /dashboard/resumen | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-165 | [src/mocks/alertas.test.ts](../src/mocks/alertas.test.ts) | GET /alertas (mock) devuelve el total de activas aunque limit sea 1 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-166 | [src/mocks/alertas.test.ts](../src/mocks/alertas.test.ts) | GET /alertas (mock) filtra por área | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-167 | [src/mocks/alertas.test.ts](../src/mocks/alertas.test.ts) | GET /alertas (mock) ordena por severidad de alta a baja y, dentro de cada una, más reciente primero | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-168 | [src/mocks/alertas.test.ts](../src/mocks/alertas.test.ts) | GET /alertas (mock) rechaza un limit fuera de rango con 400 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-169 | [src/mocks/areas.test.ts](../src/mocks/areas.test.ts) | GET /areas (mock) cuenta sensores, conectados, desconectados y alertas activas de cada área | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-170 | [src/mocks/areas.test.ts](../src/mocks/areas.test.ts) | GET /areas (mock) devuelve las áreas del campo seleccionado | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-171 | [src/mocks/areas.test.ts](../src/mocks/areas.test.ts) | GET /areas (mock) la última actualización de cada área es la comunicación más reciente de sus sensores | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-172 | [src/mocks/dashboard.test.ts](../src/mocks/dashboard.test.ts) | GET /dashboard/resumen (mock) devuelve las cantidades generales | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-173 | [src/mocks/dashboard.test.ts](../src/mocks/dashboard.test.ts) | GET /dashboard/resumen (mock) devuelve las últimas alertas del campo, la más reciente primero | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-174 | [src/mocks/dashboard.test.ts](../src/mocks/dashboard.test.ts) | GET /dashboard/resumen (mock) la última actualización es la comunicación más reciente de los sensores | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-175 | [src/mocks/dashboard.test.ts](../src/mocks/dashboard.test.ts) | GET /dashboard/resumen (mock) las áreas suman los totales generales | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-176 | [src/mocks/dashboard.test.ts](../src/mocks/dashboard.test.ts) | GET /dashboard/resumen (mock) resume cada área con sus sensores y alertas activas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-177 | [src/mocks/data/db.test.ts](../src/mocks/data/db.test.ts) | datos de ejemplo los conteos por área coinciden con la guía | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-178 | [src/mocks/data/db.test.ts](../src/mocks/data/db.test.ts) | datos de ejemplo los identificadores van en minúsculas y con guion bajo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-179 | [src/mocks/data/db.test.ts](../src/mocks/data/db.test.ts) | datos de ejemplo tiene 11 sensores conectados y 4 desconectados | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-180 | [src/mocks/data/db.test.ts](../src/mocks/data/db.test.ts) | datos de ejemplo tiene 4 áreas, 15 sensores y 6 alertas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-181 | [src/mocks/data/db.test.ts](../src/mocks/data/db.test.ts) | datos de ejemplo tiene 5 alertas activas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-182 | [src/mocks/data/db.test.ts](../src/mocks/data/db.test.ts) | datos de ejemplo un sensor que nunca comunicó figura desconectado y sin fecha | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-183 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarMedicion coincide con db.ts para todos los sensores y conserva la hora de referencia | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-184 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarMedicion conserva los casos especiales sin convertir ausencias en cero | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-185 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarMedicion produce lecturas reproducibles con unidades y un reloj común | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-186 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarMedicion rechaza sensores inexistentes | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-187 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarMedicion respeta cambios en la base compartida sin una tabla propia de sensores | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-188 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarSerie devuelve vacío sin mediciones o fuera de la ventana disponible | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-189 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarSerie limita resultados, ordena por fecha y avisa el truncamiento | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-190 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarSerie mantiene los mismos valores al cambiar el filtro temporal | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-191 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarSerie no marca truncamiento si el límite coincide con la cantidad disponible | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-192 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarSerie representa el hueco de seis horas con null | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-193 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarSerie termina en la última comunicación de sensor_005 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-194 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarSerie termina en la última comunicación de sensor_008 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-195 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarSerie termina en la última comunicación de sensor_015 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-196 | [src/mocks/data/generadores.test.ts](../src/mocks/data/generadores.test.ts) | generarSerie valida fechas, orden del rango, variable y límite | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-197 | [src/mocks/data/multicliente.test.ts](../src/mocks/data/multicliente.test.ts) | datos simulados multicliente consulta por identificadores y conserva los registros compartidos como única fuente de datos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-198 | [src/mocks/data/multicliente.test.ts](../src/mocks/data/multicliente.test.ts) | datos simulados multicliente distingue campos vacíos de IDs desconocidos y no agrega entidades de respaldo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-199 | [src/mocks/data/multicliente.test.ts](../src/mocks/data/multicliente.test.ts) | datos simulados multicliente no tiene usuarios, campos, áreas, sensores ni alertas con referencias inexistentes | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-200 | [src/mocks/data/multicliente.test.ts](../src/mocks/data/multicliente.test.ts) | datos simulados multicliente permite recorrer cada jerarquía sin duplicar ni compartir sensores entre clientes | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-201 | [src/mocks/data/multicliente.test.ts](../src/mocks/data/multicliente.test.ts) | datos simulados multicliente tiene al menos dos clientes, dos campos por cliente y usuarios de distintos clientes | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-202 | [src/mocks/data/multicliente.test.ts](../src/mocks/data/multicliente.test.ts) | datos simulados multicliente todas las entidades tienen identificadores únicos, no vacíos y sin colisiones entre campos y áreas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-203 | [src/mocks/escenarios.test.ts](../src/mocks/escenarios.test.ts) | escenarioPara error responde 500 con el cuerpo { error } | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-204 | [src/mocks/escenarios.test.ts](../src/mocks/escenarios.test.ts) | escenarioPara error-reintento: el primer pedido sale bien y los siguientes fallan | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-205 | [src/mocks/escenarios.test.ts](../src/mocks/escenarios.test.ts) | escenarioPara un escenario limitado a otro endpoint no aplica | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-206 | [src/mocks/escenarios.test.ts](../src/mocks/escenarios.test.ts) | escenarioPara vacío devuelve el aviso de lista vacía | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-207 | [src/mocks/escenarios.test.ts](../src/mocks/escenarios.test.ts) | interpretarEscenario ignora un endpoint desconocido | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-208 | [src/mocks/escenarios.test.ts](../src/mocks/escenarios.test.ts) | interpretarEscenario ignora un escenario desconocido | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-209 | [src/mocks/escenarios.test.ts](../src/mocks/escenarios.test.ts) | interpretarEscenario lee un escenario limitado a un endpoint | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-210 | [src/mocks/escenarios.test.ts](../src/mocks/escenarios.test.ts) | interpretarEscenario lee un escenario para todos los endpoints | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-211 | [src/mocks/escenarios.test.ts](../src/mocks/escenarios.test.ts) | interpretarEscenario sin valor es normal | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-212 | [src/mocks/login.test.ts](../src/mocks/login.test.ts) | POST /auth/login (mock) devuelve un token con las credenciales de prueba | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-213 | [src/mocks/login.test.ts](../src/mocks/login.test.ts) | POST /auth/login (mock) rechaza un email desconocido con 401 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-214 | [src/mocks/login.test.ts](../src/mocks/login.test.ts) | POST /auth/login (mock) rechaza una contraseña incorrecta con 401 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-215 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas conserva severidad, estado, tipo, rango y límites dentro del campo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-216 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas devuelve solo sensores y alertas de token-demo / campo_el_molino | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-217 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas devuelve solo sensores y alertas de token-demo / campo_la_esperanza | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-218 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas devuelve solo sensores y alertas de token-demo-lucia / campo_la_ribera | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-219 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas devuelve solo sensores y alertas de token-demo-lucia / campo_los_olivos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-220 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas el antiguo catálogo auxiliar tampoco devuelve datos globales | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-221 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas no genera mediciones antes de autorizar y no confía en cliente_id | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-222 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas rechaza consultas directas sin identidad o con alcance inválido: /alertas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-223 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas rechaza consultas directas sin identidad o con alcance inválido: /alertas/areas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-224 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas rechaza consultas directas sin identidad o con alcance inválido: /mapa/sensores | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-225 | [src/mocks/mapa-alertas-alcance.test.ts](../src/mocks/mapa-alertas-alcance.test.ts) | alcance de Mapa y Alertas rechaza áreas ajenas o inexistentes sin convertirlas en un filtro autorizado | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-226 | [src/mocks/sensores-alcance.test.ts](../src/mocks/sensores-alcance.test.ts) | alcance compartido de sensores, mediciones e históricos conserva lecturas y serie del sensor propio token-demo / campo_el_molino / sensor_014 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-227 | [src/mocks/sensores-alcance.test.ts](../src/mocks/sensores-alcance.test.ts) | alcance compartido de sensores, mediciones e históricos conserva lecturas y serie del sensor propio token-demo-lucia / campo_la_ribera / sensor_005 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-228 | [src/mocks/sensores-alcance.test.ts](../src/mocks/sensores-alcance.test.ts) | alcance compartido de sensores, mediciones e históricos conserva null y la serie vacía de un sensor propio que nunca comunicó | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-229 | [src/mocks/sensores-alcance.test.ts](../src/mocks/sensores-alcance.test.ts) | alcance compartido de sensores, mediciones e históricos mantiene las validaciones de variable, período y límite para sensores autorizados | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-230 | [src/mocks/sensores-alcance.test.ts](../src/mocks/sensores-alcance.test.ts) | alcance compartido de sensores, mediciones e históricos no ejecuta generadores ni revela filtros inválidos antes de autorizar el sensor | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-231 | [src/mocks/sensores-alcance.test.ts](../src/mocks/sensores-alcance.test.ts) | alcance compartido de sensores, mediciones e históricos un sensor inexistente no se confunde con uno propio sin mediciones | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-232 | [src/mocks/sensores-alcance.test.ts](../src/mocks/sensores-alcance.test.ts) | alcance compartido de sensores, mediciones e históricos valida la sesión y el campo también en consultas directas a /sensores/sensor_014 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-233 | [src/mocks/sensores-alcance.test.ts](../src/mocks/sensores-alcance.test.ts) | alcance compartido de sensores, mediciones e históricos valida la sesión y el campo también en consultas directas a /sensores/sensor_014/historico?variable=humedad&desde=2026-10-01&hasta=2026-10-31 | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-234 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage AC1: filtra por severidad | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-235 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage AC1: filtra por tipo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-236 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage AC1: filtra por área | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-237 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage AC1: lista las alertas activas con la de mayor severidad primero | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-238 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage AC2: sin alertas muestra el estado vacío positivo | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-239 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage AC3: al hacer clic en una alerta navega al sensor que la originó | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-240 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage editar un filtro no hace pedidos hasta aplicar y conserva el filtro al reintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-241 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage mientras carga muestra el estado de carga | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-242 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage ofrece recuperar el selector de áreas sin bloquear las alertas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-243 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage si falla el pedido de áreas, las alertas se siguen mostrando | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-244 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage si falla el pedido muestra el error y al reintentar conserva los filtros | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-245 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage si hay más alertas que las que se muestran, el contador lo aclara | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-246 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage si los filtros no encuentran nada lo dice y permite limpiarlos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-247 | [src/pages/AlertasPage/AlertasPage.test.tsx](../src/pages/AlertasPage/AlertasPage.test.tsx) | AlertasPage un área sin alertas activas lo dice y permite limpiar el filtro | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-248 | [src/pages/AreaDetallePage/AreaDetallePage.test.tsx](../src/pages/AreaDetallePage/AreaDetallePage.test.tsx) | detalle de área conserva el encabezado cuando falla la lista y permite reintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-249 | [src/pages/AreaDetallePage/AreaDetallePage.test.tsx](../src/pages/AreaDetallePage/AreaDetallePage.test.tsx) | detalle de área descarta la lista anterior al cambiar de área | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-250 | [src/pages/AreaDetallePage/AreaDetallePage.test.tsx](../src/pages/AreaDetallePage/AreaDetallePage.test.tsx) | detalle de área distingue un área inexistente de una lista vacía | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-251 | [src/pages/AreaDetallePage/AreaDetallePage.test.tsx](../src/pages/AreaDetallePage/AreaDetallePage.test.tsx) | detalle de área maneja sensores sin comunicación y sin ubicación | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-252 | [src/pages/AreaDetallePage/AreaDetallePage.test.tsx](../src/pages/AreaDetallePage/AreaDetallePage.test.tsx) | detalle de área muestra el encabezado sin esperar a la lista | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-253 | [src/pages/AreaDetallePage/AreaDetallePage.test.tsx](../src/pages/AreaDetallePage/AreaDetallePage.test.tsx) | detalle de área muestra sensores, desconexiones y alertas y navega al detalle | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-254 | [src/pages/AreasPage/AreasPage.test.tsx](../src/pages/AreasPage/AreasPage.test.tsx) | AreasPage AC1: cada tarjeta muestra sensores, conectados, desconectados y última actualización | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-255 | [src/pages/AreasPage/AreasPage.test.tsx](../src/pages/AreasPage/AreasPage.test.tsx) | AreasPage AC1: sin comunicación de ningún sensor, la última actualización dice "Sin datos" | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-256 | [src/pages/AreasPage/AreasPage.test.tsx](../src/pages/AreasPage/AreasPage.test.tsx) | AreasPage AC2: un área con alertas activas muestra su badge y una sin alertas no | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-257 | [src/pages/AreasPage/AreasPage.test.tsx](../src/pages/AreasPage/AreasPage.test.tsx) | AreasPage AC3: al hacer clic en una tarjeta navega al detalle del área | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-258 | [src/pages/AreasPage/AreasPage.test.tsx](../src/pages/AreasPage/AreasPage.test.tsx) | AreasPage mientras carga muestra las tarjetas de carga y después las reemplaza por los datos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-259 | [src/pages/AreasPage/AreasPage.test.tsx](../src/pages/AreasPage/AreasPage.test.tsx) | AreasPage si el cliente no tiene áreas muestra el mismo mensaje que el dashboard | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-260 | [src/pages/AreasPage/AreasPage.test.tsx](../src/pages/AreasPage/AreasPage.test.tsx) | AreasPage si falla la primera carga muestra el error y permite reintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-261 | [src/pages/AreasPage/AreasPage.test.tsx](../src/pages/AreasPage/AreasPage.test.tsx) | AreasPage si falla una actualización del listado vacío muestra el error y permite reintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-262 | [src/pages/AreasPage/AreasPage.test.tsx](../src/pages/AreasPage/AreasPage.test.tsx) | AreasPage si falla una actualización mantiene el listado anterior con el aviso de desactualizado | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-263 | [src/pages/DashboardPage/DashboardPage.test.tsx](../src/pages/DashboardPage/DashboardPage.test.tsx) | DashboardPage AC1: muestra las métricas, la última actualización, las áreas y las últimas alertas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-264 | [src/pages/DashboardPage/DashboardPage.test.tsx](../src/pages/DashboardPage/DashboardPage.test.tsx) | DashboardPage AC2: la tabla distingue áreas con alertas y sin alertas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-265 | [src/pages/DashboardPage/DashboardPage.test.tsx](../src/pages/DashboardPage/DashboardPage.test.tsx) | DashboardPage AC3: si falla el pedido muestra el error sin datos parciales y permite reintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-266 | [src/pages/DashboardPage/DashboardPage.test.tsx](../src/pages/DashboardPage/DashboardPage.test.tsx) | DashboardPage limita a cuatro las alertas visibles si el contrato entrega cinco | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-267 | [src/pages/DashboardPage/DashboardPage.test.tsx](../src/pages/DashboardPage/DashboardPage.test.tsx) | DashboardPage mientras carga muestra el estado de carga y después lo reemplaza por los datos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-268 | [src/pages/DashboardPage/DashboardPage.test.tsx](../src/pages/DashboardPage/DashboardPage.test.tsx) | DashboardPage muestra Inicio en el breadcrumb y enlaza las alertas al sensor | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-269 | [src/pages/DashboardPage/DashboardPage.test.tsx](../src/pages/DashboardPage/DashboardPage.test.tsx) | DashboardPage muestra las alertas recientes del campo sin incluir las de otro cliente | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-270 | [src/pages/DashboardPage/DashboardPage.test.tsx](../src/pages/DashboardPage/DashboardPage.test.tsx) | DashboardPage si el cliente no tiene áreas muestra el mensaje y no tarjetas en cero | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-271 | [src/pages/HistoricoPage/HistoricoPage.test.tsx](../src/pages/HistoricoPage/HistoricoPage.test.tsx) | históricos aplica variable y fechas convertidas a UTC | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-272 | [src/pages/HistoricoPage/HistoricoPage.test.tsx](../src/pages/HistoricoPage/HistoricoPage.test.tsx) | históricos avisa cuando los resultados están truncados | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-273 | [src/pages/HistoricoPage/HistoricoPage.test.tsx](../src/pages/HistoricoPage/HistoricoPage.test.tsx) | históricos inicia con siete fechas locales y consulta hasta el fin del día | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-274 | [src/pages/HistoricoPage/HistoricoPage.test.tsx](../src/pages/HistoricoPage/HistoricoPage.test.tsx) | históricos muestra el 404 con enlace a Áreas y sin reintento | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-275 | [src/pages/HistoricoPage/HistoricoPage.test.tsx](../src/pages/HistoricoPage/HistoricoPage.test.tsx) | históricos muestra gráfico, unidades y tabla con huecos sin convertirlos a cero | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-276 | [src/pages/HistoricoPage/HistoricoPage.test.tsx](../src/pages/HistoricoPage/HistoricoPage.test.tsx) | históricos muestra vacío para sensor sin mediciones usando el handler real | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-277 | [src/pages/HistoricoPage/HistoricoPage.test.tsx](../src/pages/HistoricoPage/HistoricoPage.test.tsx) | históricos no hace pedidos cuando el rango es inválido | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-278 | [src/pages/HistoricoPage/HistoricoPage.test.tsx](../src/pages/HistoricoPage/HistoricoPage.test.tsx) | históricos permite reintentar un error de API | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-279 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage AC1: con credenciales válidas guarda la sesión y redirige al dashboard | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-280 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage AC2: con contraseña incorrecta muestra el mensaje genérico, vacía la contraseña y se queda en el login | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-281 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage AC2: con un usuario inexistente muestra el mismo mensaje, sin decir cuál dato falló | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-282 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage AC3: si el servidor no responde muestra el error de conexión y permite reintentar sin recargar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-283 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage AC3: un error 500 del servidor también se muestra como error de conexión | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-284 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage mientras envía, el botón queda deshabilitado con el spinner | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-285 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage si la sesión expiró, avisa en el login | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-286 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage un doble clic envía un solo pedido | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-287 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage: Google simulado ingresa sin completar credenciales, guarda la sesión demo y redirige al dashboard | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-288 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage: Google simulado maneja error de 401 y permite reintentar el ingreso Google | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-289 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage: Google simulado maneja error de conexion y permite reintentar el ingreso Google | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-290 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage: Google simulado maneja error de servidor y permite reintentar el ingreso Google | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-291 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage: Google simulado mantiene el ingreso tradicional y bloquea Google mientras se envían credenciales | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-292 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage: Google simulado muestra carga y bloquea dobles clics y el envío tradicional durante el ingreso Google | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-293 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage: Google simulado permite el login tradicional después de un fallo de Google | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-294 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage: Google simulado sin VITE_USE_MOCKS=true (TRUE) no permite el acceso Google | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-295 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage: Google simulado sin VITE_USE_MOCKS=true (false) no permite el acceso Google | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-296 | [src/pages/LoginPage/LoginPage.test.tsx](../src/pages/LoginPage/LoginPage.test.tsx) | LoginPage: Google simulado sin VITE_USE_MOCKS=true (undefined) no permite el acceso Google | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-297 | [src/pages/MapaPage/MapaPage.test.tsx](../src/pages/MapaPage/MapaPage.test.tsx) | mapa de sensores conserva el mapa base durante carga y error y permite reintentar | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-298 | [src/pages/MapaPage/MapaPage.test.tsx](../src/pages/MapaPage/MapaPage.test.tsx) | mapa de sensores filtra por área y conectividad sin mezclar sensores | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-299 | [src/pages/MapaPage/MapaPage.test.tsx](../src/pages/MapaPage/MapaPage.test.tsx) | mapa de sensores lista los sensores propios sin inventar marcadores cuando faltan todas las ubicaciones | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-300 | [src/pages/MapaPage/MapaPage.test.tsx](../src/pages/MapaPage/MapaPage.test.tsx) | mapa de sensores rechaza coordenadas inválidas y conserva ceros válidos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-301 | [src/pages/MapaPage/MapaPage.test.tsx](../src/pages/MapaPage/MapaPage.test.tsx) | mapa de sensores ubica los 7 sensores del campo con coordenadas y lista aparte el restante | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-302 | [src/pages/MapaPage/MapaPage.test.tsx](../src/pages/MapaPage/MapaPage.test.tsx) | mapa de sensores una respuesta vacía no genera pines | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-303 | [src/pages/SensorDetallePage/SensorDetallePage.test.tsx](../src/pages/SensorDetallePage/SensorDetallePage.test.tsx) | detalle del sensor distingue sensor inexistente de sensor sin lecturas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-304 | [src/pages/SensorDetallePage/SensorDetallePage.test.tsx](../src/pages/SensorDetallePage/SensorDetallePage.test.tsx) | detalle del sensor muestra seis variables con unidades y permite ir a históricos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-305 | [src/pages/SensorDetallePage/SensorDetallePage.test.tsx](../src/pages/SensorDetallePage/SensorDetallePage.test.tsx) | detalle del sensor muestra sin datos para conductividad ausente y admite ubicación ausente | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-306 | [src/pages/SensorDetallePage/SensorDetallePage.test.tsx](../src/pages/SensorDetallePage/SensorDetallePage.test.tsx) | detalle del sensor muestra skeleton mientras espera y recupera un error con reintento | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-307 | [src/pages/SensorDetallePage/SensorDetallePage.test.tsx](../src/pages/SensorDetallePage/SensorDetallePage.test.tsx) | detalle del sensor sin mediciones muestra vacío sin inventar ceros | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-308 | [src/pages/SensorDetallePage/SensorDetallePage.test.tsx](../src/pages/SensorDetallePage/SensorDetallePage.test.tsx) | detalle del sensor un sensor desconectado conserva sus últimas lecturas y fechas | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-309 | [src/styles/temas.test.ts](../src/styles/temas.test.ts) | contraste de tokens: claro conserva contraste en botones, insignia y símbolos de los pines | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-310 | [src/styles/temas.test.ts](../src/styles/temas.test.ts) | contraste de tokens: claro distingue foco y líneas de gráfico sobre las superficies | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-311 | [src/styles/temas.test.ts](../src/styles/temas.test.ts) | contraste de tokens: claro mantiene etiquetas de estado y avisos legibles sobre sus fondos mezclados | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-312 | [src/styles/temas.test.ts](../src/styles/temas.test.ts) | contraste de tokens: claro mantiene texto, texto secundario y enlaces legibles sobre las superficies principales | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-313 | [src/styles/temas.test.ts](../src/styles/temas.test.ts) | contraste de tokens: oscuro conserva contraste en botones, insignia y símbolos de los pines | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-314 | [src/styles/temas.test.ts](../src/styles/temas.test.ts) | contraste de tokens: oscuro distingue foco y líneas de gráfico sobre las superficies | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-315 | [src/styles/temas.test.ts](../src/styles/temas.test.ts) | contraste de tokens: oscuro mantiene etiquetas de estado y avisos legibles sobre sus fondos mezclados | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-316 | [src/styles/temas.test.ts](../src/styles/temas.test.ts) | contraste de tokens: oscuro mantiene texto, texto secundario y enlaces legibles sobre las superficies principales | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-317 | [src/types/dominio.test.ts](../src/types/dominio.test.ts) | modelos de dominio y compatibilidad del contrato acepta las respuestas de login actuales sin convertirlas en usuarios completos | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-318 | [src/types/dominio.test.ts](../src/types/dominio.test.ts) | modelos de dominio y compatibilidad del contrato conserva el área obligatoria en los sensores y las respuestas que la incluyen | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-319 | [src/types/dominio.test.ts](../src/types/dominio.test.ts) | modelos de dominio y compatibilidad del contrato conserva los identificadores string y exige identidad propia en cada entidad | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-320 | [src/types/dominio.test.ts](../src/types/dominio.test.ts) | modelos de dominio y compatibilidad del contrato exige una referencia única al padre mediante su identificador | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |
| AUTO-321 | [src/types/dominio.test.ts](../src/types/dominio.test.ts) | modelos de dominio y compatibilidad del contrato mantiene campo_id opcional solo en los DTO de áreas existentes | OK | Casos coincidentes aprobados en JSON 1, 2 y 3 |

## 5. Validaciones manuales y matriz visual

**Realizado:** lectura manual de código, contratos y tests; comparación de
conteos de los datos; revisión estática de roles, etiquetas, foco CSS, tokens,
cadena de alcance y limpieza/cancelación; consulta de disponibilidad del navegador.
No se realizó login manual ni navegación visual en esta sesión.

La herramienta de navegador/computer use devolvió exactamente `apps: []`,
`browsers: []`, y el error: `Computer Use native pipe is unavailable: failed to
connect native pipe: El sistema no puede encontrar el archivo especificado.
(os error 2)`. No se obtuvieron screenshots ni mediciones del viewport.
Registro de disponibilidad: `test-results/a11/navegador.log`.

La siguiente matriz conserva separados ambos temas y los tres tamaños. En cada
fila deben verificarse ausencia de desbordamiento de página, tipografía, contraste,
foco, etiquetas, controles deshabilitados y navegación por teclado. En pantallas
autenticadas incluye identidad, selector de campos, selector de tema y menú.
El scroll horizontal previsto de una tabla no debe confundirse con desbordamiento
de toda la página. No se ejecutaron estos casos.

| ID | Pantalla / ruta | Tema | Ancho | Resultado | Escenario y evidencia |
| --- | --- | --- | --- | --- | --- |
| VIS-01 | Login (/login) | oscuro | 1280 px | PENDIENTE | Formulario, Google demo, errores y preferencia heredada; sin navegador conectado |
| VIS-02 | Login (/login) | oscuro | 768 px | PENDIENTE | Formulario, Google demo, errores y preferencia heredada; sin navegador conectado |
| VIS-03 | Login (/login) | oscuro | 375 px | PENDIENTE | Formulario, Google demo, errores y preferencia heredada; sin navegador conectado |
| VIS-04 | Login (/login) | claro | 1280 px | PENDIENTE | Formulario, Google demo, errores y preferencia heredada; sin navegador conectado |
| VIS-05 | Login (/login) | claro | 768 px | PENDIENTE | Formulario, Google demo, errores y preferencia heredada; sin navegador conectado |
| VIS-06 | Login (/login) | claro | 375 px | PENDIENTE | Formulario, Google demo, errores y preferencia heredada; sin navegador conectado |
| VIS-07 | Dashboard (/dashboard) | oscuro | 1280 px | PENDIENTE | Métricas, áreas, alertas recientes y vacío; sin navegador conectado |
| VIS-08 | Dashboard (/dashboard) | oscuro | 768 px | PENDIENTE | Métricas, áreas, alertas recientes y vacío; sin navegador conectado |
| VIS-09 | Dashboard (/dashboard) | oscuro | 375 px | PENDIENTE | Métricas, áreas, alertas recientes y vacío; sin navegador conectado |
| VIS-10 | Dashboard (/dashboard) | claro | 1280 px | PENDIENTE | Métricas, áreas, alertas recientes y vacío; sin navegador conectado |
| VIS-11 | Dashboard (/dashboard) | claro | 768 px | PENDIENTE | Métricas, áreas, alertas recientes y vacío; sin navegador conectado |
| VIS-12 | Dashboard (/dashboard) | claro | 375 px | PENDIENTE | Métricas, áreas, alertas recientes y vacío; sin navegador conectado |
| VIS-13 | Áreas (/areas) | oscuro | 1280 px | PENDIENTE | Filtros, tarjetas/listado y actualización; sin navegador conectado |
| VIS-14 | Áreas (/areas) | oscuro | 768 px | PENDIENTE | Filtros, tarjetas/listado y actualización; sin navegador conectado |
| VIS-15 | Áreas (/areas) | oscuro | 375 px | PENDIENTE | Filtros, tarjetas/listado y actualización; sin navegador conectado |
| VIS-16 | Áreas (/areas) | claro | 1280 px | PENDIENTE | Filtros, tarjetas/listado y actualización; sin navegador conectado |
| VIS-17 | Áreas (/areas) | claro | 768 px | PENDIENTE | Filtros, tarjetas/listado y actualización; sin navegador conectado |
| VIS-18 | Áreas (/areas) | claro | 375 px | PENDIENTE | Filtros, tarjetas/listado y actualización; sin navegador conectado |
| VIS-19 | Detalle de área (/areas/campo_norte) | oscuro | 1280 px | PENDIENTE | Sensores asociados y estados; sin navegador conectado |
| VIS-20 | Detalle de área (/areas/campo_norte) | oscuro | 768 px | PENDIENTE | Sensores asociados y estados; sin navegador conectado |
| VIS-21 | Detalle de área (/areas/campo_norte) | oscuro | 375 px | PENDIENTE | Sensores asociados y estados; sin navegador conectado |
| VIS-22 | Detalle de área (/areas/campo_norte) | claro | 1280 px | PENDIENTE | Sensores asociados y estados; sin navegador conectado |
| VIS-23 | Detalle de área (/areas/campo_norte) | claro | 768 px | PENDIENTE | Sensores asociados y estados; sin navegador conectado |
| VIS-24 | Detalle de área (/areas/campo_norte) | claro | 375 px | PENDIENTE | Sensores asociados y estados; sin navegador conectado |
| VIS-25 | Sensores (/sensores/sensor_014) | oscuro | 1280 px | PENDIENTE | Seis variables, unidades y navegación; sin navegador conectado |
| VIS-26 | Sensores (/sensores/sensor_014) | oscuro | 768 px | PENDIENTE | Seis variables, unidades y navegación; sin navegador conectado |
| VIS-27 | Sensores (/sensores/sensor_014) | oscuro | 375 px | PENDIENTE | Seis variables, unidades y navegación; sin navegador conectado |
| VIS-28 | Sensores (/sensores/sensor_014) | claro | 1280 px | PENDIENTE | Seis variables, unidades y navegación; sin navegador conectado |
| VIS-29 | Sensores (/sensores/sensor_014) | claro | 768 px | PENDIENTE | Seis variables, unidades y navegación; sin navegador conectado |
| VIS-30 | Sensores (/sensores/sensor_014) | claro | 375 px | PENDIENTE | Seis variables, unidades y navegación; sin navegador conectado |
| VIS-31 | Históricos (/sensores/sensor_014/historico) | oscuro | 1280 px | PENDIENTE | Fechas, Recharts, tooltip y tabla; sin navegador conectado |
| VIS-32 | Históricos (/sensores/sensor_014/historico) | oscuro | 768 px | PENDIENTE | Fechas, Recharts, tooltip y tabla; sin navegador conectado |
| VIS-33 | Históricos (/sensores/sensor_014/historico) | oscuro | 375 px | PENDIENTE | Fechas, Recharts, tooltip y tabla; sin navegador conectado |
| VIS-34 | Históricos (/sensores/sensor_014/historico) | claro | 1280 px | PENDIENTE | Fechas, Recharts, tooltip y tabla; sin navegador conectado |
| VIS-35 | Históricos (/sensores/sensor_014/historico) | claro | 768 px | PENDIENTE | Fechas, Recharts, tooltip y tabla; sin navegador conectado |
| VIS-36 | Históricos (/sensores/sensor_014/historico) | claro | 375 px | PENDIENTE | Fechas, Recharts, tooltip y tabla; sin navegador conectado |
| VIS-37 | Mapa (/mapa) | oscuro | 1280 px | PENDIENTE | Pines Leaflet, popups, área/conexión y sin ubicación; sin navegador conectado |
| VIS-38 | Mapa (/mapa) | oscuro | 768 px | PENDIENTE | Pines Leaflet, popups, área/conexión y sin ubicación; sin navegador conectado |
| VIS-39 | Mapa (/mapa) | oscuro | 375 px | PENDIENTE | Pines Leaflet, popups, área/conexión y sin ubicación; sin navegador conectado |
| VIS-40 | Mapa (/mapa) | claro | 1280 px | PENDIENTE | Pines Leaflet, popups, área/conexión y sin ubicación; sin navegador conectado |
| VIS-41 | Mapa (/mapa) | claro | 768 px | PENDIENTE | Pines Leaflet, popups, área/conexión y sin ubicación; sin navegador conectado |
| VIS-42 | Mapa (/mapa) | claro | 375 px | PENDIENTE | Pines Leaflet, popups, área/conexión y sin ubicación; sin navegador conectado |
| VIS-43 | Alertas (/alertas) | oscuro | 1280 px | PENDIENTE | Filtros, tabla, contador y reintento; sin navegador conectado |
| VIS-44 | Alertas (/alertas) | oscuro | 768 px | PENDIENTE | Filtros, tabla, contador y reintento; sin navegador conectado |
| VIS-45 | Alertas (/alertas) | oscuro | 375 px | PENDIENTE | Filtros, tabla, contador y reintento; sin navegador conectado |
| VIS-46 | Alertas (/alertas) | claro | 1280 px | PENDIENTE | Filtros, tabla, contador y reintento; sin navegador conectado |
| VIS-47 | Alertas (/alertas) | claro | 768 px | PENDIENTE | Filtros, tabla, contador y reintento; sin navegador conectado |
| VIS-48 | Alertas (/alertas) | claro | 375 px | PENDIENTE | Filtros, tabla, contador y reintento; sin navegador conectado |

Adicionalmente quedan PENDIENTES: navegación y zoom por teclado de Leaflet,
apertura/cierre/enlaces de sus popups, fallo real de teselas, tooltips de Recharts,
legibilidad de ejes, cambios de tema sin destellos y lectura con tecnología
asistiva. Las pruebas del mapa inspeccionan datos entregados a un sustituto de
`MapaSensores`, no el motor real. Las de Recharts usan el gráfico real con
ResizeObserver simulado, sin validar su geometría en pantalla.

### Recorrido manual preparado, todavía no ejecutado

Usar `VITE_USE_MOCKS=true` y el servidor de desarrollo existente, sin instalar
dependencias. Ana: `ana.rios@horizonte-verde.example`; Lucía:
`lucia.vega@los-aromos.example`; contraseña pública demo de ambas: `demo1234`.
El alias `demo@agro.com` y Google demo recuperan a Ana.

En cada tamaño, ingresar con Ana, recorrer las rutas de la matriz en ambos temas,
abrir pines/popups y tooltips, aplicar filtros y navegar solo con teclado. Cambiar
a La Esperanza debe vaciar Dashboard/Áreas/Mapa/Alertas y negar sensor_014 y su
histórico manteniendo su URL. Recargar debe conservar campo y tema. Salir e
ingresar con Lucía debe reemplazar identidad y campos; en La Ribera usar
sensor_005 (desconectado) y sensor_010 (sin mediciones), y comprobar que
sensor_014 no se revele. Los Olivos es su campo vacío. Repetir errores/carga
con los escenarios documentados en los módulos. Registrar captura, ancho,
tema, cuenta, campo y resultado de cada fila antes de cambiar PENDIENTE a OK.

## 6. Datos y contratos contrastados

| Usuario / campo | Áreas | Sensores | Conectados | Con ubicación | Alertas activas |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ana / El Molino | 2 | 8 | 7 | 7 | 2 |
| Ana / La Esperanza | 0 | 0 | 0 | 0 | 0 |
| Lucía / La Ribera | 2 | 7 | 4 | 7 | 3 |
| Lucía / Los Olivos | 0 | 0 | 0 | 0 | 0 |

Estos valores se verifican en `alcance.test.ts` y `mapa-alertas-alcance.test.ts`.
La última comunicación de El Molino es la referencia mock menos dos minutos;
la de La Ribera, menos un minuto; campos vacíos devuelven `null`. Las alertas
recientes pueden incluir resueltas: no deben confundirse con el contador de activas.

Se contrastaron los contratos actuales con `FILTRO-CAMPO.md`,
`SENSORES-HISTORICOS-CAMPO.md`, `MAPA-ALERTAS-CAMPO.md`, `SELECTOR-CAMPOS.md`,
`SESION-MULTICLIENTE.md`, los tipos DTO y los handlers:

| Método / recurso | Alcance y validación actuales |
| --- | --- |
| POST `/auth/login` | Credenciales demo; identidad asociada por mock, no por cliente_id del cuerpo |
| POST `/auth/google-demo` | Exclusivo de mocks; identidad demo de Ana, sin OAuth |
| POST `/auth/demo/sesion` | Recupera identidad del token demo enviado; valida relación usuario/cliente |
| GET `/auth/demo/campos` | Token → cliente → lista de campos; sin cliente elegido por URL |
| GET `/dashboard/resumen`, `/areas` | Token y un único campo_id autorizado; métricas/listados limitados al campo |
| GET `/areas/:areaId`, `/areas/:areaId/sensores` | Además valida pertenencia del área |
| GET `/sensores/:deviceId`, `/sensores/:deviceId/historico` | Además valida campo → área → sensor antes de generar lecturas/serie |
| GET `/mapa/sensores`, `/alertas` | Campo autorizado; mapa/alertas derivados de sus sensores |

Los recursos con campo usan 401 para sesión ausente/inválida, 400 para campo_id
ausente/vacío/repetido y 404 genérico para campo/recurso inexistente o ajeno.
El histórico valida variable, fechas, orden y límite; el mapa conserva sensores
sin ubicación fuera de sus pines; Alertas valida área, límite y fechas, y calcula
`total` antes del límite. El antiguo `/alertas/areas` ya no es un catálogo global.

Un campo del mismo cliente puede consultarse directamente si se solicita ese
campo y el recurso pertenece a él. La preferencia visual no es un permiso del
servidor: esto es coherente con los contratos documentados, no una fuga entre clientes.

## 7. Bugs y hallazgos

### A11-DOC-01 — Conteos antiguos en la guía de Alertas

- **Estado:** NO OK. Categoría: documentación; severidad **baja**, prioridad
  sugerida **P3** (corregir antes de usar esa guía como aceptación del multicliente).
- **Reproducción comprobada por lectura y pruebas:** leer el apartado “Probar”
  de `docs/ALERTAS.md`; indica login `demo@agro.com` y cinco alertas activas,
  tres altas y dos agronómicas. Ejecutar `npm.cmd test` y consultar los casos
  de `mapa-alertas-alcance.test.ts` y `AlertasPage.test.tsx`; con ese token y
  El Molino las aserciones ejecutadas verifican dos activas.
- **Esperado:** la guía actual debe indicar dos activas (una alta y una media;
  una técnica y una agronómica) o señalar explícitamente que los números de cinco
  corresponden al conjunto global anterior, no a la sesión actual.
- **Observado:** la guía presenta los conteos globales como resultado esperado
  de una prueba con la cuenta demo. `mocks/data/identidades.ts` asocia ese alias
  con Ana; los datos y los handlers actuales devuelven solo El Molino.
- **Impacto:** falso reporte de regresión o aceptación manual incorrecta.
  No evidencia un fallo en el filtrado funcional actual.
- **Acción:** tarea independiente de actualización documental. No corregido en A11.

No se confirmaron nuevos bugs funcionales en las ejecuciones realizadas.
La falta de navegador es un impedimento de QA, no un bug de la aplicación.
No se reutilizan capturas o aprobaciones de etapas anteriores como evidencia
de una revisión visual de la versión actual.

## 8. Riesgos, pendientes y recomendaciones para backend

| ID | Pendiente / riesgo | Estado | Severidad / prioridad sugerida |
| --- | --- | --- | --- |
| QA-VIS | Ejecutar las 48 combinaciones visuales y recorrido completo de teclado | PENDIENTE | Riesgo medio; P1 antes de aprobar UI |
| QA-MAP | Validar teselas, popups, foco y contraste de Leaflet real en ambos temas | PENDIENTE | Riesgo medio; P1 antes de aprobar Mapa |
| QA-AUTH | Autorización real por identidad y cadena cliente/campo/área/sensor | BLOQUEADO | Riesgo alto; P0 antes de producción con datos reales |
| QA-API | Integración real, recuperación de identidad/campos y expiración de credenciales | PENDIENTE | Riesgo alto; P1 antes de aceptación de integración |
| QA-A11Y | Lectores de pantalla y auditoría visual de contraste/foco | PENDIENTE | Riesgo medio; P1 antes de aceptación accesible |

Los tokens demo y los datos MSW son públicos y modificables en el navegador.
Cambiar a otro token demo conocido permite simular otra identidad: no se afirma
seguridad de producción. Las pruebas demuestran rechazo de recursos ajenos a
la identidad simulada vigente, no resistencia a falsificación de un token real.
`localStorage` guarda preferencias, no permisos; `sessionStorage` es accesible a JS.

Antes de integrar se recomienda:

1. Implementar y probar en backend autorización en cada recurso y cada consulta
   auxiliar, derivando cliente de la identidad y rechazando parámetros duplicados.
2. Acordar endpoint real de recuperación de identidad y catálogo de campos.
   Sin mocks, el selector actual queda no disponible: no hay fallback global
   que deba considerarse una integración real concluida.
3. Definir mecanismo de sesión, expiración/refresh, errores 401/403/404 y revocación;
   separar por completo Google demo de un futuro OAuth real.
4. Validar fechas, unidades, datos parciales, límites, paginación y contadores con
   respuestas reales. El umbral de desconexión y las mediciones siguen siendo demo.
5. Completar QA visual y accesibilidad en navegador, incluidas red lenta,
   desconexión, gráficos, tablas y estados vacíos, antes de aprobar el frontend.

Los documentos de A05–A09 describen estados incrementales: sus afirmaciones de
“pendiente para la próxima etapa” no deben leerse como contratos actuales aislados.
Este informe distingue esos antecedentes del comportamiento ejecutado hoy.

## 9. Conclusión

La regresión automatizada de A01–A10.2 es **OK** en tres ejecuciones independientes.
Se mantienen las 25 pruebas de temas, incluida la correspondencia de íconos de
A10.2 y la compatibilidad con campo/sesión. El hallazgo documental es **NO OK** y
se deja para una tarea independiente. El QA integral permanece **PENDIENTE** por
validaciones visuales y manuales sin ejecutar. No se declara listo para producción.
