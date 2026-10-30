# Modelos de dominio — A03

`src/types/dominio.ts` define entidades completas, sin datos simulados ni lógica
de sesión, API o interfaz. Se conservan los identificadores `string` del contrato
actual y la nomenclatura `*_id`; el sensor mantiene `device_id` como identidad.
Los nombres y emails no son claves de relación.

| Modelo | Identificador | Referencia obligatoria |
| --- | --- | --- |
| Cliente | `cliente_id` | — |
| Usuario | `usuario_id` | `cliente_id` → Cliente |
| Campo | `campo_id` | `cliente_id` → Cliente |
| Area | `area_id` | `campo_id` → Campo |
| Sensor | `device_id` | `area_id` → Area |

Cada hijo guarda un único identificador de padre. Varios usuarios y campos pueden
compartir `cliente_id`; varias áreas pueden compartir `campo_id` y varios sensores
pueden compartir `area_id`. No se duplican listas de hijos en el padre ni objetos
anidados que puedan quedar desactualizados.

TypeScript exige la forma y obligatoriedad de las referencias. No comprueba que el
registro padre exista, que un identificador sea único o que pertenezca al cliente
autorizado. Esas validaciones requieren datos y validación en tiempo de ejecución;
no se implementan en A03. Los IDs siguen siendo strings sin marcas nominales para
preservar el contrato, por lo que el compilador tampoco distingue IDs de entidades
distintas cuando ambos son strings.

## Compatibilidad con las respuestas actuales

- `auth.ts` reexporta el modelo completo `Usuario` y deriva `UsuarioLogin` con
  `usuario_id` y `cliente_id` opcionales. `LoginRespuesta.usuario` usa este DTO y
  sigue siendo opcional; se aceptan tanto una respuesta con solo token como los
  usuarios actuales con nombre y email. No cambia el login ni su contexto.
- `areas.ts` deriva `AreaApi` con `campo_id` opcional. `AreaResumen`, `AreaDetalle`
  y `AreaDashboard` lo reutilizan. Los payloads actuales siguen siendo válidos.
- `SensorDetalle`, `SensorMapa` e `HistoricoRespuesta` reutilizan `Sensor` sin
  cambiar sus campos: `area_id` continúa siendo obligatorio. `area_nombre` sigue
  siendo una etiqueta de presentación, nunca una clave.
- `SensorDeArea` reutiliza la identidad del sensor; su respuesta no incluye
  `area_id` porque el área está determinada por `/areas/:id/sensores`. No debe
  tratarse como un sensor de dominio completo sin incorporar ese ID de contexto.
- Los tipos de alertas, mediciones, filtros y envoltorios API no cambian.
  Los modelos `AreaDb` y `SensorDb` permanecen dentro de los mocks, sin cambios ni
  nuevos registros de clientes o campos.

## Migración propuesta y decisiones pendientes para A04

1. Acordar con backend la fuente y el formato estable de `usuario_id`, `cliente_id`
   y `campo_id`, y cómo obtener el cliente del usuario autenticado. No inferirlos
   desde nombres, emails ni el texto de un ID.
2. Definir los contratos y la carga de clientes y campos, y la asignación de cada
   área existente a un campo. Los IDs actuales como `campo_norte` son IDs de áreas;
   no se renombran ni se convierten automáticamente en IDs de campos.
3. Completar los nuevos identificadores en las respuestas API y después migrar
   los mocks y sus pruebas. Validar la existencia y unicidad de padres y la
   pertenencia al cliente correspondiente; el filtrado del frontend no reemplaza
   la autorización del backend.
4. Cuando todos los productores entreguen esas referencias, sustituir
   `UsuarioLogin` por `Usuario` y `AreaApi` por `Area` (o equivalentes con campos
   obligatorios), actualizando consumidores y pruebas en la misma migración.
   Hasta entonces, la ausencia de un ID significa información no disponible,
   no un cliente o campo predeterminado.
5. Resolver por separado si el usuario será obligatorio en `LoginRespuesta`, cómo
   conservarlo en sesión y cómo se seleccionará un campo. A03 no anticipa esos
   cambios ni incorpora selectores.

Las pruebas de `src/types/dominio.test.ts` contienen aserciones de tipos positivas
y negativas, sin fixtures de clientes o campos. `npm run build` ejecuta `tsc -b`,
que comprueba estas aserciones; ejecutar solo Vitest no sustituye esa validación.
