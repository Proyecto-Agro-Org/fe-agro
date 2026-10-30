import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { guardarToken } from '../api/sesion'
import { renderConRutas } from '../test/utils'
import { RutaProtegida, RutaSoloPublica } from './RutasProtegidas'

const rutas = (
  <Routes>
    <Route element={<RutaSoloPublica />}>
      <Route path="/login" element={<p>Pantalla de login</p>} />
    </Route>
    <Route element={<RutaProtegida />}>
      <Route path="/dashboard" element={<p>Contenido privado</p>} />
    </Route>
  </Routes>
)

describe('protección de rutas', () => {
  it('sin sesión, una ruta protegida redirige a /login', () => {
    renderConRutas(rutas, '/dashboard')

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })

  it('con sesión, entra a la ruta protegida', async () => {
    guardarToken('token-demo')

    renderConRutas(rutas, '/dashboard')

    expect(await screen.findByText('Contenido privado')).toBeInTheDocument()
  })

  it('con sesión, /login redirige al dashboard', async () => {
    guardarToken('token-demo')

    renderConRutas(rutas, '/login')

    expect(await screen.findByText('Contenido privado')).toBeInTheDocument()
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument()
  })
})
