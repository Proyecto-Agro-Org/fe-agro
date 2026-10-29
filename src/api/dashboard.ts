import type { DashboardRespuesta } from '../types/dashboard'
import { apiFetch } from './client'

export function obtenerDashboard(signal?: AbortSignal): Promise<DashboardRespuesta> {
  return apiFetch<DashboardRespuesta>('/dashboard/resumen', { signal })
}