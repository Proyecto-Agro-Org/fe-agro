# Layout compartido — frontend #10

Barra superior, navegación lateral y vista móvil (menos de 768px). En móvil, Menú alterna la vista Navegación y el contenido; seleccionar un destino cierra el menú. Áreas queda activa en detalles de área, sensor e históricos. Análisis/IA está deshabilitado y Cerrar sesión elimina la sesión local y vuelve al login.

La insignia pide GET /api/v1/alertas?estado=activa&limit=1, lee total y refresca cada 60 segundos. Un fallo oculta la insignia sin bloquear la navegación. Los mocks incluyen filtros y límites; no implementan autorización real. El breadcrumb lo declara cada página mediante useBreadcrumb. 

La paleta gris y el menú oscuro siguen la referencia visual; se reutilizan los tokens compartidos corregidos en el PR #27. El banner mantiene visible el aviso de datos ilustrativos mientras VITE_USE_MOCKS=true.

## Verificar

frontend: npm ci, copiar .env.example a .env, npm test, npm run lint y npm run build. Con npm run dev, iniciar sesión y recorrer Dashboard, Áreas, Mapa y Alertas. Hay cinco alertas activas de ejemplo. En /sensores/sensor_014 queda activa Áreas. A 390px, Menú abre Navegación; elegir destino cierra el menú. Cerrar sesión vuelve al login. Con ?mock=error:alertas y recarga, el menú funciona sin insignia.

El contrato y backend de alertas y la integración con las pantallas siguen pendientes de sus issues. Esta base no completa todo el issue #10.

