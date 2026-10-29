# Detalle de área (frontend, issue #15)

La pantalla usa dos pedidos independientes: GET /api/v1/areas/{area_id} y GET /api/v1/areas/{area_id}/sensores. El nombre y el breadcrumb se muestran sin esperar al listado. Cada tarjeta enlaza al detalle del sensor y muestra estado, última comunicación con fecha y hora local, cantidad de alertas activas y ubicación.

Contrato tipado en src/types/areaDetalle.ts: área con area_id/nombre; listado { sensores: [...] } con device_id, nombre, estado, ultima_comunicacion nullable, ubicacion nullable y alertas_activas. Es el contrato propuesto para estos mocks; debe acordarse y probarse con el backend cuando exista. No implementa autorización real ni consultas MongoDB.

Los mocks utilizan exclusivamente db.ts para identidad, reloj, conectividad y alertas. Los handlers se descubren automáticamente mediante registro.ts; fsModuleCache: false evita registros obsoletos en Vitest.

## Probar

En frontend, npm ci, npm test, npm run lint y npm run build. Copiar .env.example a .env y ejecutar npm run dev. Ingresar con el login provisorio y abrir /areas/campo_norte.

- Normal: cinco sensores, SN-015 desconectado y alertas en SN-014/SN-015.
- ?mock=lento:area-sensores: encabezado disponible y skeleton de lista.
- ?mock=vacio:area-sensores: mensaje de área sin sensores.
- ?mock=error:area-sensores: conserva el encabezado y ofrece Reintentar.
- /areas/inexistente: mensaje de área no encontrada.
- /areas/campo_sur: sensor sin comunicación registrada.
- /areas/campo_oeste: sensor sin ubicación.

Los estados ?mock= se fijan al cargar: recargar la página al cambiarlos. Los escenarios de error persistente fallarán también al reintentar hasta cambiar el escenario. Los tests verifican recuperación tras un fallo transitorio.

El layout responsive completo depende del issue #10 y el listado de áreas del #14. Se mantiene el acceso directo de prueba del layout actual. El detalle del sensor continúa provisorio hasta el issue #16. Las tarjetas se adaptan al ancho disponible; el menú móvil compartido no se modifica aquí.
