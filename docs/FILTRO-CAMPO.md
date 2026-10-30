# Dashboard y Áreas por campo — A07

## Alcance de la interfaz

Dashboard, Áreas y el detalle de área consumen el `campoSeleccionado` de A06.
Mientras se obtienen los campos, o si no existe un campo disponible, no se
solicitan datos globales como alternativa. Se mantienen estados de carga, error
con reintento y ausencia de campos.

Al cambiar de campo se desmonta la consulta anterior y se inicia otra con el
nuevo ID. El `AbortSignal` y la comprobación de cancelación de `useApi` impiden
mostrar respuestas tardías. Cambiar de identidad reinicia también el provider de
A06. Las actualizaciones dentro del mismo campo conservan el comportamiento
existente: Áreas permite actualizar y retiene datos anteriores con un aviso si
falla una recarga; Dashboard muestra su resumen completo o el error.

El detalle de área valida tanto el encabezado como la consulta de sus sensores.
Una URL de área ajena al campo seleccionado muestra el estado no encontrado,
sin seleccionar automáticamente otro campo ni mostrar los sensores anteriores.

## Contratos para integrar con backend

Todos estos endpoints requieren el token de sesión y un único `campo_id`:

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | `/dashboard/resumen?campo_id=<id>` | `DashboardRespuesta` del campo |
| GET | `/areas?campo_id=<id>` | `AreasRespuesta` del campo |
| GET | `/areas/:areaId?campo_id=<id>` | `AreaDetalle` si pertenece al campo |
| GET | `/areas/:areaId/sensores?campo_id=<id>` | Sensores del área validada |

Los servicios reciben el ID explícitamente y lo codifican como query string.
No envían un cliente elegido por la interfaz. En MSW, `campoAutorizado()` obtiene
la identidad desde el token demo y verifica que el campo exista y pertenezca a
ese cliente. No consulta `localStorage` ni confía en la preferencia de A06.
Una consulta directa de otro campo del mismo cliente es válida si se pide
explícitamente ese campo; la selección de interfaz no es un permiso del servidor.

| Estado | Condición |
| --- | --- |
| 401 | Token ausente o desconocido; se aplica la expiración de sesión existente |
| 400 | `campo_id` ausente, vacío o repetido |
| 404 | Campo inexistente o de otro cliente; área inexistente o ajena al campo |

La validación del alcance ocurre antes de aplicar los escenarios de simulación.
Un parámetro adicional `cliente_id` no cambia el cliente de la identidad.
Los errores 404 son genéricos para no distinguir entidades ajenas de inexistentes.

## Cálculos y datos vacíos

Se reutilizan los registros de A04 y los generadores existentes, sin modificarlos.
Las áreas se consultan por `campo_id`; los sensores y alertas se obtienen solo
mediante esas áreas. Se preservan las fórmulas y el umbral de conexión anterior.

| Usuario / campo | Áreas | Sensores | Conectados | Desconectados | Alertas activas |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ana / El Molino | 2 | 8 | 7 | 1 | 2 |
| Ana / La Esperanza | 0 | 0 | 0 | 0 | 0 |
| Lucía / La Ribera | 2 | 7 | 4 | 3 | 3 |
| Lucía / Los Olivos | 0 | 0 | 0 | 0 | 0 |

Las alertas recientes del Dashboard se limitan al campo, se ordenan por fecha e
incluyen resueltas como antes. El handler entrega como máximo cinco y la pantalla
muestra como máximo cuatro. La fecha de última actualización solo usa las
comunicaciones de sus sensores; `ultima_actualizacion` ahora admite `null` si no
existen comunicaciones. Nunca se reemplaza por la hora actual en un campo vacío.
El Dashboard y Áreas conservan su estado vacío, sin inventar sensores ni lecturas.
Los resúmenes de áreas incluyen el `campo_id`, admitido en los DTO desde A03.

## Compatibilidad y límites explícitos

Alertas reutilizaba `/areas` para su filtro. Para mantener esa pantalla fuera del
cambio, se separa un adaptador `obtenerAreasParaAlertas()`: con mocks consulta
`/alertas/areas`, que conserva su catálogo global anterior; sin mocks mantiene
la ruta `/areas` del contrato real previo. Ese catálogo auxiliar no permite acceder
a los endpoints de detalle o Dashboard sin el campo y la identidad requeridos.

La única modificación de Alertas es ese ajuste de importación y llamada de
infraestructura compartida. Su listado, filtros y la insignia del menú siguen
teniendo el alcance previo. Sensores, Históricos, Mapa y los datos de Alertas no
se aíslan en A07. Por ello **no se afirma aislamiento seguro de toda la aplicación**
y el catálogo auxiliar global deberá migrarse junto con Alertas en su etapa.

El backend no cambia. Estos contratos y la autorización deben implementarse y
validarse allí antes de considerar seguro el aislamiento. Los tokens demo son
públicos. Sin un contrato real de campos, se mantiene la indisponibilidad del
selector descrita en A06; no se envía una consulta global desde estas pantallas.

## Pruebas y siguiente cambio

Las pruebas de alcance verifican ambos clientes, todos sus campos, agregaciones,
campos vacíos, autenticación, parámetros inválidos y consultas directas ajenas.
Las pruebas de integración usan AuthProvider, CampoProvider, selector y pantallas
reales para verificar cambios de campo y cliente, navegación, detalle directo,
errores con reintento y respuestas tardías incluso si una promesa termina después
de cancelarse. Las pruebas anteriores conservan la verificación de indicadores,
badges, enlaces, actualización y avisos de datos desactualizados con su nuevo alcance.

Para el siguiente cambio quedan el alcance de las demás pantallas, sus accesos
directos y consultas auxiliares, y la implementación de autorización en backend.
No se avanza con A08.
