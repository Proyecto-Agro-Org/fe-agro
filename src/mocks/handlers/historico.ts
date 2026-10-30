import { http, HttpResponse } from 'msw'
import { buscarArea } from '../data/db'
import { sensorAutorizado } from '../data/alcance'
import { generarSerie, type Variable } from '../data/generadores'
import { escenarioPara } from '../escenarios'
import type { HistoricoRespuesta } from '../../types/historico'
const UNIDADES: Record<Variable, string> = {
  humedad: '%',
  temperatura: '°C',
  conductividad: 'dS/m',
  nitrogeno: 'mg/kg',
  fosforo: 'mg/kg',
  potasio: 'mg/kg',
}
export default [
  http.get('*/sensores/:deviceId/historico', async ({ params, request }) => {
    const sensor = sensorAutorizado(request, String(params.deviceId))
    if (sensor instanceof Response) return sensor
    const query = new URL(request.url).searchParams
    const variable = query.get('variable') as Variable
    if (!Object.hasOwn(UNIDADES, variable))
      return HttpResponse.json({ error: 'Variable inválida' }, { status: 400 })
    try {
      const serie = generarSerie(
        sensor.device_id,
        variable,
        query.get('desde') ?? '',
        query.get('hasta') ?? '',
        Number(query.get('limit') ?? 500),
      )
      const escenario = await escenarioPara('historico')
      if (escenario.tipo === 'respuesta') return escenario.respuesta
      return HttpResponse.json<HistoricoRespuesta>({
        device_id: sensor.device_id,
        nombre: sensor.nombre,
        area_id: sensor.area_id,
        area_nombre: buscarArea(sensor.area_id)?.nombre ?? sensor.area_id,
        variable,
        unidad: UNIDADES[variable],
        puntos: escenario.tipo === 'vacio' ? [] : serie.puntos,
        truncado: escenario.tipo === 'vacio' ? false : serie.truncado,
      })
    } catch (error) {
      if (error instanceof RangeError)
        return HttpResponse.json({ error: error.message }, { status: 400 })
      throw error
    }
  }),
]
