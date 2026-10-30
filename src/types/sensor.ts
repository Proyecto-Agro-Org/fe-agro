import type { Variable } from './comun'
import type { Estado, Medida, Ubicacion } from './comun'
import type { Sensor } from './dominio'
export type MedicionSensor = { timestamp: string } & Record<Variable, Medida>
export interface SensorDetalle extends Sensor {
  area_nombre: string
  estado: Estado
  ultima_comunicacion: string | null
  ubicacion: Ubicacion | null
  ultima_medicion: MedicionSensor | null
}
