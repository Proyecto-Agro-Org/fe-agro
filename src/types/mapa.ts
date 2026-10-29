import type { Estado, Medida, Ubicacion } from './comun'
export interface SensorMapa {
  device_id: string
  nombre: string
  area_id: string
  area_nombre: string
  estado: Estado
  ubicacion: Ubicacion | null
  ultima_comunicacion: string | null
  ultima_medicion: { timestamp: string; humedad: Medida; temperatura: Medida } | null
}
export interface MapaRespuesta {
  sensores: SensorMapa[]
}
export function tieneUbicacion(sensor: SensorMapa): boolean {
  const u = sensor.ubicacion
  return (
    u !== null &&
    Number.isFinite(u.lat) &&
    Number.isFinite(u.lon) &&
    Math.abs(u.lat) <= 90 &&
    Math.abs(u.lon) <= 180
  )
}
