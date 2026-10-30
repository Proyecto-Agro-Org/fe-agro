import { afterEach, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { CAMPOS } from '../mocks/data/db'
import { server } from '../mocks/server'
import { obtenerCamposDemo } from './campos'
import { apiFetch } from './client'
import { guardarToken } from './sesion'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('campos del cliente autenticado', () => {
  it.each([
    ['token-demo', 'cliente_horizonte_verde', ['campo_el_molino', 'campo_la_esperanza']],
    ['token-demo-lucia', 'cliente_los_aromos', ['campo_la_ribera', 'campo_los_olivos']],
  ] as const)('consulta únicamente los campos asociados a %s', async (token, cliente, esperados) => {
    vi.stubEnv('VITE_USE_MOCKS', 'true')
    guardarToken(token)
    const campos = await obtenerCamposDemo(cliente, new AbortController().signal)
    expect(campos.map((campo) => campo.campo_id)).toEqual(esperados)
  })

  it('el mock ignora un cliente elegido en la URL y utiliza el token', async () => {
    guardarToken('token-demo')
    const { campos } = await apiFetch<{ campos: typeof CAMPOS }>('/auth/demo/campos?cliente_id=cliente_los_aromos')
    expect(campos.map((campo) => campo.campo_id)).toEqual(['campo_el_molino', 'campo_la_esperanza'])
  })

  it('rechaza tokens desconocidos', async () => {
    guardarToken('token-desconocido')
    await expect(apiFetch('/auth/demo/campos')).rejects.toMatchObject({ estado: 401 })
  })

  it('no llama endpoints demo sin mocks', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'false')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await expect(obtenerCamposDemo('cliente_horizonte_verde', new AbortController().signal)).rejects.toThrow('requiere mocks')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it.each([
    { campos: [CAMPOS[0], CAMPOS[0]] },
    { campos: [{ ...CAMPOS[0], campo_id: '' }] },
    { campos: [{ ...CAMPOS[0], nombre: '' }] },
    { campos: [CAMPOS[2]] },
    { campos: null },
  ])('rechaza respuestas inválidas: %j', async (cuerpo) => {
    vi.stubEnv('VITE_USE_MOCKS', 'true')
    guardarToken('token-demo')
    server.use(http.get('*/auth/demo/campos', () => HttpResponse.json(cuerpo)))
    await expect(obtenerCamposDemo('cliente_horizonte_verde', new AbortController().signal)).rejects.toThrow('no corresponde')
  })
})
