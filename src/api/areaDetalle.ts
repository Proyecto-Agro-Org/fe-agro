import { apiFetch } from './client'
import type { AreaDetalle, SensoresDeAreaRespuesta } from '../types/areaDetalle'
export const obtenerArea = (id: string, signal: AbortSignal) =>
  apiFetch<AreaDetalle>(`/areas/${encodeURIComponent(id)}`, { signal })
export const obtenerSensoresDeArea = (id: string, signal: AbortSignal) =>
  apiFetch<SensoresDeAreaRespuesta>(`/areas/${encodeURIComponent(id)}/sensores`, { signal })
