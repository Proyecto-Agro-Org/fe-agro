import { http, HttpResponse } from 'msw'
import type { LoginPedido, LoginRespuesta } from '../../types/auth'
import { escenarioPara } from '../escenarios'

// Credenciales de prueba del mock. No son reales: solo existen mientras corre el mock.
export const EMAIL_DEMO = 'demo@agro.com'
export const PASSWORD_DEMO = 'demo1234'

export default [
  http.post('*/auth/google-demo', async () => {
    const resultado = await escenarioPara('login')
    if (resultado.tipo === 'respuesta') return resultado.respuesta

    const respuesta: LoginRespuesta = {
      token: 'token-demo',
      usuario: { nombre: 'Usuaria Demo', email: EMAIL_DEMO },
    }
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

    if (pedido.email !== EMAIL_DEMO || pedido.password !== PASSWORD_DEMO) {
      return HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const respuesta: LoginRespuesta = {
      token: 'token-demo',
      usuario: { nombre: 'Usuaria Demo', email: EMAIL_DEMO },
    }
    return HttpResponse.json(respuesta)
  }),
]
