# Usuario y cliente en sesión — A05

## Identidad demo

Los mocks de autenticación reutilizan `USUARIOS` y `CLIENTES` de A04. La tabla
`src/mocks/data/identidades.ts` solo relaciona IDs de usuario con tokens de
demostración; no duplica nombres, emails ni clientes.

| Email de ingreso | Contraseña demo | Usuario | Cliente |
| --- | --- | --- | --- |
| `ana.rios@horizonte-verde.example` | `demo1234` | Ana Ríos | Agropecuaria Horizonte Verde |
| `lucia.vega@los-aromos.example` | `demo1234` | Lucía Vega | Agropecuaria Los Aromos |

Se conserva `demo@agro.com` / `demo1234` como alias de Ana. Google simulado
también ingresa como Ana, sin abrir Google ni aceptar una selección de cuenta o
cliente. Los tokens son `token-demo` para Ana y `token-demo-lucia` para Lucía;
son datos públicos de simulación, nunca credenciales reales.

El mock de login valida email y contraseña y busca al cliente desde el
`cliente_id` del usuario. Ignora cualquier `cliente_id` agregado al pedido.
Las respuestas conservan `token` y `usuario` e incorporan `cliente`. Los campos
de identidad siguen siendo opcionales en `LoginRespuesta` para no exigir cambios
al contrato del backend real.

## Contexto, recuperación y limpieza

`AuthProvider` expone `token`, `usuario`, `cliente` y `recuperando`. El login
espera a que `iniciarSesion(respuesta)` complete la asociación antes de redirigir.
En modo mock, tanto el ingreso como la recuperación consultan
`POST /auth/demo/sesion` con el token demo. Este handler determina la identidad
desde los datos compartidos; no toma usuario ni cliente de almacenamiento o de
una selección de interfaz. El servicio rechaza la llamada sin mocks.

En `sessionStorage` se conservan `agro_token` y `agro_modo_sesion` (`demo` o
`real`). No se guardan nombres ni datos de cliente como fuente de permisos. Una
sesión marcada para otro modo se invalida. Un token anterior sin marca conserva
la compatibilidad: en mocks debe recuperarse contra el handler, que rechaza IDs
desconocidos, y al recuperarse se marca como demo.

Al recargar con mocks, las rutas muestran “Recuperando sesión…” y no montan el
layout privado hasta terminar. Un token desconocido, una identidad incompleta o
inconsistente, o un fallo de recuperación invalida la sesión y vuelve al login.
Sin almacenamiento disponible, una sesión iniciada dura solo en memoria.

Cerrar sesión o recibir el aviso de expiración (401 de un pedido autenticado)
borra token, modo, usuario y cliente. El contexto invalida respuestas de identidad
anteriores para que no revivan una sesión cerrada ni reemplacen otra cuenta.

## Interfaz y prueba manual

El encabezado muestra discretamente nombre de usuario y nombre del cliente,
con texto adaptable al ancho disponible. No son campos editables ni selectores.

1. En PowerShell, ejecutar `$env:VITE_USE_MOCKS='true'` y `npm.cmd run dev`.
2. Abrir `/login` e ingresar con una de las cuentas de la tabla.
3. Verificar ambos nombres en el encabezado y recargar: debe recuperarse la misma
   identidad. Los listados continúan siendo globales en esta etapa.
4. Cerrar sesión, ingresar con la otra cuenta y comprobar que se reemplazan ambos
   nombres. Recargar después de cerrar sesión debe volver al login.
5. Probar “Continuar con Google”: muestra la identidad demo de Ana.
6. Para simular un fallo de recuperación, con una sesión demo vigente recargar
   `/dashboard?mock=error:login`; la sesión se invalida. Quitar el parámetro para
   volver al escenario normal.

Las pruebas cubren ambas cuentas, el alias anterior, Google, recuperación,
cierre, expiración por 401, errores e identidades inconsistentes, separación de
modos, parámetros de cliente ignorados y respuestas tardías.

## Límites y trabajo posterior a A05

No hay aislamiento por cliente: los datos de Dashboard, Áreas, Sensores, Mapa,
Históricos y Alertas siguen siendo globales. Esta identidad sirve para preparar
el contexto y mostrar información, no para autorizar acceso seguro. Cualquier
token demo puede reproducirse desde el navegador; los mocks son públicos.

Sin mocks no se invocan endpoints de identidad demo ni se importan sus tablas.
Se mantiene el login real con solo token. Si una respuesta real incluye usuario
y cliente completos y coherentes, pueden mostrarse durante esa sesión; al
recargar, el contrato actual solo permite recuperar el token, sin inventar un
cliente. La recuperación real de identidad requiere acordar un endpoint con el
backend; no se implementa ni se presume disponible en A05.

Para A06 y etapas posteriores quedan el alcance de campos y consultas, el
aislamiento validado por backend, la recuperación de identidad real y su ciclo
de vida. No se implementan selectores, filtros, OAuth ni autorización por IDs
elegidos desde el cliente.
