export const LIMITE_HISTORICO = 1000
import { apiFetch, conParametros } from './client'
import type { FiltrosHistorico, HistoricoRespuesta } from '../types/historico'
export function obtenerHistorico(id: string, filtros: FiltrosHistorico, signal: AbortSignal) {
  return apiFetch<HistoricoRespuesta>(
    conParametros(`/sensores/${encodeURIComponent(id)}/historico`, {
      ...filtros,
      limit: LIMITE_HISTORICO,
    }),
    { signal },
  )
}
