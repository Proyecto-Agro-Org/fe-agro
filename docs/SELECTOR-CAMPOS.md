# Selector de campos — A06

El encabezado usa un selector nativo con etiqueta visible **Campo**, foco por
teclado y estados accesibles de carga y error. En anchos de hasta 767 px ocupa una
fila completa debajo de la identidad y el botón de menú. El control conserva un
alto mínimo de 44 px y adapta su ancho al encabezado.

## Datos y origen de los campos

Se reutilizan `Campo`, `CAMPOS` y `camposDeCliente()` de A03/A04:

| Usuario y cliente | Campos disponibles | Selección inicial |
| --- | --- | --- |
| Ana Ríos / Horizonte Verde | El Molino, La Esperanza | El Molino |
| Lucía Vega / Los Aromos | La Ribera, Los Olivos | La Ribera |

`GET /auth/demo/campos` es un endpoint exclusivo de MSW. Recibe el token actual
en `Authorization`, resuelve la identidad de A05 y consulta los campos de su
cliente. No acepta un cliente elegido por URL ni toma la preferencia del navegador
para decidir qué campos entregar. La respuesta se valida: IDs únicos y no vacíos,
nombres presentes y pertenencia al cliente de la sesión. Un resultado inválido
se trata como error y no se expone en el selector.

No se agrega un endpoint al backend. Sin mocks, el control indica **No disponible**
y no consulta endpoints demo; el contrato real de campos queda pendiente.

## Contexto y preferencia

`CampoProvider` vive dentro del layout autenticado, por encima de sus rutas hijas.
`useCampo()` expone campos, campo seleccionado, estado de carga, disponibilidad,
selección y reintento. Ninguna pantalla consume todavía ese contexto para filtrar.

Se selecciona la preferencia si existe entre los campos recibidos; en caso
contrario, el primero de la respuesta. Los cambios se admiten únicamente si el ID
está en esa lista vigente. Ante una lista vacía, la selección es `null` y se borra
la preferencia obsoleta. Durante carga o error no se expone un campo anterior como
válido; el contenido principal continúa disponible.

La preferencia se guarda por cliente en `localStorage`, con la clave
`agro_campo_preferido:demo:<cliente_id>`. Es solo una preferencia de interfaz, nunca
una fuente de permisos. En cada montaje se contrasta contra una respuesta nueva.
Si el almacenamiento falla, la selección funciona en memoria durante la navegación.

Cambiar de token, usuario o cliente reinicia el contexto y cancela su pedido
anterior. Cerrar sesión o expirar desmonta el layout y elimina el campo de memoria.
Las preferencias permanecen separadas por cliente para una futura sesión, donde
se vuelven a validar; una respuesta tardía no debe contaminar otra cuenta.

## Cómo probar

1. Ejecutar con `VITE_USE_MOCKS=true` e ingresar con una cuenta de A05 (contraseña
   demo `demo1234`). Verificar los campos de la tabla.
2. Elegir el segundo campo, navegar y recargar: se conserva si sigue siendo válido.
3. Cerrar sesión e ingresar con la otra cuenta: se obtienen sus propios campos.
4. En una sesión vigente, recargar con `?mock=lento:campos`, `?mock=error:campos`
   o `?mock=vacio:campos` para probar carga, error con reintento y ausencia de campos.
   Quitar el parámetro y recargar para volver al escenario normal.
5. Comprobar el encabezado a 1280 y 375 px, el acceso por teclado, el nombre visible
   del campo y que el menú móvil conserve su funcionamiento.

Las pruebas automáticas cubren las dos listas, selección inicial, cambio,
navegación, recarga, preferencias inválidas o ajenas, cambio de cuenta, respuestas
tardías, lista vacía, error/reintento, carga y almacenamiento no disponible.
Las pruebas de jsdom no renderizan media queries ni certifican dimensiones o
desbordamientos; la revisión responsive real requiere un navegador.

## Límites y pendiente para A07

Dashboard, Áreas, Sensores, Históricos, Mapa y Alertas siguen mostrando la
información global anterior. No se cambian sus servicios, filtros, generadores,
mediciones ni navegación. A07 deberá definir cómo consumir el campo seleccionado
y cómo validar el alcance en los endpoints. El aislamiento seguro requiere
autorización en backend; los mocks y tokens públicos no ofrecen esa garantía.
