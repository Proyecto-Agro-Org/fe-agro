import { apiFetch } from './client'
import type { MapaRespuesta } from '../types/mapa'
export function obtenerMapa(signal: AbortSignal) {
  return apiFetch<MapaRespuesta>('/mapa/sensores', { signal })
}
