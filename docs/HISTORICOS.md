# Históricos — frontend #17

GET /api/v1/sensores/{device_id}/historico recibe desde/hasta ISO UTC, variable y limit (1000 en esta pantalla). El contrato propuesto está en types/historico.ts: identidad de sensor/área, variable, unidad, puntos { timestamp, valor nullable } y truncado. Debe acordarse con backend; no hay acceso a MongoDB ni autorización real.

Los filtros se editan sin pedir datos hasta Aplicar filtros. Se valida presencia y orden de fechas antes de llamar a la API. El rango inicial son las últimos 7 días calendario, usando fechas locales (desde al inicio del día y hasta al fin del día) y convirtiéndolas a UTC al enviar. El gráfico corresponde siempre al filtro aplicado, no al formulario sin confirmar. Los null cortan la línea, nunca se convierten en cero. Si no hay puntos válidos se muestra vacío. La tabla ofrece una alternativa textual. Un límite truncado exige reducir el período; no se inventa una paginación que el contrato no define.

Mocks basados en db.ts y generarSerie. Escenarios: normal, lento, vacio, error, offline y error-reintento. Un ID inexistente responde 404; parámetros inválidos 400. Los handlers se descubren automáticamente mediante registro.ts con fsModuleCache: false en Vitest. Recharts se carga de forma diferida.

## Probar

frontend: npm ci, copiar .env.example a .env, npm run dev. Iniciar sesión con el usuario de demostración y abrir /sensores/sensor_014/historico. Cambiar variable y fechas, Aplicar filtros. Desde posterior a hasta muestra validación sin pedido. sensor_010 no tiene lecturas; sensor_013/conductividad no tiene valores; sensor_012/humedad tiene un hueco al ampliar a 48 horas. Probar recargando con ?mock=lento:historico, ?mock=vacio:historico y ?mock=error:historico. Los errores persistentes siguen fallando en Reintentar; los tests cubren recuperación transitoria.

Los colores usan los tokens de styles/tokens.css. El layout y el detalle del sensor ya están integrados. No se cierra el issue compartido con backend.

Validación: npm test, npm run lint y npm run build. Edge: normal, rango inválido, vacío y error. Los componentes compartidos siguen a cargo del layout del equipo.
