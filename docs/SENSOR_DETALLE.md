# Detalle del sensor — issue #16 (frontend)

GET /api/v1/sensores/{device_id} usa el contrato propuesto en src/types/sensor.ts: identidad del sensor y área, estado, última comunicación nullable, ubicación nullable y ultima_medicion nullable. Esta última incluye timestamp y seis medidas { valor, unidad }. Debe acordarse con el backend antes de conectar datos reales. No se implementan autorización real ni acceso a MongoDB.

Los mocks reutilizan db.ts y generarMedicion; no calculan un segundo reloj ni duplican sensores. Un valor puntual null se muestra como "sin datos"; un sensor sin mediciones tiene un estado vacío. La desconexión conserva las lecturas y distingue la fecha de medición de la última comunicación.

## Probar

En frontend, npm ci, copiar .env.example a .env y npm run dev. Iniciar sesión con el botón provisorio. Abrir:

- /sensores/sensor_014: seis variables con unidades.
- /sensores/sensor_005: desconectado con lecturas antiguas.
- /sensores/sensor_010: sin mediciones.
- /sensores/sensor_013: conductividad ausente.
- /sensores/sensor_002: sin ubicación.
- /sensores/inexistente: 404.
- Agregar ?mock=lento:sensor, ?mock=vacio:sensor o ?mock=error:sensor y recargar para probar estados. Un error persistente seguirá fallando al reintentar; las pruebas verifican recuperación de fallos transitorios.

npm test, npm run lint y npm run build verifican el frontend. El link de históricos apunta a la pantalla provisoria del #17. La navegación desde el área depende del PR del #15; esta rama parte de develop y no incorpora cambios sin revisar de aquella. El menú móvil definitivo corresponde al #10.
