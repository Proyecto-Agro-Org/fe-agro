import { http, HttpResponse } from 'msw'
import type { AlertasRespuesta } from '../../types/alertas'
import { ALERTAS, alertaParaApi, buscarArea } from '../data/db'
import { campoAutorizado, sensoresDelCampo } from '../data/alcance'
import { escenarioPara } from '../escenarios'

const LIMITE_POR_DEFECTO = 50
const LIMITE_MAXIMO = 200

// El orden lo hace el backend: severidad de alta a baja y, dentro de cada una, más reciente primero.
const ORDEN_SEVERIDAD: Record<string, number> = { alta: 0, media: 1, baja: 2 }

function pedidoInvalido(mensaje: string) {
  return HttpResponse.json({ error: mensaje }, { status: 400 })
}

export default [
  http.get('*/alertas', async ({ request }) => {
    const campo = campoAutorizado(request)
    if (campo instanceof Response) return campo
    const params = new URL(request.url).searchParams
    const areaId = params.get('area_id')
    if (areaId !== null && buscarArea(areaId)?.campo_id !== campo.campo_id) {
      return HttpResponse.json({ error: 'Área no disponible' }, { status: 404 })
    }
    const resultado = await escenarioPara('alertas')
    if (resultado.tipo === 'respuesta') return resultado.respuesta


    const textoLimit = params.get('limit')
    const limit = textoLimit === null ? LIMITE_POR_DEFECTO : Number(textoLimit)
    if (!Number.isInteger(limit) || limit < 1 || limit > LIMITE_MAXIMO) {
      return pedidoInvalido(`limit debe ser un entero entre 1 y ${LIMITE_MAXIMO}`)
    }

    const textoDesde = params.get('desde')
    const textoHasta = params.get('hasta')
    const desde = textoDesde === null ? null : Date.parse(textoDesde)
    const hasta = textoHasta === null ? null : Date.parse(textoHasta)
    if (Number.isNaN(desde) || Number.isNaN(hasta)) {
      return pedidoInvalido('desde y hasta deben ser fechas ISO 8601')
    }

    if (resultado.tipo === 'vacio') {
      const vacia: AlertasRespuesta = { total: 0, limit, alertas: [] }
      return HttpResponse.json(vacia)
    }

    const tipo = params.get('tipo')
    const estado = params.get('estado')
    const severidad = params.get('severidad')

    const idsSensores = new Set(sensoresDelCampo(campo).map((sensor) => sensor.device_id))
    const filtradas = ALERTAS.filter((alerta) => idsSensores.has(alerta.device_id)).map(alertaParaApi)
      .filter((alerta) => {
        if (areaId !== null && alerta.area_id !== areaId) return false
        if (tipo !== null && alerta.tipo !== tipo) return false
        if (estado !== null && alerta.estado !== estado) return false
        if (severidad !== null && alerta.severidad !== severidad) return false
        const instante = Date.parse(alerta.timestamp)
        if (desde !== null && instante < desde) return false
        if (hasta !== null && instante > hasta) return false
        return true
      })
      .sort(
        (a, b) =>
          ORDEN_SEVERIDAD[a.severidad] - ORDEN_SEVERIDAD[b.severidad] ||
          Date.parse(b.timestamp) - Date.parse(a.timestamp),
      )

    const respuesta: AlertasRespuesta = {
      total: filtradas.length,
      limit,
      alertas: filtradas.slice(0, limit),
    }
    return HttpResponse.json(respuesta)
  }),
]
