import { createContext, useContext } from 'react'
import type { Campo } from '../types/dominio'
import type { EstadoCarga } from '../hooks/useApi'

export interface CampoValor {
  campos: Campo[]
  campoSeleccionado: Campo | null
  estado: EstadoCarga
  disponible: boolean
  seleccionarCampo: (campoId: string) => void
  reintentar: () => void
}

export const CampoContext = createContext<CampoValor | null>(null)

export function useCampo(): CampoValor {
  const contexto = useContext(CampoContext)
  if (!contexto) throw new Error('useCampo debe usarse dentro de CampoProvider')
  return contexto
}
