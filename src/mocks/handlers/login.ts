import { http, HttpResponse } from 'msw'
import type { LoginPedido, LoginRespuesta } from '../../types/auth'
import { escenarioPara } from '../escenarios'
import { EMAIL_DEMO, PASSWORD_DEMO, identidadPorToken, sesionPorEmail } from '../data/identidades'

// Credenciales de prueba del mock. No son reales: solo existen mientras corre el mock.
export { EMAIL_DEMO, PASSWORD_DEMO } from '../data/identidades'

export default [
  http.post('*/auth/demo/sesion', async ({ request }) => {
    const resultado = await escenarioPara('login')
    if (resultado.tipo === 'respuesta') return resultado.respuesta
    let token: unknown
    try {
      token = ((await request.json()) as { token?: unknown }).token
    } catch {
      return HttpResponse.json({ error: 'El cuerpo debe ser JSON' }, { status: 400 })
    }
    const identidad = typeof token === 'string' ? identidadPorToken(token) : undefined
    return identidad
      ? HttpResponse.json(identidad)
      : HttpResponse.json({ error: 'Sesión demo inválida' }, { status: 401 })
  }),
  http.post('*/auth/google-demo', async () => {
    const resultado = await escenarioPara('login')
    if (resultado.tipo === 'respuesta') return resultado.respuesta

    const respuesta = sesionPorEmail(EMAIL_DEMO)
    if (!respuesta) return HttpResponse.json({ error: 'Identidad demo no disponible' }, { status: 500 })
    return HttpResponse.json(respuesta)
  }),
  http.post('*/auth/login', async ({ request }) => {
    // "Vacío" no aplica al login: ese escenario se trata como uno normal.
    const resultado = await escenarioPara('login')
    if (resultado.tipo === 'respuesta') return resultado.respuesta

    let pedido: Partial<LoginPedido>
    try {
      pedido = (await request.json()) as Partial<LoginPedido>
    } catch {
      return HttpResponse.json({ error: 'El cuerpo debe ser JSON' }, { status: 400 })
    }

    const respuesta: LoginRespuesta | undefined = typeof pedido.email === 'string'
      ? sesionPorEmail(pedido.email)
      : undefined
    if (!respuesta || pedido.password !== PASSWORD_DEMO) {
      return HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    return HttpResponse.json(respuesta)
  }),
]
