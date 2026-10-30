import type { AreasRespuesta } from '../types/areas'
import { apiFetch, conParametros } from './client'

export function obtenerAreas(campoId: string, signal?: AbortSignal): Promise<AreasRespuesta> {
  return apiFetch<AreasRespuesta>(conParametros('/areas', { campo_id: campoId }), { signal })
}
