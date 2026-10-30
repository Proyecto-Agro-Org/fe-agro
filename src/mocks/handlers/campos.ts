import { http, HttpResponse } from 'msw'
import { camposDeCliente } from '../data/db'
import { identidadPorToken } from '../data/identidades'
import { escenarioPara } from '../escenarios'

export default [
  http.get('*/auth/demo/campos', async ({ request }) => {
    const autorizacion = request.headers.get('Authorization') ?? ''
    const identidad = autorizacion.startsWith('Bearer ')
      ? identidadPorToken(autorizacion.slice(7))
      : undefined
    if (!identidad) return HttpResponse.json({ error: 'Sesión demo inválida' }, { status: 401 })
    const escenario = await escenarioPara('campos')
    if (escenario.tipo === 'respuesta') return escenario.respuesta
    return HttpResponse.json({
      campos: escenario.tipo === 'vacio' ? [] : camposDeCliente(identidad.cliente.cliente_id),
    })
  }),
]
