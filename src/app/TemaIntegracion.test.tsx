import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { guardarToken, leerToken } from '../api/sesion'
import AppLayout from '../components/layout/AppLayout'
import LoginPage from '../pages/LoginPage/LoginPage'
import { renderConRutas } from '../test/utils'
import { useCampo } from './campo'
import { inicializarTema } from './tema'
import { RutaProtegida, RutaSoloPublica } from './RutasProtegidas'

function Vista({ nombre }: { nombre: string }) {
  const { campoSeleccionado } = useCampo()
  return <><p>{nombre}</p><span data-testid="campo-vigente">{campoSeleccionado?.campo_id}</span></>
}

const rutas = <Routes>
  <Route element={<RutaSoloPublica />}><Route path="/login" element={<LoginPage />} /></Route>
  <Route element={<RutaProtegida />}><Route element={<AppLayout />}>
    <Route path="/dashboard" element={<Vista nombre="Inicio de prueba" />} />
    <Route path="/areas" element={<Vista nombre="Áreas de prueba" />} />
  </Route></Route>
</Routes>

beforeEach(() => { vi.stubEnv('VITE_USE_MOCKS', 'true'); localStorage.clear(); inicializarTema() })
afterEach(() => { vi.unstubAllEnvs(); localStorage.clear(); act(() => inicializarTema()) })

describe('tema independiente de sesión y campo', () => {
  it('conserva el tema al navegar, recargar, cerrar sesión y volver a ingresar', async () => {
    guardarToken('token-demo', 'demo')
    const vista = renderConRutas(rutas, '/dashboard')
    await waitFor(() => expect(screen.getByLabelText('Campo')).toHaveDisplayValue('El Molino'), { timeout: 5000 })
    fireEvent.change(screen.getByLabelText('Campo'), { target: { value: 'campo_la_esperanza' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a tema claro' }))
    expect(document.documentElement.dataset.tema).toBe('claro')
    expect(leerToken()).toBe('token-demo')
    expect(screen.getByTestId('campo-vigente')).toHaveTextContent('campo_la_esperanza')
    fireEvent.click(screen.getByRole('link', { name: 'Áreas' }))
    await screen.findByText('Áreas de prueba')
    expect(screen.getByLabelText('Campo')).toHaveDisplayValue('La Esperanza')
    expect(document.documentElement.dataset.tema).toBe('claro')
    vista.unmount()
    inicializarTema()
    renderConRutas(rutas, '/areas')
    await waitFor(() => expect(screen.getByLabelText('Campo')).toHaveDisplayValue('La Esperanza'), { timeout: 5000 })
    expect(screen.getByRole('button', { name: 'Cambiar a tema oscuro' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(screen.getByRole('heading', { name: 'Agro IoT' })).toBeInTheDocument()
    expect(document.documentElement.dataset.tema).toBe('claro')
    expect(leerToken()).toBeNull()
    fireEvent.change(screen.getByLabelText('Usuario o email'), { target: { value: 'lucia.vega@los-aromos.example' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'demo1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    await screen.findByText('Lucía Vega', {}, { timeout: 5000 })
    await waitFor(() => expect(screen.getByLabelText('Campo')).toHaveDisplayValue('La Ribera'), { timeout: 5000 })
    expect(document.documentElement.dataset.tema).toBe('claro')
    expect(leerToken()).toBe('token-demo-lucia')
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }))
    expect(document.documentElement.dataset.tema).toBe('oscuro')
    expect(screen.getByLabelText('Campo')).toHaveDisplayValue('La Ribera')
  })

  it('aplica la preferencia guardada al Login sin necesitar una sesión', () => {
    localStorage.setItem('agro_tema', 'claro')
    inicializarTema()
    renderConRutas(rutas, '/login')
    expect(document.documentElement.dataset.tema).toBe('claro')
    expect(screen.getByLabelText('Usuario o email')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cambiar a tema oscuro' })).not.toBeInTheDocument()
    expect(leerToken()).toBeNull()
  })
})
