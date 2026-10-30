# Mapa y Alertas por cliente y campo — A09

## Alcance y datos

Las dos pantallas consumen `campoSeleccionado` de A06. Los handlers reutilizan
`campoAutorizado()` de A07/A08, que identifica al cliente desde el token demo y
valida el campo solicitado. `sensoresDelCampo()` reúne los sensores a través de
las áreas de ese campo, conservando el orden y los registros de la base compartida.
No se modifican los datos ni los generadores de mediciones.

| Cliente / campo | Sensores | Con ubicación | Alertas activas |
| --- | ---: | ---: | ---: |
| Horizonte Verde / El Molino | 8 | 7 | 2 |
| Horizonte Verde / La Esperanza | 0 | 0 | 0 |
| Los Aromos / La Ribera | 7 | 7 | 3 |
| Los Aromos / Los Olivos | 0 | 0 | 0 |

## Contratos para integrar con backend

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | `/mapa/sensores?campo_id=<id>` | `MapaRespuesta` con sensores del campo |
| GET | `/alertas?campo_id=<id>&...filtros` | `AlertasRespuesta` del campo y filtros |
| GET | `/areas?campo_id=<id>` | Catálogo de áreas del filtro de Alertas, contrato de A07 |

`campo_id` y el token son obligatorios. No se agregan campos a los formatos de
respuesta. El mapa conserva estado, coordenadas, última comunicación y últimas
mediciones. La búsqueda y generación de mediciones se hacen después de autorizar
el campo y solo sobre sus sensores.

Alertas limita primero sus registros a los IDs de sensores autorizados. Después
aplica `area_id`, `tipo`, `estado`, `severidad`, `desde`, `hasta` y `limit`, y conserva
el orden por severidad y fecha. `total` cuenta los resultados del campo con esos
filtros **antes** de aplicar el límite de filas. Se conservan los límites 50 por
defecto y 200 máximo, y las validaciones existentes de fechas.

Si se pide `area_id`, el área debe existir en el campo solicitado, incluso si
pertenece a otro campo del mismo cliente. En caso contrario se devuelve 404
genérico. La identidad se resuelve desde el token, nunca desde un `cliente_id`
elegido por parámetros o desde `localStorage`.

Se conserva la política de A07: 401 para sesión ausente/inválida, 400 para
`campo_id` ausente, vacío o repetido, y 404 para un campo inexistente o de otro
cliente. La validación precede a los escenarios de MSW y al acceso a los datos.

## Comportamiento de las pantallas

Mapa mantiene Leaflet, marcadores, estados, popups, enlaces y listas accesibles.
Solo se le entregan sensores del campo y los filtros locales por área y conexión
se aplican sobre ese conjunto. Las opciones de área derivan de esos sensores.
Un campo sin sensores no inventa marcadores; los sensores sin coordenadas siguen
en su listado, aunque no haya ningún marcador geolocalizado.

Alertas mantiene su vista actual de **activas**, filtros por área, tipo y severidad,
botones Aplicar/Limpiar, truncamiento, estados vacíos y reintentos. El servicio
continúa aceptando `estado=activa` o `estado=resuelta`; no se agrega un selector
de estado ni otra funcionalidad. Si falla el catálogo de áreas, las alertas del
campo siguen disponibles y se puede reintentar únicamente ese catálogo.

El contador del menú ahora consulta `estado=activa&limit=1&campo_id=<seleccionado>`
y usa `total`. No depende de los filtros de la tabla. Conserva su actualización
periódica cada 60 segundos y oculta la insignia si no hay campo, no hay activas,
se carga una nueva consulta o falla el pedido.

Cambiar de campo reinicia los filtros locales y las consultas de ambas pantallas.
Sus vistas se identifican por `campo_id`; el cambio de identidad reinicia además
el provider. Las señales se cancelan y `useApi` descarta respuestas tardías de
mapa, alertas, catálogo y contador. Mientras no hay un campo validado se muestran
los estados compartidos de carga/error/sin campos y no se consulta un listado
global como alternativa.

## Retiro de la compatibilidad global de A07

Alertas vuelve a usar el mismo servicio `obtenerAreas(campoId, signal)` que Áreas.
Se elimina `obtenerAreasParaAlertas()` y el handler global de `/alertas/areas`.
La aplicación ya no consulta esa URL. Incluso una llamada antigua que coincida
con el handler genérico de áreas de MSW pasa ahora por su validación de campo;
no permite recuperar el catálogo global sin sesión ni campo.

Los cambios en `api/areas.ts` y `mocks/handlers/areas.ts` se limitan a retirar esa
infraestructura temporal. No se modifican Dashboard, Áreas, Sensores o Históricos.

## Verificación y límites

Las pruebas de contrato cubren ambos clientes y los campos vacíos, pertenencia de
sensores y alertas, relaciones con áreas, valores de mediciones preservados,
filtros de severidad/estado/tipo/fecha, límites, acceso sin sesión, campo ajeno y
área inválida. Las de integración comprueban filtros de áreas, cambio de campo y
cliente, contador, cargas, errores, reintentos, respuestas tardías y ausencia de
consultas globales cuando no hay campos. El caso sin ubicaciones conserva la
lista de sensores sin generar pines ficticios.

Las pruebas de React inspeccionan los marcadores que se entregan al componente
del mapa, sustituyendo el motor Leaflet en jsdom. No certifican geometría visual,
teselas ni interacción real de popups en un navegador. El componente de Leaflet
no se modifica.

El backend sigue pendiente de implementar estos contratos y validar la cadena
cliente → campo → área → sensor antes de devolver datos o contadores. Los tokens
demo son públicos: MSW no constituye autorización segura de producción. La
revisión de autorización real y cualquier trabajo adicional requieren el alcance
de una etapa posterior; no se avanza con A10.
