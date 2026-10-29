import { http, HttpResponse } from 'msw'
import type { AreaDashboard, DashboardRespuesta } from '../../types/dashboard'
import {
  ahoraMock,
  alertaParaApi,
  ALERTAS,
  alertasActivas,
  AREAS,
  estadoSensor,
  SENSORES,
  sensoresDeArea,
  ultimaComunicacion,
  type AreaDb,
} from '../data/db'
import { escenarioPara } from '../escenarios'

const LIMITE_ULTIMAS_ALERTAS = 5

function resumirArea(area: AreaDb): AreaDashboard {
  const sensores = sensoresDeArea(area.area_id)
  const conectados = sensores.filter((sensor) => estadoSensor(sensor) === 'conectado').length
  return {
    area_id: area.area_id,
    nombre: area.nombre,
    sensores: sensores.length,
    conectados,
    desconectados: sensores.length - conectados,
    alertas_activas: alertasActivas(area.area_id).length,
  }
}

// La última actualización es la comunicación más reciente de cualquier sensor del cliente.
function ultimaActualizacion(): string {
  const instantes = SENSORES.map(ultimaComunicacion)
    .filter((fecha): fecha is string => fecha !== null)
    .map((fecha) => Date.parse(fecha))
  const ultimo = instantes.length > 0 ? Math.max(...instantes) : ahoraMock()
  return new Date(ultimo).toISOString()
}

export default [
  http.get('*/dashboard/resumen', async () => {
    const resultado = await escenarioPara('dashboard')
    if (resultado.tipo === 'respuesta') return resultado.respuesta

    if (resultado.tipo === 'vacio') {
      // Un cliente sin áreas: todo en cero y sin listas.
      const vacia: DashboardRespuesta = {
        resumen: { areas: 0, sensores: 0, conectados: 0, desconectados: 0, alertas_activas: 0 },
        areas: [],
        ultimas_alertas: [],
        ultima_actualizacion: new Date(ahoraMock()).toISOString(),
      }
      return HttpResponse.json(vacia)
    }

    const areas = AREAS.map(resumirArea)
    const conectados = areas.reduce((suma, area) => suma + area.conectados, 0)
    const sensores = areas.reduce((suma, area) => suma + area.sensores, 0)

    const respuesta: DashboardRespuesta = {
      resumen: {
        areas: areas.length,
        sensores,
        conectados,
        desconectados: sensores - conectados,
        alertas_activas: alertasActivas().length,
      },
      areas,
      // Más recientes primero, sin filtrar por estado: el contrato solo pide orden y límite.
      ultimas_alertas: ALERTAS.map(alertaParaApi)
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
        .slice(0, LIMITE_ULTIMAS_ALERTAS),
      ultima_actualizacion: ultimaActualizacion(),
    }
    return HttpResponse.json(respuesta)
  }),
]