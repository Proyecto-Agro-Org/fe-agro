# Alcance de sensores e históricos — A08

## Validación reutilizada

`sensorAutorizado(request, deviceId)` amplía `src/mocks/data/alcance.ts` y llama
primero a `campoAutorizado()` de A07. Esa función identifica al usuario y cliente
desde el token demo y valida el `campo_id`. Después se busca el sensor y se
comprueba que el área a la que pertenece esté en ese campo.

Ambos handlers usan la misma función, antes de generar cualquier medición o serie.
No consultan la preferencia almacenada del navegador ni aceptan un cliente elegido
por parámetros. Los generadores, su reloj, cálculos, unidades, huecos y límites
no se modifican.

## Contratos para backend

| Método | Ruta | Respuesta conservada |
| --- | --- | --- |
| GET | `/sensores/:deviceId?campo_id=<id>` | `SensorDetalle`, incluida `ultima_medicion` |
| GET | `/sensores/:deviceId/historico?campo_id=<id>&variable=<variable>&desde=<ISO>&hasta=<ISO>&limit=<n>` | `HistoricoRespuesta` |

El cambio de contrato es agregar `campo_id`, obligatorio y único, a ambas
consultas autenticadas. Se conserva el formato de las respuestas. Los servicios
reciben el campo explícitamente y continúan pasando un `AbortSignal`.
El histórico mantiene seis variables, conversión de fechas locales a UTC y
`LIMITE_HISTORICO = 1000`. Las validaciones de variable, fechas, orden del rango
y límite siguen activas para sensores autorizados.

| Código | Condición |
| --- | --- |
| 401 | Token ausente o inválido; activa la expiración de sesión existente |
| 400 | Campo ausente, vacío o repetido; filtros históricos inválidos tras validar alcance |
| 404 | Campo inexistente o ajeno al cliente; sensor inexistente o fuera del campo |

El sensor desconocido y el ajeno producen el mismo 404 genérico. Las pantallas
también contemplan un eventual 403 del backend como acceso no disponible, sin
mostrar mediciones, gráficos ni un reintento del acceso denegado.

## Interfaz y ciclo de consulta

Las pantallas consumen el campo validado de A06. Si aún se carga, falla o no hay
campo disponible, reutilizan `EstadoSinCampo` y no solicitan un sensor global
como alternativa. Se conserva el diseño existente.

La clave de cada vista incluye campo y dispositivo. Al cambiar cualquiera se
desmonta la consulta anterior: se borran sus datos de la vista, se cancela su
señal y `useApi` ignora cualquier respuesta tardía, incluso si la promesa termina
después de cancelarse. Los filtros del histórico se inicializan de nuevo al
cambiar ese alcance; dentro de la misma vista mantienen el funcionamiento de
aplicar, validar y reintentar.

El histórico obtiene nombre y área exclusivamente de la respuesta validada.
Ya no usa metadatos de `location.state` para mostrar una identidad mientras carga,
porque podrían corresponder al campo anterior o haber sido alterados. Los enlaces
existentes y sus URLs se conservan; no se cambia automáticamente el campo para
abrir un sensor ajeno.

Se conservan las seis mediciones con unidades, sensores desconectados con sus
últimas lecturas, ausencias como `null`, estado sin datos, rango temporal,
selección de variable, truncamiento, tabla accesible y gráfico real. Los datos de
un sensor autorizado sin comunicación siguen siendo `ultima_medicion: null` y
una serie vacía, sin convertirlos en ceros ni en errores de acceso.

## Cómo probar con mocks

- Ana (`ana.rios@horizonte-verde.example`, contraseña demo `demo1234`), El Molino:
  `/sensores/sensor_014` y `/sensores/sensor_014/historico` son accesos propios.
- Cambiar a La Esperanza conserva la URL pero debe mostrar no encontrado, porque
  ese sensor no pertenece al campo seleccionado.
- Lucía (`lucia.vega@los-aromos.example`, misma contraseña), La Ribera: sensor_005
  es propio y desconectado; sensor_010 es propio y no tiene mediciones.
- Lucía no puede abrir sensor_014 ni su histórico mediante URL directa. Tampoco
  puede pedirlos al endpoint usando `campo_id=campo_el_molino`.
- Para carga, error o vacío se mantienen los escenarios
  `?mock=lento:sensor`, `?mock=error:sensor`, `?mock=vacio:sensor` y sus equivalentes
  con `historico`. Quitar el parámetro y recargar restaura el escenario normal.

Las pruebas nuevas cubren ambos clientes, otro campo del mismo cliente, URLs
directas, respuestas tardías tras cambios rápidos, ausencia de campos, metadatos
de navegación no confiables y denegación 403. Las pruebas de contrato verifican
que los generadores no se ejecuten antes de autorizar y que sus resultados sigan
siendo iguales para un sensor propio. Las pruebas anteriores de gráficos y filtros
se mantienen; precargan el módulo real del gráfico para no incluir su importación
en frío dentro del tiempo de espera del render.

## Límites pendientes

El backend no se modifica: debe aplicar la validación de identidad y la cadena
cliente → campo → área → sensor antes de devolver cualquier dato o medición.
Los tokens demo son públicos y el mock no representa autorización de producción.

Mapa y Alertas mantienen el alcance previo; sus listados pueden contener enlaces
que ahora se rechacen si apuntan fuera del campo seleccionado. El catálogo auxiliar
global de Alertas descrito en A07 permanece pendiente. No se modifica Dashboard
ni Áreas, no se afirma aislamiento completo de la aplicación y no se avanza con A09.
