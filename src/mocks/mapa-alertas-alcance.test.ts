import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../api/client'
import { obtenerMapa } from '../api/mapa'
import { obtenerAlertas } from '../api/alertas'
import { guardarToken } from '../api/sesion'
import { ahoraMock, buscarArea, buscarSensor } from './data/db'
import * as generadores from './data/generadores'

afterEach(() => vi.restoreAllMocks())

describe('alcance de Mapa y Alertas', () => {
  it.each([
    ['token-demo', 'campo_el_molino', 8, 7, 2],
    ['token-demo-lucia', 'campo_la_ribera', 7, 7, 3],
    ['token-demo', 'campo_la_esperanza', 0, 0, 0],
    ['token-demo-lucia', 'campo_los_olivos', 0, 0, 0],
  ] as const)('devuelve solo sensores y alertas de %s / %s', async (token, campo, total, ubicados, activas) => {
    guardarToken(token)
    const mapa = await obtenerMapa(campo, new AbortController().signal)
    const alertas = await obtenerAlertas(campo, { estado: 'activa', limit: 1 })
    expect(mapa.sensores).toHaveLength(total)
    expect(mapa.sensores.filter((sensor) => sensor.ubicacion)).toHaveLength(ubicados)
    expect(alertas.total).toBe(activas)
    expect(alertas.alertas).toHaveLength(activas ? 1 : 0)
    for (const sensor of mapa.sensores) {
      expect(buscarArea(sensor.area_id)?.campo_id).toBe(campo)
      const medicion = generadores.generarMedicion(sensor.device_id)
      expect(sensor.ultima_medicion).toEqual(medicion ? {
        timestamp: medicion.timestamp, humedad: medicion.humedad, temperatura: medicion.temperatura,
      } : null)
    }
    for (const alerta of alertas.alertas) {
      expect(buscarArea(alerta.area_id)?.campo_id).toBe(campo)
      expect(buscarSensor(alerta.device_id)?.area_id).toBe(alerta.area_id)
    }
  })

  it.each(['/mapa/sensores', '/alertas', '/alertas/areas'])('rechaza consultas directas sin identidad o con alcance inválido: %s', async (ruta) => {
    await expect(apiFetch(`${ruta}?campo_id=campo_el_molino`)).rejects.toMatchObject({ estado: 401 })
    guardarToken('token-demo')
    for (const [query, estado] of [
      ['', 400], ['?campo_id=', 400],
      ['?campo_id=campo_el_molino&campo_id=campo_la_ribera', 400],
      ['?campo_id=campo_la_ribera', 404], ['?campo_id=campo_desconocido', 404],
    ] as const) {
      await expect(apiFetch(`${ruta}${query}`)).rejects.toMatchObject({ estado })
    }
  })

  it('conserva severidad, estado, tipo, rango y límites dentro del campo', async () => {
    guardarToken('token-demo')
    const altas = await obtenerAlertas('campo_el_molino', { estado: 'activa', severidad: 'alta' })
    expect(altas.alertas.map((alerta) => alerta.alerta_id)).toEqual(['alerta_001'])
    const resueltas = await obtenerAlertas('campo_el_molino', { estado: 'resuelta', severidad: 'media' })
    expect(resueltas.alertas.map((alerta) => alerta.alerta_id)).toEqual(['alerta_006'])
    const agronomicas = await obtenerAlertas('campo_el_molino', { estado: 'activa', tipo: 'agronomica' })
    expect(agronomicas.alertas.map((alerta) => alerta.alerta_id)).toEqual(['alerta_003'])
    const recientes = await obtenerAlertas('campo_el_molino', {
      estado: 'activa', desde: new Date(ahoraMock() - 20 * 60000).toISOString(), hasta: new Date(ahoraMock()).toISOString(),
    })
    expect(recientes.alertas.map((alerta) => alerta.alerta_id)).toEqual(['alerta_001'])
    await expect(obtenerAlertas('campo_el_molino', { limit: 201 })).rejects.toMatchObject({ estado: 400 })
  })

  it('rechaza áreas ajenas o inexistentes sin convertirlas en un filtro autorizado', async () => {
    guardarToken('token-demo')
    for (const area_id of ['campo_sur', 'area_inexistente']) {
      await expect(obtenerAlertas('campo_el_molino', { area_id })).rejects.toMatchObject({ estado: 404 })
    }
    await expect(obtenerAlertas('campo_la_esperanza', { area_id: 'campo_norte' })).rejects.toMatchObject({ estado: 404 })
    expect((await obtenerAlertas('campo_el_molino', { estado: 'activa', area_id: 'campo_oeste' })).total).toBe(0)
  })

  it('no genera mediciones antes de autorizar y no confía en cliente_id', async () => {
    guardarToken('token-demo')
    const generar = vi.spyOn(generadores, 'generarMedicion')
    await expect(obtenerMapa('campo_la_ribera', new AbortController().signal)).rejects.toMatchObject({ estado: 404 })
    expect(generar).not.toHaveBeenCalled()
    const respuesta = await apiFetch<{ alertas: { area_id: string }[] }>('/alertas?campo_id=campo_el_molino&cliente_id=cliente_los_aromos')
    expect(respuesta.alertas.every((alerta) => buscarArea(alerta.area_id)?.campo_id === 'campo_el_molino')).toBe(true)
  })

  it('el antiguo catálogo auxiliar tampoco devuelve datos globales', async () => {
    guardarToken('token-demo')
    const respuesta = await apiFetch<{ areas: { area_id: string }[] }>('/alertas/areas?campo_id=campo_el_molino')
    expect(respuesta.areas.map((area) => area.area_id)).toEqual(['campo_norte', 'campo_oeste'])
  })
})
