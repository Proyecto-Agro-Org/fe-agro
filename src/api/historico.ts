export const LIMITE_HISTORICO = 1000
import { apiFetch, conParametros } from './client'
import type { FiltrosHistorico, HistoricoRespuesta } from '../types/historico'
export function obtenerHistorico(id: string, campoId: string, filtros: FiltrosHistorico, signal: AbortSignal) {
  return apiFetch<HistoricoRespuesta>(
    conParametros(`/sensores/${encodeURIComponent(id)}/historico`, {
      ...filtros,
      campo_id: campoId,
      limit: LIMITE_HISTORICO,
    }),
    { signal },
  )
}
