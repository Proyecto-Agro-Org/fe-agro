import { beforeAll, describe, expect, it } from 'vitest'
import {
  ALERTAS,
  AREAS,
  SENSORES,
  alertasActivas,
  buscarSensor,
  estadoSensor,
  fijarAhoraMock,
  sensoresDeArea,
  ultimaComunicacion,
} from './db'

const ESPERADO: Record<
  string,
  { sensores: number; conectados: number; desconectados: number; alertas: number }
> = {
  campo_norte: { sensores: 5, conectados: 4, desconectados: 1, alertas: 2 },
  campo_sur: { sensores: 4, conectados: 2, desconectados: 2, alertas: 2 },
  campo_este: { sensores: 3, conectados: 2, desconectados: 1, alertas: 1 },
  campo_oeste: { sensores: 3, conectados: 3, desconectados: 0, alertas: 0 },
}

beforeAll(() => {
  fijarAhoraMock(Date.parse('2026-10-27T13:05:00Z'))
})

describe('datos de ejemplo', () => {
  it('tiene 4 áreas, 15 sensores y 6 alertas', () => {
    expect(AREAS).toHaveLength(4)
    expect(SENSORES).toHaveLength(15)
    expect(ALERTAS).toHaveLength(6)
  })

  it('tiene 11 sensores conectados y 4 desconectados', () => {
    expect(SENSORES.filter((s) => estadoSensor(s) === 'conectado')).toHaveLength(11)
    expect(SENSORES.filter((s) => estadoSensor(s) === 'desconectado')).toHaveLength(4)
  })

  it('tiene 5 alertas activas', () => {
    expect(alertasActivas()).toHaveLength(5)
  })

  it('los conteos por área coinciden con la guía', () => {
    AREAS.forEach((area) => {
      const sensores = sensoresDeArea(area.area_id)
      const esperado = ESPERADO[area.area_id]
      expect(sensores).toHaveLength(esperado.sensores)
      expect(sensores.filter((s) => estadoSensor(s) === 'conectado')).toHaveLength(
        esperado.conectados,
      )
      expect(sensores.filter((s) => estadoSensor(s) === 'desconectado')).toHaveLength(
        esperado.desconectados,
      )
      expect(alertasActivas(area.area_id)).toHaveLength(esperado.alertas)
    })
  })

  it('un sensor que nunca comunicó figura desconectado y sin fecha', () => {
    const sensor = buscarSensor('sensor_010')!
    expect(estadoSensor(sensor)).toBe('desconectado')
    expect(ultimaComunicacion(sensor)).toBeNull()
  })

  it('los identificadores van en minúsculas y con guion bajo', () => {
    const ids = [
      ...AREAS.map((a) => a.area_id),
      ...SENSORES.map((s) => s.device_id),
      ...ALERTAS.map((a) => a.alerta_id),
    ]
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9_]+$/))
  })
})