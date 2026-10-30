import { describe, expect, it } from 'vitest'
import { apiFetch } from '../api/client'
import type { AreasRespuesta } from '../types/areas'
import { ahoraMock } from './data/db'
import { guardarToken } from '../api/sesion'

function consultarAreas(token = 'token-demo', campo = 'campo_el_molino') {
  guardarToken(token)
  return apiFetch<AreasRespuesta>(`/areas?campo_id=${campo}`)
}

describe('GET /areas (mock)', () => {
  it('devuelve las áreas del campo seleccionado', async () => {
    const respuesta = await consultarAreas()

    expect(respuesta.areas.map((area) => area.area_id)).toEqual([
      'campo_norte',
      'campo_oeste',
    ])
  })

  it('cuenta sensores, conectados, desconectados y alertas activas de cada área', async () => {
    const ana = await consultarAreas()
    const lucia = await consultarAreas('token-demo-lucia', 'campo_la_ribera')
    const areas = [...ana.areas, ...lucia.areas]
    const porId = (id: string) => areas.find((area) => area.area_id === id)

    expect(porId('campo_norte')).toMatchObject({
      sensores: 5,
      conectados: 4,
      desconectados: 1,
      alertas_activas: 2,
    })
    expect(porId('campo_sur')).toMatchObject({
      sensores: 4,
      conectados: 2,
      desconectados: 2,
      alertas_activas: 2,
    })
    expect(porId('campo_este')).toMatchObject({
      sensores: 3,
      conectados: 2,
      desconectados: 1,
      alertas_activas: 1,
    })
    expect(porId('campo_oeste')).toMatchObject({
      sensores: 3,
      conectados: 3,
      desconectados: 0,
      alertas_activas: 0,
    })
  })

  it('la última actualización de cada área es la comunicación más reciente de sus sensores', async () => {
    const ana = await consultarAreas()
    const lucia = await consultarAreas('token-demo-lucia', 'campo_la_ribera')
    const areas = [...ana.areas, ...lucia.areas]
    const minutosAtras = (id: string) => {
      const fecha = areas.find((area) => area.area_id === id)?.ultima_actualizacion
      return fecha ? (ahoraMock() - Date.parse(fecha)) / 60_000 : null
    }

    expect(minutosAtras('campo_norte')).toBe(2)
    expect(minutosAtras('campo_sur')).toBe(1)
    expect(minutosAtras('campo_este')).toBe(5)
    expect(minutosAtras('campo_oeste')).toBe(3)
  })
})
