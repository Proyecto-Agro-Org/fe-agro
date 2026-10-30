# Datos simulados multicliente — A04

La fuente única sigue siendo `src/mocks/data/db.ts`. `CLIENTES`, `CAMPOS` y
`USUARIOS` usan los modelos de dominio de A03. `AreaDb` reutiliza `Area`, con
`campo_id` obligatorio, y `SensorDb` extiende `Sensor` con sus datos de simulación.

Todos los nombres y correos nuevos son ficticios. Los usuarios son datos de
dominio, sin contraseñas, tokens ni vinculación con la sesión demo del login.

| Cliente (ID) | Campos (ID) | Usuario (ID y email) |
| --- | --- | --- |
| Agropecuaria Horizonte Verde (`cliente_horizonte_verde`) | El Molino (`campo_el_molino`), La Esperanza (`campo_la_esperanza`) | Ana Ríos (`usuario_ana_rios`), `ana.rios@horizonte-verde.example` |
| Agropecuaria Los Aromos (`cliente_los_aromos`) | La Ribera (`campo_la_ribera`), Los Olivos (`campo_los_olivos`) | Lucía Vega (`usuario_lucia_vega`), `lucia.vega@los-aromos.example` |

## Distribución y conservación de datos

| Cliente | Campo | Áreas actuales (ID) | Sensores conservados |
| --- | --- | --- | --- |
| Horizonte Verde | El Molino | Área Norte (`campo_norte`), Área Oeste (`campo_oeste`) | SN-011 a SN-015 y SN-001 a SN-003: 8 sensores |
| Horizonte Verde | La Esperanza | Sin áreas | Ninguno |
| Los Aromos | La Ribera | Área Sur (`campo_sur`), Área Este (`campo_este`) | SN-007 a SN-010 y SN-004 a SN-006: 7 sensores |
| Los Aromos | Los Olivos | Sin áreas | Ninguno |

Los IDs históricos `campo_norte`, `campo_sur`, `campo_este` y `campo_oeste`
permanecen como identificadores de **áreas**. Los campos son entidades distintas,
con IDs propios. Los campos vacíos permiten probar el caso sin áreas y conservar
los conteos actuales sin inventar ni duplicar sensores.

Se conservan las cuatro áreas (IDs, nombres y orden), los quince sensores
(incluidos pertenencia al área, ubicación y estado de comunicación), las seis
alertas, el reloj de referencia y los generadores de mediciones e históricos.
No se modifica ningún generador ni escenario de MSW.

## Consultas reutilizables

- `camposDeCliente(clienteId)`: campos del cliente indicado.
- `areasDeCampo(campoId)`: áreas del campo indicado.
- `sensoresDeArea(areaId)`: consulta existente, ahora tipada desde el dominio.

Todas comparan IDs, devuelven un arreglo nuevo con los registros de la base
compartida y devuelven `[]` ante IDs desconocidos o sin hijos. La existencia del
padre se puede consultar en su colección; estas funciones no generan entidades
de respaldo y no constituyen un mecanismo de autorización.

## Compatibilidad y límites

Los handlers, las rutas y los servicios API no cambian. Los listados y totales
siguen siendo globales e incluyen datos de ambos clientes, independientemente de
la sesión. No se incorporan filtros por cliente ni por campo a los endpoints.
El detalle de área serializa su registro compartido, por lo que ahora incluye
`campo_id`, ya admitido como opcional en el DTO de A03. Los resúmenes actuales
conservan su proyección anterior.

El login tradicional y Google simulado mantienen sus credenciales, respuestas y
token demo actuales. No se asocia automáticamente ese token con un cliente ni
se habilita el ingreso con los nuevos usuarios. Tampoco se cambia el contexto
de autenticación, las pantallas o la navegación.

Esta etapa completa los datos internos simulados previstos en A03; no convierte
todavía en obligatorios los campos opcionales de los contratos API.

## Validación y trabajo posterior

`src/mocks/data/multicliente.test.ts` comprueba mínimos de entidades, unicidad de
IDs, referencias existentes (incluidas alertas), recorrido completo y exclusivo
de sensores por cliente, consultas por ID y casos vacíos. Las pruebas existentes
siguen comprobando los conteos, endpoints, escenarios y mediciones anteriores.

Para A05 queda pendiente acordar e implementar el vínculo entre usuario, sesión
y cliente, el aislamiento de datos y los contratos de consulta correspondientes.
Los filtros visuales o la selección de campo requieren una etapa explícita.
Estos cambios no se implementan en A04; tampoco se reemplaza la futura
autorización del backend por filtros del frontend.
