import { apiFetch } from './client'
import type { SensorDetalle } from '../types/sensor'
export function obtenerSensor(id: string, signal: AbortSignal) {
  return apiFetch<SensorDetalle>(`/sensores/${encodeURIComponent(id)}`, { signal })
}
