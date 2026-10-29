# Mapa de sensores — frontend #18

GET /api/v1/mapa/sensores utiliza el contrato propuesto en types/mapa.ts: { sensores: [...] }, con device_id/nombre, area_id/area_nombre, estado, ubicacion nullable, ultima_comunicacion nullable y ultima_medicion nullable (timestamp, humedad y temperatura con unidad). Debe acordarse con backend antes de conectar datos reales. No se implementan autorización real ni consultas MongoDB.

Los mocks reutilizan db.ts y generarMedicion. Las coordenadas deben ser finitas y estar dentro de los límites latitud/longitud; cero es válido. Los sensores sin coordenadas válidas se listan aparte. Los filtros por área y estado se aplican a mapa y listados. Pines verdes con círculo y rojos con cruz distinguen conectividad también por forma y texto. El popup ofrece resumen y enlace al sensor.

Leaflet se carga de forma diferida. El mapa base usa tiles públicos de OpenStreetMap con atribución visible y requiere conexión; una carga fallida muestra aviso y el listado permite acceder a los sensores. Cambiar el proveedor antes de un despliegue con tráfico elevado según el servicio elegido. En carga y error de API se mantiene el mapa base sin pines; no se presentan datos anteriores como actuales.

## Probar

frontend: npm ci, copiar .env.example a .env y npm run dev. Iniciar sesión con el usuario de demostración y abrir /mapa. Con los mocks actuales hay 14 sensores geolocalizados y SN-002 sin ubicación. Clic en un pin abre resumen; Ver detalle navega al sensor. Filtrar campo_norte y desconectados deja SN-015. Probar recargando con ?mock=lento:mapa, ?mock=vacio:mapa y ?mock=error:mapa. El mapa base debe seguir disponible sin pines y ofrecer el estado correspondiente.

Los colores usan los tokens de styles/tokens.css. Los tests de página sustituyen el renderer Leaflet para aislar el motor de layout de jsdom; pines/popups se verifican en navegador real.

Validación: npm test, npm run lint y npm run build.
