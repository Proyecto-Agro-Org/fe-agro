import { http, HttpResponse } from 'msw'
import { buscarArea, estadoSensor, ultimaComunicacion } from '../data/db'
import { campoAutorizado, sensoresDelCampo } from '../data/alcance'
import { generarMedicion } from '../data/generadores'
import { escenarioPara } from '../escenarios'
import type { MapaRespuesta } from '../../types/mapa'
export default [
  http.get('*/mapa/sensores', async ({ request }) => {
    const campo = campoAutorizado(request)
    if (campo instanceof Response) return campo
    const escenario = await escenarioPara('mapa')
    if (escenario.tipo === 'respuesta') return escenario.respuesta
    return HttpResponse.json<MapaRespuesta>({
      sensores:
        escenario.tipo === 'vacio'
          ? []
          : sensoresDelCampo(campo).map((sensor) => {
              const medicion = generarMedicion(sensor.device_id)
              return {
                device_id: sensor.device_id,
                nombre: sensor.nombre,
                area_id: sensor.area_id,
                area_nombre: buscarArea(sensor.area_id)?.nombre ?? sensor.area_id,
                estado: estadoSensor(sensor),
                ubicacion: sensor.ubicacion,
                ultima_comunicacion: ultimaComunicacion(sensor),
                ultima_medicion: medicion
                  ? {
                      timestamp: medicion.timestamp,
                      humedad: medicion.humedad,
                      temperatura: medicion.temperatura,
                    }
                  : null,
              }
            }),
    })
  }),
]
