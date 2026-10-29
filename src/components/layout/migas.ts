import { createContext, useContext } from 'react'

export interface ItemMiga {
  etiqueta?: string
  a?: string
}

interface MigasContexto {
  items: ItemMiga[]
  setItems: (items: ItemMiga[]) => void
}

export const MigasContext = createContext<MigasContexto | null>(null)

export function useMigas(): MigasContexto {
  const contexto = useContext(MigasContext)
  if (!contexto) {
    throw new Error('useMigas debe usarse dentro de BreadcrumbProvider')
  }
  return contexto
}