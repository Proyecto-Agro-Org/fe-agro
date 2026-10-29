import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../mocks/server'
import { ErrorApi } from '../types/comun'
import { apiFetch, conParametros } from './client'
import { alExpirarSesion, guardarToken, leerToken } from './sesion'

describe('apiFetch', () => {
  it('devuelve el JSON y manda el token cuando hay sesión', async () => {
    let autorizacion: string | null = null
    server.use(
      http.get('*/api/v1/prueba', ({ request }) => {
        autorizacion = request.headers.get('authorization')
        return HttpResponse.json({ ok: true })
      }),
    )
    guardarToken('token-de-prueba')

    const respuesta = await apiFetch<{ ok: boolean }>('/prueba')

    expect(respuesta).toEqual({ ok: true })
    expect(autorizacion).toBe('Bearer token-de-prueba')
  })

  it('no manda Authorization si no hay sesión', async () => {
    let autorizacion: string | null = 'sin-valor'
    server.use(
      http.get('*/api/v1/prueba', ({ request }) => {
        autorizacion = request.headers.get('authorization')
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/prueba')

    expect(autorizacion).toBeNull()
  })

  it('con sinSesion no manda el token aunque exista', async () => {
    let autorizacion: string | null = 'sin-valor'
    server.use(
      http.get('*/api/v1/prueba', ({ request }) => {
        autorizacion = request.headers.get('authorization')
        return HttpResponse.json({ ok: true })
      }),
    )
    guardarToken('token-de-prueba')

    await apiFetch('/prueba', { sinSesion: true })

    expect(autorizacion).toBeNull()
  })

  it('un error HTTP lanza ErrorApi con el estado y el mensaje del servidor', async () => {
    server.use(
      http.get('*/api/v1/prueba', () =>
        HttpResponse.json({ error: 'No existe' }, { status: 404 }),
      ),
    )

    const pedido = apiFetch('/prueba')

    await expect(pedido).rejects.toBeInstanceOf(ErrorApi)
    await expect(pedido).rejects.toMatchObject({ estado: 404, message: 'No existe' })
  })

  it('un 401 fuera del login cierra la sesión y avisa', async () => {
    server.use(
      http.get('*/api/v1/prueba', () =>
        HttpResponse.json({ error: 'Sin sesión' }, { status: 401 }),
      ),
    )
    guardarToken('token-de-prueba')
    let avisos = 0
    const dejarDeEscuchar = alExpirarSesion(() => {
      avisos += 1
    })

    await expect(apiFetch('/prueba')).rejects.toMatchObject({ estado: 401 })

    expect(avisos).toBe(1)
    expect(leerToken()).toBeNull()
    dejarDeEscuchar()
  })

  it('un 401 del login no cierra la sesión', async () => {
    server.use(
      http.post('*/api/v1/auth/login', () =>
        HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 }),
      ),
    )
    guardarToken('token-de-prueba')
    let avisos = 0
    const dejarDeEscuchar = alExpirarSesion(() => {
      avisos += 1
    })

    await expect(
      apiFetch('/auth/login', { method: 'POST', body: {}, sinSesion: true }),
    ).rejects.toMatchObject({ estado: 401, message: 'Credenciales inválidas' })

    expect(avisos).toBe(0)
    expect(leerToken()).toBe('token-de-prueba')
    dejarDeEscuchar()
  })

  it('sin conexión lanza ErrorApi con estado null', async () => {
    server.use(http.get('*/api/v1/prueba', () => HttpResponse.error()))

    const pedido = apiFetch('/prueba')

    await expect(pedido).rejects.toBeInstanceOf(ErrorApi)
    await expect(pedido).rejects.toMatchObject({ estado: null })
  })

  it('un POST manda el cuerpo como JSON', async () => {
    let cuerpo: unknown = null
    server.use(
      http.post('*/api/v1/auth/login', async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json({ token: 'devuelto' })
      }),
    )

    const respuesta = await apiFetch<{ token: string }>('/auth/login', {
      method: 'POST',
      body: { email: 'a@b.com', password: 'dato' },
      sinSesion: true,
    })

    expect(cuerpo).toEqual({ email: 'a@b.com', password: 'dato' })
    expect(respuesta.token).toBe('devuelto')
  })
})

describe('conParametros', () => {
  it('arma la query y sasaltea los parámetros sin valor', () => {
    expect(conParametros('/alertas', { estado: 'activa', area_id: undefined, limit: 50 })).toBe(
      '/alertas?estado=activa&limit=50',
    )
  })

  it('sin parámetros devuelve la ruta sola', () => {
    expect(conParametros('/areas', {})).toBe('/areas')
  })
})