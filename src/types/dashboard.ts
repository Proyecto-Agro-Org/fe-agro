import type { Alerta } from './alertas'

export interface ResumenGeneral {
  areas: number
  sensores: number
  conectados: number
  desconectados: number
  alertas_activas: number
}

export interface AreaDashboard {
  area_id: string
  nombre: string
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