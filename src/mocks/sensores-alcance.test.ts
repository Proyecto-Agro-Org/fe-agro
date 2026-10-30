import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../api/client'
import { obtenerSensor } from '../api/sensor'
import { obtenerHistorico } from '../api/historico'
import { guardarToken } from '../api/sesion'
import { ahoraMock } from './data/db'
import * as generadores from './data/generadores'

const signal = () => new AbortController().signal
const filtros = () => ({
  variable: 'humedad' as const,
  desde: new Date(ahoraMock() - 3 * 86400000).toISOString(),
  hasta: new Date(ahoraMock()).toISOString(),
})
const HISTORICO = '/sensores/sensor_014/historico?variable=humedad&desde=2026-10-01&hasta=2026-10-31'
afterEach(() => vi.restoreAllMocks())

describe('alcance compartido de sensores, mediciones e históricos', () => {
  it.each([
    ['token-demo', 'campo_el_molino', 'sensor_014'],
    ['token-demo-lucia', 'campo_la_ribera', 'sensor_005'],
  ])('conserva lecturas y serie del sensor propio %s / %s / %s', async (token, campo, id) => {
    guardarToken(token)
    const sensor = await obtenerSensor(id, campo, signal())
    expect(sensor.device_id).toBe(id)
    expect(sensor.ultima_medicion).toEqual(generadores.generarMedicion(id))
    const historico = await obtenerHistorico(id, campo, filtros(), signal())
    const serie = generadores.generarSerie(id, 'humedad', filtros().desde, filtros().hasta, 1000)
    expect(historico.device_id).toBe(id)
    expect(historico.area_id).toBe(sensor.area_id)
    expect(historico.puntos).toEqual(serie.puntos)
    expect(historico.truncado).toBe(serie.truncado)
  })

  it('conserva null y la serie vacía de un sensor propio que nunca comunicó', async () => {
    guardarToken('token-demo-lucia')
    const sensor = await obtenerSensor('sensor_010', 'campo_la_ribera', signal())
    expect(sensor.ultima_medicion).toBeNull()
    const historico = await obtenerHistorico('sensor_010', 'campo_la_ribera', filtros(), signal())
    expect(historico.puntos).toEqual([])
    expect(historico.truncado).toBe(false)
  })

  it.each(['/sensores/sensor_014', HISTORICO])('valida la sesión y el campo también en consultas directas a %s', async (ruta) => {
    const separador = ruta.includes('?') ? '&' : '?'
    await expect(apiFetch(`${ruta}${separador}campo_id=campo_el_molino`)).rejects.toMatchObject({ estado: 401 })
    guardarToken('token-demo')
    await expect(apiFetch(ruta)).rejects.toMatchObject({ estado: 400 })
    await expect(apiFetch(`${ruta}${separador}campo_id=campo_el_molino&campo_id=campo_la_esperanza`)).rejects.toMatchObject({ estado: 400 })
    for (const campo of ['campo_la_esperanza', 'campo_la_ribera', 'campo_inexistente']) {
      await expect(apiFetch(`${ruta}${separador}campo_id=${campo}`)).rejects.toMatchObject({ estado: 404 })
    }
    guardarToken('token-demo-lucia')
    for (const campo of ['campo_la_ribera', 'campo_el_molino']) {
      await expect(apiFetch(`${ruta}${separador}campo_id=${campo}`)).rejects.toMatchObject({ estado: 404 })
    }
  })

  it('no ejecuta generadores ni revela filtros inválidos antes de autorizar el sensor', async () => {
    guardarToken('token-demo')
    const medicion = vi.spyOn(generadores, 'generarMedicion')
    const serie = vi.spyOn(generadores, 'generarSerie')
    await expect(obtenerSensor('sensor_014', 'campo_la_esperanza', signal())).rejects.toMatchObject({ estado: 404 })
    await expect(apiFetch('/sensores/sensor_014/historico?campo_id=campo_la_esperanza&variable=incorrecta')).rejects.toMatchObject({ estado: 404 })
    expect(medicion).not.toHaveBeenCalled()
    expect(serie).not.toHaveBeenCalled()
  })

  it('mantiene las validaciones de variable, período y límite para sensores autorizados', async () => {
    guardarToken('token-demo')
    for (const query of [
      'variable=incorrecta&desde=2026-10-01&hasta=2026-10-31',
      'variable=humedad&desde=invalido&hasta=2026-10-31',
      'variable=humedad&desde=2026-10-31&hasta=2026-10-01',
      'variable=humedad&desde=2026-10-01&hasta=2026-10-31&limit=1001',
    ]) {
      await expect(apiFetch(`/sensores/sensor_014/historico?campo_id=campo_el_molino&${query}`)).rejects.toMatchObject({ estado: 400 })
    }
  })

  it('un sensor inexistente no se confunde con uno propio sin mediciones', async () => {
    guardarToken('token-demo')
    await expect(obtenerSensor('sensor_inexistente', 'campo_el_molino', signal())).rejects.toMatchObject({ estado: 404 })
    await expect(obtenerHistorico('sensor_inexistente', 'campo_el_molino', filtros(), signal())).rejects.toMatchObject({ estado: 404 })
  })
})
