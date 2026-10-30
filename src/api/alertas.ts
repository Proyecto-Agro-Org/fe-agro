import type { AlertasRespuesta, FiltroAlertas } from '../types/alertas'
import { apiFetch, conParametros } from './client'

// Los filtros sin valor no se mandan: conParametros los saltea.
export function obtenerAlertas(
  campoId: string,
  filtro: FiltroAlertas,
  signal?: AbortSignal,
): Promise<AlertasRespuesta> {
  return apiFetch<AlertasRespuesta>(conParametros('/alertas', { ...filtro, campo_id: campoId }), { signal })
}
