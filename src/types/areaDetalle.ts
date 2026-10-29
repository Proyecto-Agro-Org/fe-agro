import type { Estado, Ubicacion } from './comun'
export interface AreaDetalle { area_id: string; nombre: string }
export interface SensorDeArea {
  device_id: string
  nombre: string
  estado: Estado
  ultima_comunicacion: string | null
  ubicacion: Ubicacion | null
  alertas_activas: number
}
export interface SensoresDeAreaRespuesta { sensores: SensorDeArea[] }
