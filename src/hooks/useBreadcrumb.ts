import { useEffect } from 'react'
import { useMigas, type ItemMiga } from '../components/layout/migas'

// La página pasa un array nuevo en cada render. Para no re-ejecutar el efecto
// sin parar, la dependencia es una clave con el contenido y no el array.
export function useBreadcrumb(items: ItemMiga[]) {
  const { setItems } = useMigas()
  const clave = JSON.stringify(items.map((i) => [i.etiqueta ?? null, i.a ?? null]))

  useEffect(() => {
    const pares = JSON.parse(clave) as [string | null, string | null][]
    setItems(
      pares.map(([etiqueta, a]) => ({
        etiqueta: etiqueta ?? undefined,
        a: a ?? undefined,
      })),
    )
    return () => setItems([])
  }, [clave, setItems])
}