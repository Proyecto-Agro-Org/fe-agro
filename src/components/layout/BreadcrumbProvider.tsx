import { useMemo, useState, type ReactNode } from 'react'
import { MigasContext, type ItemMiga } from './migas'

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemMiga[]>([])
  const valor = useMemo(() => ({ items, setItems }), [items])
  return <MigasContext.Provider value={valor}>{children}</MigasContext.Provider>
}