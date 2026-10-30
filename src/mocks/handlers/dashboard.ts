import { http, HttpResponse } from 'msw'
import type { AreaDashboard, DashboardRespuesta } from '../../types/dashboard'
import {
  alertaParaApi,
  ALERTAS,
  alertasActivas,
  areasDeCampo,
  estadoSensor,
  SENSORES,
  sensoresDeArea,
  ultimaComunicacion,
  type AreaDb,
} from '../data/db'
import { campoAutorizado } from '../data/alcance'
import { escenarioPara } from '../escenarios'

const LIMITE_ULTIMAS_ALERTAS = 5

function resumirArea(area: AreaDb): AreaDashboard {
  const sensores = sensoresDeArea(area.area_id)
  const conectados = sensores.filter((sensor) => estadoSensor(sensor) === 'conectado').length
  return {
    area_id: area.area_id,
    nombre: area.nombre,
    campo_id: area.campo_id,
    sensores: sensores.length,
    conectados,
    desconectados: sensores.length - conectados,
    alertas_activas: alertasActivas(area.area_id).length,
  }
}

// La última actualización solo considera sensores del campo solicitado.
function ultimaActualizacion(sensores: typeof SENSORES): string | null {
  const instantes = sensores.map(ultimaComunicacion)
    .filter((fecha): fecha is string => fecha !== null)
    .map((fecha) => Date.parse(fecha))
  return instantes.length > 0 ? new Date(Math.max(...instantes)).toISOString() : null
}

export default [
  http.get('*/dashboard/resumen', async ({ request }) => {
    const campo = campoAutorizado(request)
    if (campo instanceof Response) return campo
    const resultado = await escenarioPara('dashboard')
    if (resultado.tipo === 'respuesta') return resultado.respuesta

    if (resultado.tipo === 'vacio') {
      // Escenario vacío: todo en cero, sin listas ni una fecha inventada.
      const vacia: DashboardRespuesta = {
        resumen: { areas: 0, sensores: 0, conectados: 0, desconectados: 0, alertas_activas: 0 },
        areas: [],
        ultimas_alertas: [],
        ultima_actualizacion: null,
      }
      return HttpResponse.json(vacia)
    }

    const areas = areasDeCampo(campo.campo_id).map(resumirArea)
    const idsAreas = new Set(areas.map((area) => area.area_id))
    const sensoresDelCampo = SENSORES.filter((sensor) => idsAreas.has(sensor.area_id))
    const idsSensores = new Set(sensoresDelCampo.map((sensor) => sensor.device_id))
    const alertasDelCampo = ALERTAS.filter((alerta) => idsSensores.has(alerta.device_id))
    const conectados = areas.reduce((suma, area) => suma + area.conectados, 0)
    const sensores = areas.reduce((suma, area) => suma + area.sensores, 0)

    const respuesta: DashboardRespuesta = {
      resumen: {
        areas: areas.length,
        sensores,
        conectados,
        desconectados: sensores - conectados,
        alertas_activas: alertasDelCampo.filter((alerta) => alerta.estado === 'activa').length,
      },
      areas,
      // Más recientes primero, sin filtrar por estado: el contrato solo pide orden y límite.
      ultimas_alertas: alertasDelCampo.map(alertaParaApi)
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
        .slice(0, LIMITE_ULTIMAS_ALERTAS),
      ultima_actualizacion: ultimaActualizacion(sensoresDelCampo),
    }
    return HttpResponse.json(respuesta)
  }),
]
