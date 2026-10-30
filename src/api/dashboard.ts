import type { DashboardRespuesta } from '../types/dashboard'
import { apiFetch, conParametros } from './client'

export function obtenerDashboard(campoId: string, signal?: AbortSignal): Promise<DashboardRespuesta> {
  return apiFetch<DashboardRespuesta>(conParametros('/dashboard/resumen', { campo_id: campoId }), { signal })
}
