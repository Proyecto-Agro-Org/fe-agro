import { describe, expect, it } from 'vitest'
import { apiFetch } from '../api/client'
import type { AlertasRespuesta } from '../types/alertas'

describe('GET /alertas (mock)', () => {
  it('devuelve el total de activas aunque limit sea 1', async () => {
    const respuesta = await apiFetch<AlertasRespuesta>('/alertas?estado=activa&limit=1')
    expect(respuesta.total).toBe(5)
    expect(respuesta.alertas).toHaveLength(1)
  })

  it('ordena por severidad de alta a baja y, dentro de cada una, más reciente primero', async () => {
    const respuesta = await apiFetch<AlertasRespuesta>('/alertas?estado=activa')
    expect(respuesta.alertas.map((a) => a.alerta_id)).toEqual([
      'alerta_001',
      'alerta_002',
      'alerta_005',
      'alerta_003',
      'alerta_004',
    ])
  })

  it('filtra por área', async () => {
    const respuesta = await apiFetch<AlertasRespuesta>('/alertas?estado=activa&area_id=campo_sur')
    expect(respuesta.alertas.map((a) => a.alerta_id)).toEqual(['alerta_002', 'alerta_004'])
  })

  it('rechaza un limit fuera de rango con 400', async () => {
    await expect(apiFetch('/alertas?limit=0')).rejects.toMatchObject({ estado: 400 })
  })
})