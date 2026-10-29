import { describe, expect, it } from 'vitest'
import { apiFetch } from '../api/client'
import type { DashboardRespuesta } from '../types/dashboard'
import { ahoraMock } from './data/db'

describe('GET /dashboard/resumen (mock)', () => {
  it('devuelve las cantidades generales', async () => {
    const respuesta = await apiFetch<DashboardRespuesta>('/dashboard/resumen')

    expect(respuesta.resumen).toEqual({
      areas: 4,
      sensores: 15,
      conectados: 11,
      desconectados: 4,
      alertas_activas: 5,
    })
  })

  it('resume cada área con sus sensores y alertas activas', async () => {
    const respuesta = await apiFetch<DashboardRespuesta>('/dashboard/resumen')
    const norte = respuesta.areas.find((area) => area.area_id === 'campo_norte')
    const oeste = respuesta.areas.find((area) => area.area_id === 'campo_oeste')

    expect(norte).toMatchObject({ sensores: 5, conectados: 4, desconectados: 1, alertas_activas: 2 })
    expect(oeste).toMatchObject({ sensores: 3, conectados: 3, desconectados: 0, alertas_activas: 0 })
  })

  it('las áreas suman los totales generales', async () => {
    const { resumen, areas } = await apiFetch<DashboardRespuesta>('/dashboard/resumen')

    expect(areas.reduce((suma, area) => suma + area.sensores, 0)).toBe(resumen.sensores)
    expect(areas.reduce((suma, area) => suma + area.conectados, 0)).toBe(resumen.conectados)
  })

  it('devuelve las 5 últimas alertas, la más reciente primero', async () => {
    const respuesta = await apiFetch<DashboardRespuesta>('/dashboard/resumen')

    expect(respuesta.ultimas_alertas.map((alerta) => alerta.alerta_id)).toEqual([
      'alerta_001',
      'alerta_003',
      'alerta_004',
      'alerta_002',
      'alerta_006',
    ])
  })

  it('la última actualización es la comunicación más reciente de los sensores', async () => {
    const respuesta = await apiFetch<DashboardRespuesta>('/dashboard/resumen')

    // El sensor más reciente (sensor_009) comunicó hace 1 minuto.
    expect(Date.parse(respuesta.ultima_actualizacion)).toBe(ahoraMock() - 60_000)
  })
})