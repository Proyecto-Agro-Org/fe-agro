import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { inicializarTema } from '../../app/tema'
import { SelectorTema } from './SelectorTema'

beforeEach(() => { localStorage.clear(); inicializarTema() })
afterEach(() => { localStorage.clear(); act(() => inicializarTema()) })

describe('SelectorTema', () => {
  it('tiene nombre accesible, ícono decorativo y funciona con teclado en ambos sentidos', async () => {
    const usuario = userEvent.setup()
    render(<SelectorTema />)
    const boton = screen.getByRole('button', { name: 'Cambiar a tema claro' })
    expect(boton).toHaveTextContent('Tema oscuro')
    expect(boton.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    await usuario.tab()
    expect(boton).toHaveFocus()
    await usuario.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'Cambiar a tema oscuro' })).toHaveFocus()
    expect(document.documentElement.dataset.tema).toBe('claro')
    await usuario.keyboard(' ')
    expect(document.documentElement.dataset.tema).toBe('oscuro')
    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' })).toHaveFocus()
  })

  it('sincroniza todos los controles y conserva la selección al remontar', async () => {
    const usuario = userEvent.setup()
    const vista = render(<><SelectorTema /><SelectorTema /></>)
    await usuario.click(screen.getAllByRole('button', { name: 'Cambiar a tema claro' })[0])
    expect(screen.getAllByRole('button', { name: 'Cambiar a tema oscuro' })).toHaveLength(2)
    vista.unmount()
    inicializarTema()
    render(<SelectorTema />)
    expect(screen.getByRole('button', { name: 'Cambiar a tema oscuro' })).toHaveTextContent('Tema claro')
  })
})
