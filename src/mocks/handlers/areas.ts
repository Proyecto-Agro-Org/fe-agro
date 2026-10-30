import { http, HttpResponse } from 'msw'
import type { AreaResumen, AreasRespuesta } from '../../types/areas'
import {
  alertasActivas,
  AREAS,
  areasDeCampo,
  estadoSensor,
  sensoresDeArea,
  ultimaComunicacion,
  type AreaDb,
} from '../data/db'
import { escenarioPara } from '../escenarios'
import { campoAutorizado } from '../data/alcance'

function resumirArea(area: AreaDb): AreaResumen {
  const sensores = sensoresDeArea(area.area_id)
  const conectados = sensores.filter((sensor) => estadoSensor(sensor) === 'conectado').length
  const instantes = sensores
    .map(ultimaComunicacion)
    .filter((fecha): fecha is string => fecha !== null)
    .map((fecha) => Date.parse(fecha))

  return {
    area_id: area.area_id,
    nombre: area.nombre,
    campo_id: area.campo_id,
    sensores: sensores.length,
    conectados,
    desconectados: sensores.length - conectados,
    alertas_activas: alertasActivas(area.area_id).length,
    // null si ningún sensor del área comunicó nunca.
    ultima_actualizacion:
      instantes.length > 0 ? new Date(Math.max(...instantes)).toISOString() : null,
  }
}

export default [
  // Compatibilidad exclusiva del filtro de Alertas, fuera del alcance de A07.
  http.get('*/alertas/areas', async () => {
    const resultado = await escenarioPara('areas')
    if (resultado.tipo === 'respuesta') return resultado.respuesta
    return HttpResponse.json({ areas: resultado.tipo === 'vacio' ? [] : AREAS.map(resumirArea) })
  }),
  http.get('*/areas', async ({ request }) => {
    const campo = campoAutorizado(request)
    if (campo instanceof Response) return campo
    const resultado = await escenarioPara('areas')
    if (resultado.tipo === 'respuesta') return resultado.respuesta

    const respuesta: AreasRespuesta = {
      areas: resultado.tipo === 'vacio' ? [] : areasDeCampo(campo.campo_id).map(resumirArea),
    }
    return HttpResponse.json(respuesta)
  }),
]
