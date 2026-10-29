# Generadores de datos de ejemplo

`generarMedicion(deviceId)` devuelve seis variables con unidad o `null` para un sensor que nunca comunicó. `generarSerie(deviceId, variable, desde, hasta, limit = 500)` devuelve `{ puntos, truncado }`, ordenado ascendentemente, con extremos inclusivos y un máximo permitido de 1000 puntos por respuesta.

Se simulan hasta 1440 muestras por sensor, separadas por 30 minutos y ancladas a su última comunicación. Los datos son deterministas para un mismo reloj de referencia, sensor y fecha. SN-012 incluye doce puntos nulos consecutivos en humedad; SN-013 tiene conductividad nula. No se generan alertas ni se interpretan rangos agronómicos.

## Integración con la base compartida

- `Medida` se importa de `types/comun` y se reexporta para mantener compatibles los consumidores existentes.
- La identidad y última comunicación salen de `buscarSensor` y `ultimaComunicacion` de `db.ts`. No existe una tabla duplicada de sensores ni un reloj propio.
- `ultimaComunicacion` utiliza el reloj común `ahoraMock()`. En pruebas, fijarlo con `fijarAhoraMock()`; los generadores respetan los cambios posteriores a la importación.
- `ultimaComunicacionSimulada(deviceId)` conserva su interfaz como adaptador de la base compartida.
- Un ID desconocido lanza `RangeError`; el handler debe responder 404. Parámetros inválidos deben traducirse a 400. Un rango válido sin datos devuelve una lista vacía.
- Los handlers por pantalla y la integración con backend corresponden a sus issues; este cambio no los implementa.
- La frecuencia y las unidades son ilustrativas, pendientes de confirmación con Electrónica/Agronomía. Mostrar el banner de datos de ejemplo.

## Verificación

Dentro de `frontend`: `npm ci`, `npm test`, `npm run lint` y `npm run build`.
Las pruebas verifican reproducibilidad, filtros, límites, ausencias y sincronización con los sensores y el reloj de `db.ts`.
