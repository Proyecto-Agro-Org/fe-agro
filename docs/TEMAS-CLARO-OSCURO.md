# Temas claro y oscuro — A10

## Administración del tema

`src/app/tema.ts` es el módulo central de preferencia visual. Expone inicialización,
lectura, alternancia y suscripción. `SelectorTema` usa `useSyncExternalStore` para
sincronizar el botón con el atributo `data-tema` del elemento `<html>`.
No se agrega un provider de autenticación ni se modifica el contexto de sesión,
cliente o campo. Cambiar el tema no remonta las pantallas ni consulta las APIs.

El botón vive en el encabezado y representa el tema vigente: sol junto a “Tema
claro” y luna junto a “Tema oscuro”. Su nombre accesible describe la acción
(“Cambiar a tema claro/oscuro”). Es un botón nativo operable con Enter y Espacio,
mantiene el foco y tiene un área mínima de 44 × 44 px. En móvil queda visible el
ícono con el mismo nombre accesible; el texto visual se oculta para conservar
espacio para identidad, menú y selector de campos.

## Preferencia y arranque

Se guarda únicamente `claro` u `oscuro` en `localStorage`, clave `agro_tema`.
Es una preferencia visual global del navegador, independiente de cada cuenta y
de las preferencias de campo. No otorga permisos ni se elimina al cerrar sesión.

Sin preferencia, con valores inválidos o si no se puede leer el almacenamiento,
se usa **oscuro**. Si falla la escritura, el cambio funciona durante la vida de
la pestaña, pero no se garantiza su persistencia tras recargar.

Un script mínimo en el `<head>` de `index.html` anticipa la misma preferencia antes
del primer render. La hoja de tokens se enlaza desde ese HTML para que el fondo
inicial corresponda al tema, incluso mientras se inician los mocks. Antes de
montar React, `main.tsx` inicializa el módulo central. Las pruebas ejecutan el
script real del HTML y verifican su consistencia con la inicialización del módulo.

La preferencia se aplica a Login, aunque allí no se agrega otro selector. El
cambio también se conserva al navegar, recargar, cerrar sesión e ingresar con
otra cuenta. No se sigue automáticamente el tema del sistema, porque el valor
predeterminado solicitado es oscuro.

## Tokens y componentes

`src/styles/tokens.css` conserva la paleta oscura base y agrega una variante
`:root[data-tema='claro']`, con fondos claros, texto oscuro y verdes de Agro IoT.
Tipografías, espaciados, radios y estructura de las pantallas no cambian.
El token `color-scheme` pasa a estar definido por cada tema; se eliminan las
declaraciones oscuras fijas de estilos globales, Mapa e Históricos.

Login, Dashboard, Áreas, Detalle de Área, Sensores, Históricos y Alertas ya usaban
variables centralizadas. Sus tarjetas, formularios, tablas, botones, selectores,
mensajes, estados vacíos y skeletons heredan la variante nueva. Los estados
mantienen texto y símbolos además del color. El rojo oscuro se aclara ligeramente
para mejorar el contraste de las insignias de peligro.

Adaptaciones específicas:

- Encabezado y menú: íconos SVG existentes se ajustan por un filtro CSS según el
  tema, sin reemplazar los assets. La insignia del contador usa texto blanco
  independiente del texto general, y los íconos deshabilitados se atenúan.
- Recharts: ejes y serie siguen los tokens existentes; rejilla y tooltip reciben
  tokens explícitos de contraste y texto. Se conservan datos, fechas, filtros,
  escala, huecos, límites y accesibilidad del gráfico.
- Leaflet: fondo, zoom, atribución, cierre del popup, popup y punta se adaptan
  mediante CSS. Las teselas de OpenStreetMap se atenúan/invierten solo en la
  capa de teselas para el tema oscuro; en claro conservan su presentación original.
  La URL, atribución, coordenadas y funciones del mapa no cambian. Marcadores y
  símbolos conservan sus estados y usan texto blanco con borde independiente.
- Los colores de marca del ícono de Google se conservan intencionalmente.

## Verificaciones

Las pruebas cubren oscuro predeterminado, alternancia en ambos sentidos,
inicialización/persistencia, valores inválidos, almacenamiento no disponible,
suscripciones, teclado, nombre accesible, Login y un flujo con navegación,
selección de campo, recarga, cierre de sesión e ingreso de otra cuenta.

Las pruebas de tokens calculan contraste según luminancia sRGB sobre las
superficies utilizadas: texto principal/secundario y enlaces (mínimo 4,5:1),
insignias y botones (4,5:1), texto de pines/contador (4,5:1), y foco/líneas de gráfico
(3:1). También consideran fondos mezclados de las insignias. No sustituyen una
auditoría visual ni certifican todos los estados o superficies de un mapa raster.

Resultados de ejecución (30/10/2026):

- `npm.cmd test`: **NO OK**, última ejecución con 320/321 pruebas aprobadas
  en 37/38 archivos. Falló `CampoFiltrado.test.tsx`, caso de error y reintento
  de Dashboard, porque la carga inicial de campos terminó en error. Sus diez
  pruebas pasaron en una ejecución separada; en esa ejecución falló otro caso
  de carga de `SelectorCampo.test.tsx`. La primera suite completa también
  mostró una comprobación de persistencia que recibió `null` antes del efecto.
  Queda pendiente investigar esa intermitencia; no se modificó la lógica
  multicliente ni sus pruebas para ocultarla.
- Las **25 pruebas nuevas** de tema, integración, control y contraste pasaron.
- `npm.cmd run lint`: **OK**, sin errores.
- `npm.cmd run build`: **OK**, TypeScript y compilación de producción completos.
- `git diff --check`: **OK**, sin errores de espacios.

Los comandos principales se ejecutaron secuencialmente. También se comprobó
que el HTML compilado conserva el script inicial antes de la hoja de estilos.

## Revisión visual y limitaciones

Debe verificarse cada tema a 1280, 768 y 375 px en Login, Dashboard, selector de
campos, Áreas, Sensores, Históricos/Recharts, Mapa/Leaflet/popups y Alertas.
La revisión visual queda **PENDIENTE** hasta disponer de evidencia de navegador;
jsdom no certifica geometría, foco visual, desbordamientos ni teselas externas.
En esta sesión, Computer Use no pudo iniciar (`CreateProcessWithLogonW failed: 2`)
y la alternativa devolvió `apps: []`, `browsers: []` y un error de conexión al
canal nativo. No se aprobaron visualmente ninguno de los tamaños ni temas.

El filtro de teselas es una adaptación visual de imágenes externas: su legibilidad
geográfica requiere revisión real junto con marcadores y popups. No se cambia de
proveedor ni se agrega una dependencia. Si en el futuro se impone una política CSP
que prohíba scripts inline, deberá autorizarse el script inicial mediante el
mecanismo de esa política para conservar el arranque sin cambios de tema visibles.

No se modifican APIs, mocks, generadores ni lógica de autorización multicliente.
No se avanza con A11.
