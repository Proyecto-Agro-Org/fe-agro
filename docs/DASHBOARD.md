# Dashboard — frontend #13

GET /api/v1/dashboard/resumen devuelve resumen agregado, áreas, últimas alertas y última actualización. Se realiza un pedido de resumen; la insignia global del menú utiliza su propia consulta compartida. Los totales del mock se derivan de db.ts: 4 áreas, 15 sensores, 11 conectados, 4 desconectados y 5 alertas activas.

La pantalla declara el breadcrumb Inicio, presenta cuatro métricas y enlaza cada área y cada alerta a su detalle correspondiente. El timestamp completo está disponible en el título de las fechas relativas de alertas. Si no hay áreas, se muestra vacío sin métricas en cero. Una falla de API reemplaza el resumen por error y Reintentar; el menú compartido sigue disponible. La carga usa skeletons.

Las cinco últimas alertas se ordenan por fecha e incluyen cualquier estado; las resueltas se etiquetan. El contador de alertas activas es independiente. Esta interpretación corresponde al contrato propuesto y debe acordarse con backend antes de conectar datos reales.

## Probar

frontend: npm ci, copiar .env.example a .env, npm run dev. Login demo@agro.com / demo1234 solo con mocks. Abrir /dashboard y probar el clic en un área y una alerta. Recargar con ?mock=lento:dashboard, ?mock=vacio:dashboard y ?mock=error:dashboard. Verificar escritorio y 390px. npm test, npm run lint y npm run build validan la rama.

No implementa consultas MongoDB, autenticación ni autorización reales. No completa el issue #13 de extremo a extremo.
