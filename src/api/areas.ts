import type { AreasRespuesta } from '../types/areas'
import { apiFetch, conParametros } from './client'

export function obtenerAreas(campoId: string, signal?: AbortSignal): Promise<AreasRespuesta> {
  return apiFetch<AreasRespuesta>(conParametros('/areas', { campo_id: campoId }), { signal })
}

// Adaptador temporal del filtro de Alertas: esa pantalla aún no cambia de alcance.
export function obtenerAreasParaAlertas(signal?: AbortSignal): Promise<AreasRespuesta> {
  const ruta = import.meta.env.VITE_USE_MOCKS === 'true' ? '/alertas/areas' : '/areas'
  return apiFetch<AreasRespuesta>(ruta, { signal })
}
