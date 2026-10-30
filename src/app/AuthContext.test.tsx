import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../api/client'
import { login } from '../api/login'
import { avisarSesionExpirada, guardarToken, leerModoSesion, leerToken } from '../api/sesion'
import AppLayout from '../components/layout/AppLayout'
import { CLIENTES, USUARIOS } from '../mocks/data/db'
import { identidadPorToken } from '../mocks/data/identidades'
import { server } from '../mocks/server'
import LoginPage from '../pages/LoginPage/LoginPage'
import { renderConRutas } from '../test/utils'
import { useAuth } from './auth'
import { AuthProvider } from './AuthContext'
import { RutaProtegida, RutaSoloPublica } from './RutasProtegidas'

function Estado() {
  const { token, usuario, cliente, cerrarSesion, iniciarSesion } = useAuth()
  return <>
    <pre data-testid="sesion">{JSON.stringify({ token, usuario, cliente })}</pre>
    <button onClick={cerrarSesion}>Salir de prueba</button>
    <button onClick={() => void iniciarSesion({
      token: 'token-demo', usuario: USUARIOS[1], cliente: CLIENTES[1],
    }).catch(() => undefined)}>Identidad alterada de prueba</button>
  </>
}

const vista = <>
  <Estado />
  <Routes>
    <Route element={<RutaSoloPublica />}>
      <Route path="/login" element={<LoginPage />} />
    </Route>
    <Route element={<RutaProtegida />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<p>Dashboard de prueba</p>} />
      </Route>
    </Route>
  </Routes>
</>

function ingresar(email: string) {
  fireEvent.change(screen.getByLabelText('Usuario o email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'demo1234' } })
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
}

function sesionActual() {
  return JSON.parse(screen.getByTestId('sesion').textContent!)
}

function esperarSinIdentidad() {
  expect(sesionActual()).toEqual({ token: null, usuario: null, cliente: null })
  expect(leerToken()).toBeNull()
  expect(leerModoSesion()).toBeNull()
}

beforeEach(() => vi.stubEnv('VITE_USE_MOCKS', 'true'))
afterEach(() => {
  vi.unstubAllEnvs()
  localStorage.clear()
})

describe('sesión con usuario y cliente', () => {
  it.each([
    ['ana.rios@horizonte-verde.example', 'token-demo', 'Ana Ríos', 'Agropecuaria Horizonte Verde'],
    ['lucia.vega@los-aromos.example', 'token-demo-lucia', 'Lucía Vega', 'Agropecuaria Los Aromos'],
    ['demo@agro.com', 'token-demo', 'Ana Ríos', 'Agropecuaria Horizonte Verde'],
  ])('login tradicional: %s conserva su identidad y cliente', async (email, token, nombre, cliente) => {
    renderConRutas(vista, '/login')
    ingresar(email)
    expect(await screen.findByText('Dashboard de prueba')).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario y cliente de la sesión')).toHaveTextContent(nombre)
    expect(screen.getByLabelText('Usuario y cliente de la sesión')).toHaveTextContent(cliente)
    expect(sesionActual()).toEqual({ token, ...identidadPorToken(token) })
    expect(leerModoSesion()).toBe('demo')
  })

  it('Google simulado usa la identidad demo de Ana', async () => {
    renderConRutas(vista, '/login')
    fireEvent.click(screen.getByRole('button', { name: /Continuar con Google/ }))
    await screen.findByText('Dashboard de prueba')
    expect(sesionActual()).toEqual({ token: 'token-demo', ...identidadPorToken('token-demo') })
  })

  it('recupera la identidad bajo StrictMode, como en la aplicación real', async () => {
    guardarToken('token-demo-lucia', 'demo')
    render(<StrictMode>
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>{vista}</MemoryRouter>
      </AuthProvider>
    </StrictMode>)
    await screen.findByText('Dashboard de prueba')
    expect(sesionActual()).toEqual({ token: 'token-demo-lucia', ...identidadPorToken('token-demo-lucia') })
  })

  it.each(['token-demo', 'token-demo-lucia'])('recupera %s al recargar, consultando el mock', async (token) => {
    guardarToken(token, 'demo')
    // No se confía en una identidad escrita en el almacenamiento del navegador.
    sessionStorage.setItem('agro_usuario', JSON.stringify(USUARIOS[1]))
    localStorage.setItem('cliente_id', 'cliente_inexistente')
    const primera = renderConRutas(vista, '/dashboard')
    expect(screen.getByRole('status')).toHaveTextContent('Recuperando sesión')
    expect(screen.queryByText('Dashboard de prueba')).not.toBeInTheDocument()
    await screen.findByText('Dashboard de prueba')
    expect(sesionActual()).toEqual({ token, ...identidadPorToken(token) })
    primera.unmount()
    renderConRutas(vista, '/dashboard')
    await screen.findByText('Dashboard de prueba')
    expect(sesionActual()).toEqual({ token, ...identidadPorToken(token) })
  })

  it('cerrar sesión limpia token e identidad y no recupera al recargar', async () => {
    guardarToken('token-demo-lucia', 'demo')
    const primera = renderConRutas(vista, '/dashboard')
    await screen.findByText('Dashboard de prueba')
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    esperarSinIdentidad()
    expect(screen.queryByLabelText('Usuario y cliente de la sesión')).not.toBeInTheDocument()
    primera.unmount()
    renderConRutas(vista, '/dashboard')
    expect(screen.getByRole('heading', { name: 'Agro IoT' })).toBeInTheDocument()
    esperarSinIdentidad()
  })

  it('un 401 de la API limpia toda la identidad y avisa que la sesión expiró', async () => {
    guardarToken('token-demo', 'demo')
    renderConRutas(vista, '/dashboard')
    await screen.findByText('Dashboard de prueba')
    server.use(http.get('*/prueba-expiracion', () => HttpResponse.json({}, { status: 401 })))
    await act(async () => {
      await expect(apiFetch('/prueba-expiracion')).rejects.toMatchObject({ estado: 401 })
    })
    esperarSinIdentidad()
    expect(screen.getByText('Tu sesión expiró. Volvé a iniciar sesión.')).toBeInTheDocument()
    expect(screen.queryByText('Ana Ríos')).not.toBeInTheDocument()
  })

  it('al cambiar de usuario no conserva nombres, cliente ni token de la sesión anterior', async () => {
    renderConRutas(vista, '/login')
    ingresar(USUARIOS[0].email)
    await screen.findByText('Dashboard de prueba')
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    esperarSinIdentidad()
    ingresar(USUARIOS[1].email)
    await screen.findByText('Dashboard de prueba')
    expect(screen.queryByText('Ana Ríos')).not.toBeInTheDocument()
    expect(screen.queryByText('Agropecuaria Horizonte Verde')).not.toBeInTheDocument()
    expect(sesionActual()).toEqual({ token: 'token-demo-lucia', ...identidadPorToken('token-demo-lucia') })
  })

  it.each(['desconocido', 'offline', 'identidad-invalida'])('invalida una sesión no recuperable: %s', async (caso) => {
    guardarToken(caso === 'desconocido' ? 'token-desconocido' : 'token-demo', 'demo')
    if (caso !== 'desconocido') {
      server.use(http.post('*/auth/demo/sesion', () => caso === 'offline'
        ? HttpResponse.error()
        : HttpResponse.json({ usuario: USUARIOS[0], cliente: CLIENTES[1] })))
    }
    renderConRutas(vista, '/dashboard')
    await screen.findByText('Tu sesión expiró. Volvé a iniciar sesión.')
    esperarSinIdentidad()
  })

  it('ignora la identidad de otra cuenta si no corresponde al token demo', async () => {
    renderConRutas(vista, '/login')
    fireEvent.click(screen.getByRole('button', { name: 'Identidad alterada de prueba' }))
    await screen.findByText('Dashboard de prueba')
    expect(sesionActual()).toEqual({ token: 'token-demo', ...identidadPorToken('token-demo') })
  })

  it.each(['salida', 'expiracion'])('una recuperación tardía no revive la sesión tras %s', async (caso) => {
    let liberar!: () => void
    const espera = new Promise<void>((resolver) => { liberar = resolver })
    let recibida = false
    server.use(http.post('*/auth/demo/sesion', async () => {
      recibida = true
      await espera
      return HttpResponse.json(identidadPorToken('token-demo'))
    }))
    guardarToken('token-demo', 'demo')
    renderConRutas(vista, '/dashboard')
    await waitFor(() => expect(recibida).toBe(true))
    act(() => {
      if (caso === 'expiracion') avisarSesionExpirada()
      else fireEvent.click(screen.getByRole('button', { name: 'Salir de prueba' }))
    })
    await act(async () => { liberar(); await espera })
    esperarSinIdentidad()
    expect(screen.queryByText('Dashboard de prueba')).not.toBeInTheDocument()
  })

  it('no envía una sesión demo al modo sin mocks', () => {
    guardarToken('token-demo', 'demo')
    vi.stubEnv('VITE_USE_MOCKS', 'false')
    renderConRutas(vista, '/dashboard')
    esperarSinIdentidad()
    expect(screen.getByRole('heading', { name: 'Agro IoT' })).toBeInTheDocument()
  })

  it('mantiene el contrato real con solo token sin inventar un cliente', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'false')
    guardarToken('token-real-de-prueba', 'real')
    renderConRutas(vista, '/dashboard')
    expect(sesionActual()).toEqual({ token: 'token-real-de-prueba', usuario: null, cliente: null })
    expect(screen.queryByLabelText('Usuario y cliente de la sesión')).not.toBeInTheDocument()
  })

  it('el mock ignora el cliente suministrado junto con las credenciales', async () => {
    const respuesta = await apiFetch('/auth/login', {
      method: 'POST', sinSesion: true,
      body: { email: USUARIOS[0].email, password: 'demo1234', cliente_id: CLIENTES[1].cliente_id },
    })
    expect(respuesta).toEqual({ token: 'token-demo', ...identidadPorToken('token-demo') })
    await expect(login({ email: USUARIOS[1].email, password: 'incorrecta' }))
      .rejects.toMatchObject({ estado: 401 })
  })
})
