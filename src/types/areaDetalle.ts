import type { Estado, Ubicacion } from './comun'
import type { AreaApi } from './areas'
import type { Sensor } from './dominio'

export type AreaDetalle = AreaApi

// La pertenencia al área está dada por la ruta /areas/:id/sensores.
export interface SensorDeArea extends Omit<Sensor, 'area_id'> {
  estado: Estado
  ultima_comunicacion: string | null
  ubicacion: Ubicacion | null
  alertas_activas: number
}
export interface SensoresDeAreaRespuesta { sensores: SensorDeArea[] }
