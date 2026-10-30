import { http, HttpResponse } from 'msw'
import {
  alertasActivas,
  buscarArea,
  estadoSensor,
  sensoresDeArea,
  ultimaComunicacion,
} from '../data/db'
import { escenarioPara } from '../escenarios'
import type { AreaDetalle, SensoresDeAreaRespuesta } from '../../types/areaDetalle'
import { campoAutorizado } from '../data/alcance'
export default [
  http.get('*/areas/:areaId', async ({ params, request }) => {
    const campo = campoAutorizado(request)
    if (campo instanceof Response) return campo
    const area = buscarArea(String(params.areaId))
    if (!area || area.campo_id !== campo.campo_id) return HttpResponse.json({ error: 'No encontramos esta área' }, { status: 404 })
    const escenario = await escenarioPara('area')
    if (escenario.tipo === 'respuesta') return escenario.respuesta
    return HttpResponse.json<AreaDetalle>(area)
  }),
  http.get('*/areas/:areaId/sensores', async ({ params, request }) => {
    const campo = campoAutorizado(request)
    if (campo instanceof Response) return campo
    const id = String(params.areaId)
    if (buscarArea(id)?.campo_id !== campo.campo_id)
      return HttpResponse.json({ error: 'No encontramos esta área' }, { status: 404 })
    const escenario = await escenarioPara('area-sensores')
    if (escenario.tipo === 'respuesta') return escenario.respuesta
    const alertas = alertasActivas(id)
    return HttpResponse.json<SensoresDeAreaRespuesta>({
      sensores:
        escenario.tipo === 'vacio'
          ? []
          : sensoresDeArea(id).map((sensor) => ({
              device_id: sensor.device_id,
              nombre: sensor.nombre,
              estado: estadoSensor(sensor),
              ultima_comunicacion: ultimaComunicacion(sensor),
              ubicacion: sensor.ubicacion,
              alertas_activas: alertas.filter((alerta) => alerta.device_id === sensor.device_id)
                .length,
            })),
    })
  }),
]
