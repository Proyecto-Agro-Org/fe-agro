import type { Alerta } from './alertas'
import type { AreaApi } from './areas'

export interface ResumenGeneral {
  areas: number
  sensores: number
  conectados: number
  desconectados: number
  alertas_activas: number
}

export interface AreaDashboard extends AreaApi {
  sensores: number
  conectados: number
  desconectados: number
  alertas_activas: number
}

export interface DashboardRespuesta {
  resumen: ResumenGeneral
  areas: AreaDashboard[]
  ultimas_alertas: Alerta[]
  ultima_actualizacion: string
}
