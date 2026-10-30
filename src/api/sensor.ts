import { apiFetch, conParametros } from './client'
import type { SensorDetalle } from '../types/sensor'
export function obtenerSensor(id: string, campoId: string, signal: AbortSignal) {
  return apiFetch<SensorDetalle>(conParametros(`/sensores/${encodeURIComponent(id)}`, { campo_id: campoId }), { signal })
}
