import { act, fireEvent, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { avisarSesionExpirada, leerToken } from '../../api/sesion'
import { RutaProtegida, RutaSoloPublica } from '../../app/RutasProtegidas'
import { EMAIL_DEMO, PASSWORD_DEMO } from '../../mocks/handlers/login'
import { server } from '../../mocks/server'
import { renderConRutas } from '../../test/utils'
import LoginPage from './LoginPage'

const rutas = (
  <Routes>
    <Route element={<RutaSoloPublica />}>
      <Route path="/login" element={<LoginPage />} />
    </Route>
    <Route element={<RutaProtegida />}>
      <Route path="/dashboard" element={<p>Contenido del dashboard</p>} />
    </Route>
  </Routes>
)

function completar(usuario: string, password: string) {
  fireEvent.change(screen.getByLabelText('Usuario o email'), { target: { value: usuario } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } })
}

function ingresar() {
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('LoginPage', () => {
  it('AC1: con credenciales válidas guarda la sesión y redirige al dashboard', async () => {
    renderConRutas(rutas, '/login')

    completar(EMAIL_DEMO, PASSWORD_DEMO)
    ingresar()

    expect(await screen.findByText('Contenido del dashboard')).toBeInTheDocument()
    expect(leerToken()).toBe('token-demo')
  })

  it('AC2: con contraseña incorrecta muestra el mensaje genérico, vacía la contraseña y se queda en el login', async () => {
    renderConRutas(rutas, '/login')

    completar(EMAIL_DEMO, 'clave-incorrecta')
    ingresar()

    expect(await screen.findByText('Usuario o contraseña incorrectos')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toHaveValue('')
    expect(screen.getByLabelText('Usuario o email')).toHaveValue(EMAIL_DEMO)
    expect(screen.getByRole('heading', { name: 'Agro IoT' })).toBeInTheDocument()
    expect(leerToken()).toBeNull()
  })

  it('AC2: con un usuario inexistente muestra el mismo mensaje, sin decir cuál dato falló', async () => {
    renderConRutas(rutas, '/login')

    completar('otro@agro.com', PASSWORD_DEMO)
    ingresar()

    expect(await screen.findByText('Usuario o contraseña incorrectos')).toBeInTheDocument()
  })

  it('AC3: si el servidor no responde muestra el error de conexión y permite reintentar sin recargar', async () => {
    let intentos = 0
    server.use(
      http.post('*/auth/login', () => {
        intentos += 1
        if (intentos === 1) return HttpResponse.error()
        return HttpResponse.json({ token: 'token-demo' })
      }),
    )
    renderConRutas(rutas, '/login')

    completar(EMAIL_DEMO, PASSWORD_DEMO)
    ingresar()

    expect(await screen.findByText('No se pudo conectar con el servidor.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Contenido del dashboard')).toBeInTheDocument()
    expect(intentos).toBe(2)
  })

  it('AC3: un error 500 del servidor también se muestra como error de conexión', async () => {
    server.use(
      http.post('*/auth/login', () => HttpResponse.json({ error: 'falló' }, { status: 500 })),
    )
    renderConRutas(rutas, '/login')

    completar(EMAIL_DEMO, PASSWORD_DEMO)
    ingresar()

    expect(await screen.findByText('No se pudo conectar con el servidor.')).toBeInTheDocument()
    expect(screen.queryByText('Usuario o contraseña incorrectos')).not.toBeInTheDocument()
  })

  it('mientras envía, el botón queda deshabilitado con el spinner', async () => {
    renderConRutas(rutas, '/login')

    completar(EMAIL_DEMO, PASSWORD_DEMO)
    ingresar()

    expect(screen.getByRole('button', { name: 'Ingresando…' })).toBeDisabled()
    expect(await screen.findByText('Contenido del dashboard')).toBeInTheDocument()
  })

  it('un doble clic envía un solo pedido', async () => {
    let pedidos = 0
    server.use(
      http.post('*/auth/login', () => {
        pedidos += 1
        return HttpResponse.json({ token: 'token-demo' })
      }),
    )
    renderConRutas(rutas, '/login')

    completar(EMAIL_DEMO, PASSWORD_DEMO)
    const boton = screen.getByRole('button', { name: 'Ingresar' })
    fireEvent.click(boton)
    fireEvent.click(boton)
    
    expect(await screen.findByText('Contenido del dashboard')).toBeInTheDocument()
    expect(pedidos).toBe(1)
  })

  it('si la sesión expiró, avisa en el login', () => {
    renderConRutas(rutas, '/login')

    act(() => avisarSesionExpirada())

    expect(screen.getByText('Tu sesión expiró. Volvé a iniciar sesión.')).toBeInTheDocument()
  })
})