import type { Variable } from './comun'
import type { Sensor } from './dominio'
export interface FiltrosHistorico {
  desde: string
  hasta: string
  variable: Variable
}
export interface HistoricoRespuesta extends Sensor {
  area_nombre: string
  variable: Variable
  unidad: string
  puntos: { timestamp: string; valor: number | null }[]
  truncado: boolean
}
