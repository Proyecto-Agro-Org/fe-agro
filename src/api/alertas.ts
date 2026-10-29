import type { AlertasRespuesta, FiltroAlertas } from '../types/alertas'
import { apiFetch, conParametros } from './client'

// Los filtros sin valor no se mandan: conParametros los saltea.
export function obtenerAlertas(
  filtro: FiltroAlertas,
  signal?: AbortSignal,
): Promise<AlertasRespuesta> {
  return apiFetch<AlertasRespuesta>(conParametros('/alertas', { ...filtro }), { signal })
}