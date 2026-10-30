import { apiFetch, conParametros } from './client'
import type { MapaRespuesta } from '../types/mapa'
export function obtenerMapa(campoId: string, signal: AbortSignal) {
  return apiFetch<MapaRespuesta>(conParametros('/mapa/sensores', { campo_id: campoId }), { signal })
}
