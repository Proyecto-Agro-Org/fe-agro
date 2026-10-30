import { describe, expect, it } from 'vitest'
import { apiFetch } from '../api/client'
import { obtenerDashboard } from '../api/dashboard'
import { obtenerAreas } from '../api/areas'
import { guardarToken } from '../api/sesion'
import { ahoraMock, buscarArea, buscarSensor } from './data/db'

const RUTAS = ['/dashboard/resumen', '/areas', '/areas/campo_norte', '/areas/campo_norte/sensores']

describe('alcance por campo de Dashboard y Áreas', () => {
  it.each([
    ['token-demo', 'campo_el_molino', ['campo_norte', 'campo_oeste'], 8, 7, 1, 2, 2],
    ['token-demo-lucia', 'campo_la_ribera', ['campo_sur', 'campo_este'], 7, 4, 3, 3, 1],
    ['token-demo', 'campo_la_esperanza', [], 0, 0, 0, 0, null],
    ['token-demo-lucia', 'campo_los_olivos', [], 0, 0, 0, 0, null],
  ] as const)('calcula datos reales de %s / %s sin sumar otros campos', async (token, campo, ids, sensores, conectados, desconectados, alertas, minutos) => {
    guardarToken(token)
    const dashboard = await obtenerDashboard(campo)
    const listado = await obtenerAreas(campo)
    expect(dashboard.resumen).toEqual({ areas: ids.length, sensores, conectados, desconectados, alertas_activas: alertas })
    expect(dashboard.areas.map((area) => area.area_id)).toEqual(ids)
    expect(listado.areas.map((area) => area.area_id)).toEqual(ids)
    expect(listado.areas.every((area) => area.campo_id === campo)).toBe(true)
    expect(dashboard.ultima_actualizacion).toBe(minutos === null ? null : new Date(ahoraMock() - minutos * 60_000).toISOString())
    for (const alerta of dashboard.ultimas_alertas) {
      const sensor = buscarSensor(alerta.device_id)!
      expect(buscarArea(sensor.area_id)?.campo_id).toBe(campo)
    }
    if (ids.length === 0) expect(dashboard.ultimas_alertas).toEqual([])
    expect(listado.areas.reduce((suma, area) => suma + area.sensores, 0)).toBe(sensores)
    expect(listado.areas.reduce((suma, area) => suma + area.alertas_activas, 0)).toBe(alertas)
  })

  it.each(RUTAS)('rechaza acceso sin sesión a %s', async (ruta) => {
    await expect(apiFetch(`${ruta}?campo_id=campo_el_molino`)).rejects.toMatchObject({ estado: 401 })
  })

  it.each(RUTAS)('valida el campo en consultas directas a %s', async (ruta) => {
    guardarToken('token-demo')
    for (const [query, estado] of [
      ['', 400], ['?campo_id=', 400],
      ['?campo_id=campo_el_molino&campo_id=campo_la_ribera', 400],
      ['?campo_id=campo_inexistente', 404], ['?campo_id=campo_la_ribera', 404],
    ] as const) {
      await expect(apiFetch(`${ruta}${query}`)).rejects.toMatchObject({ estado })
    }
  })

  it('ignora el cliente elegido en la URL y usa el de la identidad', async () => {
    guardarToken('token-demo')
    const respuesta = await apiFetch<{ areas: { area_id: string }[] }>('/areas?campo_id=campo_el_molino&cliente_id=cliente_los_aromos')
    expect(respuesta.areas.map((area) => area.area_id)).toEqual(['campo_norte', 'campo_oeste'])
  })

  it.each(['/areas/campo_norte', '/areas/campo_norte/sensores'])('no revela un área ajena mediante %s', async (ruta) => {
    guardarToken('token-demo')
    // Campo válido del mismo cliente, pero el área no pertenece a ese campo.
    await expect(apiFetch(`${ruta}?campo_id=campo_la_esperanza`)).rejects.toMatchObject({ estado: 404 })
    guardarToken('token-demo-lucia')
    await expect(apiFetch(`${ruta}?campo_id=campo_la_ribera`)).rejects.toMatchObject({ estado: 404 })
    await expect(apiFetch(`${ruta}?campo_id=campo_el_molino`)).rejects.toMatchObject({ estado: 404 })
  })
})
