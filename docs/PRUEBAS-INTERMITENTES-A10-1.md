# A10.1 — Pruebas intermitentes

Investigación del 30/10/2026, exclusivamente en `dev`. Los cambios de A10 ya
presentes en el árbol de trabajo se conservaron. No se hicieron commits ni push.

## Diagnóstico

Se revisaron `CampoFiltrado.test.tsx`, `SelectorCampo.test.tsx`, `CampoProvider`,
`AuthContext`, `useApi`, el cliente API, la configuración de Vitest, la preparación
de pruebas, el registro y los handlers de MSW y las pruebas nuevas de temas.

Se identificaron dos problemas distintos:

1. **Comprobación antes del efecto de persistencia.** `CampoProvider` calcula
   la selección durante el render y la escribe en `localStorage` mediante
   `useEffect`. Esperar el nombre en el `<select>` no garantiza que esa escritura
   haya ocurrido. La aserción inmediata podía recibir `null`; desmontar antes de
   comprobar la escritura también hacía depender la prueba de recarga del orden
   de los efectos.
2. **Intercepción de red sin aislamiento por caso.** Una traza temporal del error
   original de `fetch` mostró `TypeError: fetch failed`, con causa
   `AggregateError`, `ECONNREFUSED`, desde `internalConnectMultiple`. Ocurrió en
   `/auth/demo/campos`, antes de instalar el handler de error del caso de
   Dashboard. No era una respuesta de campos mal formada ni un error HTTP
   intencional: se intentaba una conexión real al servidor local.

   La preparación anterior mantenía MSW abierto para todo el archivo: reiniciaba
   handlers y contadores entre casos, pero conservaba el ciclo de intercepción
   de red. Los casos anteriores cancelan peticiones y simulan errores de red.
   Se revisó la implementación instalada de MSW 3 y sus interceptores: el fetch
   de Node pasa por sockets y su fuente HTTP conserva conexiones reutilizables
   y contexto asíncrono; su cierre dispone las conexiones inactivas. Reiniciar
   únicamente los handlers no equivale a reiniciar esos recursos.

   Se aisló ese ciclo por prueba. La observación confirma la conexión real
   indeseada y las ejecuciones posteriores verifican la corrección del aislamiento;
   no se atribuye el fallo a una línea concreta de las dependencias ni se modifica
   su implementación.

Vitest conserva su aislamiento por archivo y no habilita pruebas concurrentes
dentro de estos archivos. Los spies de API y de almacenamiento se restauran;
los componentes se desmontan antes de limpiar los recursos. El estado de sesión
se borra tras cada caso y los archivos afectados limpian `localStorage` antes y
después. Las pruebas de temas restauran sus spies y preferencias. No se encontró
un cambio de autenticación o de campos introducido por el selector de tema.

## Corrección mínima

- `src/test/setup.ts`: abre MSW en `beforeEach` y lo cierra en `afterEach`, después
  de desmontar React, reiniciar handlers/contadores y limpiar la sesión. Se mantiene
  `onUnhandledFrame: 'error'`; no se permiten solicitudes sin handler.
- `src/components/layout/SelectorCampo.test.tsx`: usa `waitFor` para comprobar
  las escrituras de preferencias, incluyendo la escritura anterior al desmontaje
  de la prueba de recarga. Se conservan todas las aserciones de selección y alcance.
- Este documento registra diagnóstico, cambios y resultados.

No se cambiaron `CampoFiltrado.test.tsx`, providers, servicios, handlers, temas,
configuración de Vitest ni funcionalidades. Las trazas temporales en servicios
se retiraron; los servicios quedaron iguales a `HEAD`. No se aumentaron timeouts,
no se eliminaron pruebas y no se configuraron reintentos automáticos.

## Ejecuciones de diagnóstico

Cada fila corresponde a un proceso independiente de Vitest, sin reintentos.

| Inicio local | Ejecución | Resultado |
| --- | --- | --- |
| 10:55:06 | CampoFiltrado, traza temporal de campos | OK, 10/10 |
| 10:55:54 | Suite completa, traza de campos | NO OK, 320/321; carga inicial de campos en Dashboard |
| 10:56:28 | Suite completa, traza del error original de fetch | OK, 321/321 |
| 10:57:09 | Suite completa, misma traza | OK, 321/321 |
| 10:57:42 | Suite completa, misma traza | OK, 321/321 |
| 10:58:24 | Suite completa, solo traza del fetch | NO OK, 320/321; se capturó ECONNREFUSED |
| 11:00:43 | Suite completa, aislamiento corregido, todavía con traza | OK, 321/321 |

Las ejecuciones verdes anteriores a la corrección no se contaron como validación
final: coexistieron con fallos y no demostraban una solución.

## Validación final

Se retiraron las trazas y se ejecutó secuencialmente:

| Orden | Comando | Resultado |
| --- | --- | --- |
| 1 | `npm.cmd test -- src/app/CampoFiltrado.test.tsx` | OK, 10/10; 11:01:10, 3,42 s |
| 2 | `npm.cmd test -- src/components/layout/SelectorCampo.test.tsx` | OK, 15/15; 11:01:20, 2,91 s |
| 3 | `npm.cmd test`, ejecución independiente 1 | OK, 321/321, 38 archivos; 11:01:28, 13,18 s |
| 4 | `npm.cmd test`, ejecución independiente 2 | OK, 321/321, 38 archivos; 11:02:06, 13,33 s |
| 5 | `npm.cmd test`, ejecución independiente 3 | OK, 321/321, 38 archivos; 11:02:39, 14,85 s |
| 6 | `npm.cmd run lint` | OK, código 0, sin errores |
| 7 | `npm.cmd run build` | OK, código 0; TypeScript y Vite completados |
| 8 | `git diff --check` | OK, código 0, sin errores de espacios |

Los logs de validación están en `test-results/a10-1/*.log`, ignorados por Git.

## A10 y límites

Las 25 pruebas de temas pasaron en las tres suites completas. Se conservaron
alternancia, oscuro predeterminado, persistencia, recuperación ante preferencias
inválidas, Login, teclado, contraste y compatibilidad con navegación/sesión/campo.

Las repeticiones verifican el escenario detectado; no constituyen una garantía
matemática contra cualquier intermitencia futura de Node/MSW. Si vuelve a fallar,
debe conservarse la causa original del fetch y la secuencia de peticiones antes
de cambiar tiempos o lógica de producto.

La revisión visual de A10 sigue pendiente tal como se registró en
`TEMAS-CLARO-OSCURO.md`; esta tarea no agrega evidencia visual. No se avanzó con A11.
