import type { AreasRespuesta } from '../types/areas'
import { apiFetch } from './client'

export function obtenerAreas(signal?: AbortSignal): Promise<AreasRespuesta> {
  return apiFetch<AreasRespuesta>('/areas', { signal })
}