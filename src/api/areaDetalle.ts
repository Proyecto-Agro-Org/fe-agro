import { apiFetch, conParametros } from './client'
import type { AreaDetalle, SensoresDeAreaRespuesta } from '../types/areaDetalle'
export const obtenerArea = (id: string, campoId: string, signal: AbortSignal) =>
  apiFetch<AreaDetalle>(conParametros(`/areas/${encodeURIComponent(id)}`, { campo_id: campoId }), { signal })
export const obtenerSensoresDeArea = (id: string, campoId: string, signal: AbortSignal) =>
  apiFetch<SensoresDeAreaRespuesta>(conParametros(`/areas/${encodeURIComponent(id)}/sensores`, { campo_id: campoId }), { signal })
