import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { guardarToken, leerToken } from '../../api/sesion'
import { RutaProtegida, RutaSoloPublica } from '../../app/RutasProtegidas'
import { server } from '../../mocks/server'
import { renderConRutas } from '../../test/utils'
import AppLayout from './AppLayout'

const rutas = (
  <Routes>
    <Route element={<RutaSoloPublica />}>
      <Route path="/login" element={<p>Pantalla de login</p>} />
    </Route>
    <Route element={<RutaProtegida />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<p>Contenido del dashboard</p>} />
        <Route path="/sensores/:deviceId" element={<p>Contenido del sensor</p>} />
      </Route>
    </Route>
  </Routes>
)

function entrar(ruta: string) {
  guardarToken('token-de-prueba')
  return renderConRutas(rutas, ruta)
}

describe('AppLayout', () => {
  it('el menú aparece en una ruta protegida', () => {
    entrar('/dashboard')

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
    expect(screen.getByText('Contenido del dashboard')).toBeInTheDocument()
  })

  it('el menú no aparece en /login', () => {
    renderConRutas(rutas, '/login')

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('la insignia de Alertas muestra el total de alertas activas', async () => {
    entrar('/dashboard')

    expect(await screen.findByText('5')).toBeInTheDocument()
  })

  it('la insignia no aparece cuando el total es 0', async () => {
    let seHizoElPedido = false
    server.use(
      http.get('*/alertas', () => {
        seHizoElPedido = true
        return HttpResponse.json({ total: 0, limit: 1, alertas: [] })
      }),
    )
    entrar('/dashboard')

    await waitFor(() => expect(seHizoElPedido).toBe(true))
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 50))
    })
    expect(screen.queryByLabelText(/activas/)).not.toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('si el pedido de alertas falla, la insignia se oculta y el menú sigue', async () => {
    let seHizoElPedido = false
    server.use(
      http.get('*/alertas', () => {
        seHizoElPedido = true
        return HttpResponse.json({ error: 'falló' }, { status: 500 })
      }),
    )
    entrar('/dashboard')

    await waitFor(() => expect(seHizoElPedido).toBe(true))
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 50))
    })
    expect(screen.queryByLabelText(/activas/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Alertas/ })).toBeInTheDocument()
  })

  it('Análisis/IA está deshabilitado, con la etiqueta Próximamente, y no es un enlace', () => {
    entrar('/dashboard')

    expect(screen.getByText('Análisis/IA').closest('[aria-disabled]')).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByText('Próximamente')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Análisis/ })).not.toBeInTheDocument()
  })

  it('Áreas queda activa también en el detalle de un sensor', () => {
    entrar('/sensores/sensor_014')

    expect(screen.getByRole('link', { name: 'Áreas' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  it('en móvil, el botón Menú abre y cierra la navegación', () => {
    entrar('/dashboard')
    // jsdom no evalúa media queries: en escritorio el botón está oculto por CSS,
    // y un elemento oculto no tiene nombre accesible, así que se busca por su texto.
    const boton = screen.getByText('Menú')
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'false')
  })

  it('Cerrar sesión borra el token y vuelve al login', () => {
    entrar('/dashboard')

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(leerToken()).toBeNull()
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
  })
})
