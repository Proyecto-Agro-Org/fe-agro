import { useEffect } from 'react'
import { obtenerAlertas } from '../api/alertas'
import { useCampo } from '../app/campo'
import type { AlertasRespuesta } from '../types/alertas'
import { useApi } from './useApi'

const REFRESCO_MS = 60_000

// Cantidad de alertas activas para la insignia del menú.
// Si el pedido falla devuelve 0: la insignia se oculta y el menú sigue funcionando.
export function useAlertasActivas(): number {
  const { campoSeleccionado } = useCampo()
  const campoId = campoSeleccionado?.campo_id
  const { estado, datos, recargar } = useApi<AlertasRespuesta>(
    (signal) => campoId
      ? obtenerAlertas(campoId, { estado: 'activa', limit: 1 }, signal)
      : Promise.resolve({ total: 0, limit: 1, alertas: [] }),
    [campoId],
  )

  useEffect(() => {
    const intervalo = setInterval(recargar, REFRESCO_MS)
    return () => clearInterval(intervalo)
  }, [recargar])

  if (!campoId || estado !== 'exito') return 0
  return datos?.total ?? 0
}
