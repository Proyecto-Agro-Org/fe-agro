import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumb } from './Breadcrumb'
import { BreadcrumbProvider } from './BreadcrumbProvider'
import type { ItemMiga } from './migas'
import { useBreadcrumb } from '../../hooks/useBreadcrumb'

function Pagina({ items }: { items: ItemMiga[] }) {
  useBreadcrumb(items)
  return null
}

function arbol(items: ItemMiga[] | null) {
  return (
    <MemoryRouter>
      <BreadcrumbProvider>
        <Breadcrumb />
        {items && <Pagina items={items} />}
      </BreadcrumbProvider>
    </MemoryRouter>
  )
}

afterEach(cleanup)

describe('useBreadcrumb y Breadcrumb', () => {
  it('con tres niveles, los dos primeros son enlaces y el último no', () => {
    render(
      arbol([
        { etiqueta: 'Inicio', a: '/dashboard' },
        { etiqueta: 'Área Norte', a: '/areas/campo_norte' },
        { etiqueta: 'Sensor SN-014' },
      ]),
    )
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByText('Sensor SN-014').getAttribute('aria-current')).toBe('page')
  })

  it('sin etiqueta muestra un indicador de carga y luego el nombre', () => {
    const { rerender } = render(
      arbol([{ etiqueta: 'Inicio', a: '/dashboard' }, { a: '/areas/campo_norte' }, {}]),
    )
    expect(screen.getAllByRole('status')).toHaveLength(2)

    rerender(
      arbol([
        { etiqueta: 'Inicio', a: '/dashboard' },
        { etiqueta: 'Área Norte', a: '/areas/campo_norte' },
        { etiqueta: 'Sensor SN-014' },
      ]),
    )
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText('Área Norte')).toBeTruthy()
  })

  it('al desmontarse la página, las migas desaparecen', () => {
    const { rerender } = render(arbol([{ etiqueta: 'Inicio' }]))
    expect(screen.getByRole('navigation', { name: 'Migas de pan' })).toBeTruthy()

    rerender(arbol(null))
    expect(screen.queryByRole('navigation')).toBeNull()
  })
})