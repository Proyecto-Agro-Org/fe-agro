import { useEffect } from 'react'
import { apiFetch, conParametros } from '../api/client'
import type { AlertasRespuesta } from '../types/alertas'
import { useApi } from './useApi'

const REFRESCO_MS = 60_000

// Cantidad de alertas activas para la insignia del menú.
// Si el pedido falla devuelve 0: la insignia se oculta y el menú sigue funcionando.
export function useAlertasActivas(): number {
  const { estado, datos, recargar } = useApi<AlertasRespuesta>(
    (signal) =>
      apiFetch<AlertasRespuesta>(conParametros('/alertas', { estado: 'activa', limit: 1 }), {
        signal,
      }),
    [],
  )

  useEffect(() => {
    const intervalo = setInterval(recargar, REFRESCO_MS)
    return () => clearInterval(intervalo)
  }, [recargar])

  if (estado === 'error') return 0
  return datos?.total ?? 0
}