import type { Severidad } from './comun'

export type TipoAlerta = 'tecnica' | 'agronomica'

export type EstadoAlerta = 'activa' | 'resuelta'

export interface Alerta {
  alerta_id: string
  device_id: string
  sensor_nombre: string
  area_id: string
  area_nombre: string
  tipo: TipoAlerta
  severidad: Severidad
  descripcion: string
  timestamp: string
  estado: EstadoAlerta
}

export interface AlertasRespuesta {
  total: number
  limit: number
  alertas: Alerta[]
}

export interface FiltroAlertas {
  area_id?: string
  tipo?: TipoAlerta
  estado?: EstadoAlerta
  severidad?: Severidad
  limit?: number
  desde?: string
  hasta?: string
}