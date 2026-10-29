# Áreas — frontend #14

GET /api/v1/areas devuelve tarjetas de área con cantidad de sensores, conectividad, alertas y última actualización (null cuando ningún sensor comunicó). Los mocks usan db.ts como fuente compartida; la tarjeta enlaza al detalle y el breadcrumb es Inicio > Áreas.

La carga inicial muestra skeletons; un cliente sin áreas ve el mismo vacío que el Dashboard. Actualizar conserva el listado anterior mientras consulta. Si falla la recarga se mantiene la respuesta previa, incluso si era vacía, con aviso de posible desactualización y Reintentar. Un error inicial ofrece reintento sin mostrar datos inventados.

## Probar

frontend: npm ci, copiar .env.example a .env, npm run dev. Login con demo@agro.com / demo1234 solo con mocks, abrir /areas y navegar a una tarjeta. Probar escritorio/390px y recargar con ?mock=lento:areas, ?mock=vacio:areas y ?mock=error:areas. El escenario error-reintento puede consumir la primera respuesta con el efecto cancelado de StrictMode en desarrollo; el fallo tras una lista cargada se verifica en pruebas automáticas.

Los atajos de desarrollo se retiraron del menú porque las pantallas se alcanzan por navegación normal. Ejecutar npm test, npm run lint y npm run build. El contrato con backend, la autorización por cliente y los datos reales siguen pendientes de integración.
