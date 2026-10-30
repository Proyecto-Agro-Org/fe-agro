import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

describe('LoginPage: Google simulado', () => {
  beforeEach(() => vi.stubEnv('VITE_USE_MOCKS', 'true'))
  afterEach(() => vi.unstubAllEnvs())

  function continuarConGoogle() {
    return screen.getByRole('button', { name: /Continuar con Google/ })
  }

  it('ingresa sin completar credenciales, guarda la sesión demo y redirige al dashboard', async () => {
    renderConRutas(rutas, '/login')

    expect(screen.getByText('O continuá con')).toBeInTheDocument()
    expect(screen.getByText('Acceso simulado · Demo')).toBeInTheDocument()
    expect(continuarConGoogle()).toBeEnabled()
    fireEvent.click(continuarConGoogle())

    expect(await screen.findByText('Contenido del dashboard')).toBeInTheDocument()
    expect(leerToken()).toBe('token-demo')
  })

  it.each(['false', undefined, 'TRUE'])('sin VITE_USE_MOCKS=true (%s) no permite el acceso Google', (valor) => {
    vi.stubEnv('VITE_USE_MOCKS', valor)
    renderConRutas(rutas, '/login')

    expect(continuarConGoogle()).toBeDisabled()
    expect(screen.getByText('Próximamente · No disponible')).toBeInTheDocument()
    fireEvent.click(continuarConGoogle())
    expect(leerToken()).toBeNull()
    expect(screen.queryByText('Contenido del dashboard')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled()
  })

  it('muestra carga y bloquea dobles clics y el envío tradicional durante el ingreso Google', async () => {
    let pedidosGoogle = 0
    let pedidosPassword = 0
    let liberar!: () => void
    const pendiente = new Promise<void>((resolver) => { liberar = resolver })
    server.use(
      http.post('*/auth/google-demo', async () => {
        pedidosGoogle += 1
        await pendiente
        return HttpResponse.json({ token: 'token-demo' })
      }),
      http.post('*/auth/login', () => {
        pedidosPassword += 1
        return HttpResponse.json({ token: 'token-demo' })
      }),
    )
    renderConRutas(rutas, '/login')
    completar(EMAIL_DEMO, PASSWORD_DEMO)
    const boton = continuarConGoogle()
    fireEvent.click(boton)
    fireEvent.click(boton)
    const ingresarBoton = screen.getByRole('button', { name: 'Ingresar' })
    expect(ingresarBoton).toBeDisabled()
    fireEvent.submit(ingresarBoton.closest('form')!)

    expect(screen.getByRole('status')).toHaveTextContent('Ingresando con Google…')
    expect(screen.getByRole('button', { name: /Ingresando con Google/ })).toBeDisabled()
    await waitFor(() => expect(pedidosGoogle).toBe(1))
    liberar()

    expect(await screen.findByText('Contenido del dashboard')).toBeInTheDocument()
    expect(pedidosGoogle).toBe(1)
    expect(pedidosPassword).toBe(0)
  })

  it.each(['servidor', 'conexion', '401'])('maneja error de %s y permite reintentar el ingreso Google', async (tipo) => {
    let intentos = 0
    server.use(
      http.post('*/auth/google-demo', () => {
        intentos += 1
        if (intentos > 1) return HttpResponse.json({ token: 'token-demo' })
        return tipo === 'conexion'
          ? HttpResponse.error()
          : HttpResponse.json({ error: 'Error simulado' }, { status: tipo === '401' ? 401 : 500 })
      }),
    )
    renderConRutas(rutas, '/login')
    completar(EMAIL_DEMO, PASSWORD_DEMO)
    fireEvent.click(continuarConGoogle())

    expect(await screen.findByText('No se pudo completar el acceso simulado con Google. Intentá nuevamente.')).toBeInTheDocument()
    expect(leerToken()).toBeNull()
    expect(screen.getByLabelText('Contraseña')).toHaveValue(PASSWORD_DEMO)
    expect(screen.queryByText('Usuario o contraseña incorrectos')).not.toBeInTheDocument()
    expect(screen.queryByText('Tu sesión expiró. Volvé a iniciar sesión.')).not.toBeInTheDocument()
    expect(continuarConGoogle()).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled()
    const reintentar = screen.getByRole('button', { name: 'Reintentar' })
    fireEvent.click(reintentar)
    fireEvent.click(reintentar)

    expect(await screen.findByText('Contenido del dashboard')).toBeInTheDocument()
    expect(intentos).toBe(2)
    expect(leerToken()).toBe('token-demo')
  })

  it('mantiene el ingreso tradicional y bloquea Google mientras se envían credenciales', async () => {
    renderConRutas(rutas, '/login')
    completar(EMAIL_DEMO, PASSWORD_DEMO)
    ingresar()

    expect(continuarConGoogle()).toBeDisabled()
    fireEvent.click(continuarConGoogle())
    expect(screen.getByRole('button', { name: 'Ingresando…' })).toBeDisabled()
    expect(await screen.findByText('Contenido del dashboard')).toBeInTheDocument()
    expect(leerToken()).toBe('token-demo')
  })

  it('permite el login tradicional después de un fallo de Google', async () => {
    server.use(http.post('*/auth/google-demo', () => HttpResponse.error()))
    renderConRutas(rutas, '/login')
    fireEvent.click(continuarConGoogle())
    await screen.findByText('No se pudo completar el acceso simulado con Google. Intentá nuevamente.')

    completar(EMAIL_DEMO, PASSWORD_DEMO)
    ingresar()

    expect(await screen.findByText('Contenido del dashboard')).toBeInTheDocument()
    expect(leerToken()).toBe('token-demo')
  })
})
