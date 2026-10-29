import { http, HttpResponse } from 'msw'
import { buscarArea, buscarSensor, estadoSensor, ultimaComunicacion } from '../data/db'
import { generarMedicion } from '../data/generadores'
import { escenarioPara } from '../escenarios'
import type { SensorDetalle } from '../../types/sensor'
export default [
  http.get('*/sensores/:deviceId', async ({ params }) => {
    const sensor = buscarSensor(String(params.deviceId))
    if (!sensor) return HttpResponse.json({ error: 'No encontramos este sensor' }, { status: 404 })
    const escenario = await escenarioPara('sensor')
    if (escenario.tipo === 'respuesta') return escenario.respuesta
    return HttpResponse.json<SensorDetalle>({
      device_id: sensor.device_id,
      nombre: sensor.nombre,
      area_id: sensor.area_id,
      area_nombre: buscarArea(sensor.area_id)?.nombre ?? sensor.area_id,
      estado: estadoSensor(sensor),
      ultima_comunicacion: ultimaComunicacion(sensor),
      ubicacion: sensor.ubicacion,
      ultima_medicion: escenario.tipo === 'vacio' ? null : generarMedicion(sensor.device_id),
    })
  }),
]
