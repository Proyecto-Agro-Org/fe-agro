import { describe, expectTypeOf, it } from 'vitest'
import type { Area, Campo, Cliente, Sensor, Usuario } from './dominio'
import type { LoginRespuesta, Usuario as UsuarioAuth, UsuarioLogin } from './auth'
import type { AreaApi, AreaResumen } from './areas'
import type { AreaDetalle, SensorDeArea } from './areaDetalle'
import type { AreaDashboard } from './dashboard'
import type { SensorDetalle } from './sensor'
import type { SensorMapa } from './mapa'
import type { HistoricoRespuesta } from './historico'

// Estas aserciones se verifican con TypeScript durante npm run build.
// No crean registros ni prueban integridad referencial en tiempo de ejecución.
describe('modelos de dominio y compatibilidad del contrato', () => {
  it('conserva los identificadores string y exige identidad propia en cada entidad', () => {
    expectTypeOf<Cliente['cliente_id']>().toEqualTypeOf<string>()
    expectTypeOf<Usuario['usuario_id']>().toEqualTypeOf<string>()
    expectTypeOf<Campo['campo_id']>().toEqualTypeOf<string>()
    expectTypeOf<Area['area_id']>().toEqualTypeOf<string>()
    expectTypeOf<Sensor['device_id']>().toEqualTypeOf<string>()
    expectTypeOf<Omit<Cliente, 'cliente_id'>>().not.toExtend<Cliente>()
    expectTypeOf<Omit<Usuario, 'usuario_id'>>().not.toExtend<Usuario>()
    expectTypeOf<Omit<Campo, 'campo_id'>>().not.toExtend<Campo>()
    expectTypeOf<Omit<Area, 'area_id'>>().not.toExtend<Area>()
    expectTypeOf<Omit<Sensor, 'device_id'>>().not.toExtend<Sensor>()
  })

  it('exige una referencia única al padre mediante su identificador', () => {
    expectTypeOf<Usuario['cliente_id']>().toEqualTypeOf<Cliente['cliente_id']>()
    expectTypeOf<Campo['cliente_id']>().toEqualTypeOf<Cliente['cliente_id']>()
    expectTypeOf<Area['campo_id']>().toEqualTypeOf<Campo['campo_id']>()
    expectTypeOf<Sensor['area_id']>().toEqualTypeOf<Area['area_id']>()
    expectTypeOf<Omit<Usuario, 'cliente_id'>>().not.toExtend<Usuario>()
    expectTypeOf<Omit<Campo, 'cliente_id'>>().not.toExtend<Campo>()
    expectTypeOf<Omit<Area, 'campo_id'>>().not.toExtend<Area>()
    expectTypeOf<Omit<Sensor, 'area_id'>>().not.toExtend<Sensor>()
  })

  it('acepta las respuestas de login actuales sin convertirlas en usuarios completos', () => {
    expectTypeOf<UsuarioAuth>().toEqualTypeOf<Usuario>()
    expectTypeOf<Pick<Usuario, 'nombre' | 'email'>>().toExtend<UsuarioLogin>()
    expectTypeOf<Usuario>().toExtend<UsuarioLogin>()
    expectTypeOf<UsuarioLogin>().not.toExtend<Usuario>()
    expectTypeOf<{ token: string }>().toExtend<LoginRespuesta>()
    expectTypeOf<{ token: string; usuario: { nombre: string; email: string } }>()
      .toExtend<LoginRespuesta>()
  })

  it('mantiene campo_id opcional solo en los DTO de áreas existentes', () => {
    expectTypeOf<Area>().toExtend<AreaApi>()
    expectTypeOf<AreaApi>().not.toExtend<Area>()
    expectTypeOf<AreaDetalle>().toEqualTypeOf<AreaApi>()
    expectTypeOf<Omit<AreaDetalle, 'campo_id'>>().toExtend<AreaDetalle>()
    expectTypeOf<Omit<AreaResumen, 'campo_id'>>().toExtend<AreaResumen>()
    expectTypeOf<Omit<AreaDashboard, 'campo_id'>>().toExtend<AreaDashboard>()
    expectTypeOf<Required<Pick<AreaApi, 'campo_id'>>>().toEqualTypeOf<Pick<Area, 'campo_id'>>()
  })

  it('conserva el área obligatoria en los sensores y las respuestas que la incluyen', () => {
    expectTypeOf<SensorDetalle>().toExtend<Sensor>()
    expectTypeOf<SensorMapa>().toExtend<Sensor>()
    expectTypeOf<HistoricoRespuesta>().toExtend<Sensor>()
    expectTypeOf<Omit<SensorDetalle, 'area_id'>>().not.toExtend<SensorDetalle>()
    expectTypeOf<Omit<SensorMapa, 'area_id'>>().not.toExtend<SensorMapa>()
    expectTypeOf<Omit<HistoricoRespuesta, 'area_id'>>().not.toExtend<HistoricoRespuesta>()
    expectTypeOf<SensorDeArea>().toExtend<Omit<Sensor, 'area_id'>>()
    expectTypeOf<SensorDeArea>().not.toExtend<Sensor>()
  })
})
