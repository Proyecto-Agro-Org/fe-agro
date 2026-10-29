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
export default [
  http.get('*/areas/:areaId', async ({ params }) => {
    const area = buscarArea(String(params.areaId))
    if (!area) return HttpResponse.json({ error: 'No encontramos esta área' }, { status: 404 })
    const escenario = await escenarioPara('area')
    if (escenario.tipo === 'respuesta') return escenario.respuesta
    return HttpResponse.json<AreaDetalle>(area)
  }),
  http.get('*/areas/:areaId/sensores', async ({ params }) => {
    const id = String(params.areaId)
    if (!buscarArea(id))
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
