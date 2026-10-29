import type { Variable } from './comun'
export interface FiltrosHistorico {
  desde: string
  hasta: string
  variable: Variable
}
export interface HistoricoRespuesta {
  device_id: string
  nombre: string
  area_id: string
  area_nombre: string
  variable: Variable
  unidad: string
  puntos: { timestamp: string; valor: number | null }[]
  truncado: boolean
}
