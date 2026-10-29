# Alertas — frontend #19

GET /api/v1/alertas recibe estado=activa, limit=50 y filtros opcionales area_id, tipo y severidad. GET /areas solo alimenta el selector; si falla, la lista de alertas sigue disponible y se puede reintentar la carga de áreas por separado.

Los tres filtros se editan y se envían juntos con Aplicar filtros. Se conservan al fallar la consulta y al reintentar. Limpiar filtros restablece tanto el formulario como la consulta. El backend/mock entrega el orden: severidad de alta a baja y, dentro de cada nivel, las más recientes. Cada alerta enlaza al sensor que la originó.

El vacío sin filtros es positivo: no se registran alertas activas. No implica que todos los sensores funcionen correctamente. Un vacío filtrado permite limpiar los filtros. Cuando total supera las alertas recibidas se informa Mostrando N de M y se sugiere acotar: el contrato no define todavía cursor/desplazamiento. La carga usa skeletons y el error ofrece Reintentar.

## Probar

frontend: npm ci, copiar .env.example a .env y npm run dev. Login de ejemplo con mocks: demo@agro.com / demo1234. Abrir /alertas. Cinco alertas activas; Área Norte devuelve dos, severidad alta tres, tipo agronómica dos y Área Oeste ninguna. Seleccionar opciones no cambia la consulta hasta Aplicar filtros. Probar Limpiar filtros, enlace al sensor, escritorio y 390px. Recargar con ?mock=vacio:alertas, ?mock=error:alertas y ?mock=lento:alertas. Con ?mock=error:areas las alertas deben seguir visibles y aparecer Reintentar áreas.

Ejecutar npm test, npm run lint y npm run build. Los mocks usan la base compartida; el endpoint real, la autorización por cliente y la paginación definitiva deben acordarse y validarse con backend. La etapa no acredita generación de alertas agronómicas con mediciones reales.
