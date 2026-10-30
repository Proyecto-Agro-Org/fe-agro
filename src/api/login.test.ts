import { afterEach, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { guardarToken } from './sesion'
import { loginGoogleDemo, recuperarIdentidadDemo } from './login'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('loginGoogleDemo', () => {
  it.each(['false', undefined, 'TRUE'])('no realiza solicitudes sin mocks (%s)', async (valor) => {
    vi.stubEnv('VITE_USE_MOCKS', valor)
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await expect(loginGoogleDemo()).rejects.toThrow('El acceso con Google todavía no está disponible.')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('recibe del mock una sesión demo sin credenciales', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true')

    await expect(loginGoogleDemo()).resolves.toEqual({
      token: 'token-demo',
      usuario: {
        usuario_id: 'usuario_ana_rios', nombre: 'Ana Ríos',
        email: 'ana.rios@horizonte-verde.example', cliente_id: 'cliente_horizonte_verde',
      },
      cliente: { cliente_id: 'cliente_horizonte_verde', nombre: 'Agropecuaria Horizonte Verde' },
    })
  })

  it('no envía un token previo ni credenciales al endpoint demo', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true')
    guardarToken('token-anterior')
    let pedido: Request | undefined
    server.use(http.post('*/auth/google-demo', ({ request }) => {
      pedido = request
      return HttpResponse.json({ token: 'token-demo' })
    }))

    await loginGoogleDemo()

    expect(pedido).toBeDefined()
    expect(pedido!.headers.get('Authorization')).toBeNull()
    expect(await pedido!.text()).toBe('')
  })
})

describe('recuperarIdentidadDemo', () => {
  it('no consulta endpoints demo cuando los mocks están apagados', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'false')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await expect(recuperarIdentidadDemo('token-demo')).rejects.toThrow('requiere mocks')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
