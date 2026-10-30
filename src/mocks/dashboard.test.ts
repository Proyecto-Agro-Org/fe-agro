import { describe, expect, it } from 'vitest'
import { apiFetch } from '../api/client'
import type { DashboardRespuesta } from '../types/dashboard'
import { ahoraMock } from './data/db'
import { guardarToken } from '../api/sesion'

function consultarDashboard() {
  guardarToken('token-demo')
  return apiFetch<DashboardRespuesta>('/dashboard/resumen?campo_id=campo_el_molino')
}

describe('GET /dashboard/resumen (mock)', () => {
  it('devuelve las cantidades generales', async () => {
    const respuesta = await consultarDashboard()

    expect(respuesta.resumen).toEqual({
      areas: 2,
      sensores: 8,
      conectados: 7,
      desconectados: 1,
      alertas_activas: 2,
    })
  })

  it('resume cada área con sus sensores y alertas activas', async () => {
    const respuesta = await consultarDashboard()
    const norte = respuesta.areas.find((area) => area.area_id === 'campo_norte')
    const oeste = respuesta.areas.find((area) => area.area_id === 'campo_oeste')

    expect(norte).toMatchObject({ sensores: 5, conectados: 4, desconectados: 1, alertas_activas: 2 })
    expect(oeste).toMatchObject({ sensores: 3, conectados: 3, desconectados: 0, alertas_activas: 0 })
  })

  it('las áreas suman los totales generales', async () => {
    const { resumen, areas } = await consultarDashboard()

    expect(areas.reduce((suma, area) => suma + area.sensores, 0)).toBe(resumen.sensores)
    expect(areas.reduce((suma, area) => suma + area.conectados, 0)).toBe(resumen.conectados)
  })

  it('devuelve las últimas alertas del campo, la más reciente primero', async () => {
    const respuesta = await consultarDashboard()

    expect(respuesta.ultimas_alertas.map((alerta) => alerta.alerta_id)).toEqual([
      'alerta_001',
      'alerta_003',
      'alerta_006',
    ])
  })

  it('la última actualización es la comunicación más reciente de los sensores', async () => {
    const respuesta = await consultarDashboard()

    // sensor_014: no se usa sensor_009, que pertenece a otro campo.
    expect(Date.parse(respuesta.ultima_actualizacion!)).toBe(ahoraMock() - 2 * 60_000)
  })
})
