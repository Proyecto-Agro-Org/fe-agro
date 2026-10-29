import type { Variable } from './comun'
import type { Estado, Medida, Ubicacion } from './comun'
export type MedicionSensor = { timestamp: string } & Record<Variable, Medida>
export interface SensorDetalle {
  device_id: string
  nombre: string
  area_id: string
  area_nombre: string
  estado: Estado
  ultima_comunicacion: string | null
  ubicacion: Ubicacion | null
  ultima_medicion: MedicionSensor | null
}
