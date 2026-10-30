import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { guardarToken } from '../../api/sesion'
import { useCampo } from '../../app/campo'
import { RutaProtegida, RutaSoloPublica } from '../../app/RutasProtegidas'
import { camposDeCliente } from '../../mocks/data/db'
import { server } from '../../mocks/server'
import LoginPage from '../../pages/LoginPage/LoginPage'
import { renderConRutas } from '../../test/utils'
import AppLayout from './AppLayout'

const CLAVE_ANA = 'agro_campo_preferido:demo:cliente_horizonte_verde'
const CLAVE_LUCIA = 'agro_campo_preferido:demo:cliente_los_aromos'

function Contenido({ nombre }: { nombre: string }) {
  const { campoSeleccionado, seleccionarCampo } = useCampo()
  return <>
    <p>{nombre}</p>
    <span data-testid="campo-contexto">{campoSeleccionado?.campo_id ?? 'sin-campo'}</span>
    <button onClick={() => seleccionarCampo('campo_la_ribera')}>Campo ajeno de prueba</button>
    <button onClick={() => seleccionarCampo('campo_inexistente')}>Campo inexistente de prueba</button>
  </>
}

const rutas = <Routes>
  <Route element={<RutaSoloPublica />}>
    <Route path="/login" element={<LoginPage />} />
  </Route>
  <Route element={<RutaProtegida />}>
    <Route element={<AppLayout />}>
      <Route path="/dashboard" element={<Contenido nombre="Dashboard de prueba" />} />
      <Route path="/areas" element={<Contenido nombre="Áreas de prueba" />} />
    </Route>
  </Route>
</Routes>

function montar(token = 'token-demo') {
  guardarToken(token, 'demo')
  return renderConRutas(rutas, '/dashboard')
}

async function esperarCampo(nombre: string) {
  await waitFor(() => expect(screen.getByRole('combobox', { name: 'Campo' })).toHaveDisplayValue(nombre))
  return screen.getByRole('combobox', { name: 'Campo' })
}

function ingresar(email: string) {
  fireEvent.change(screen.getByLabelText('Usuario o email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'demo1234' } })
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
}

beforeEach(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'true')
  localStorage.clear()
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('selector de campos en el encabezado', () => {
  it.each([
    ['token-demo', 'El Molino', ['El Molino', 'La Esperanza']],
    ['token-demo-lucia', 'La Ribera', ['La Ribera', 'Los Olivos']],
  ] as const)('muestra solo los campos de %s y selecciona el primero', async (token, primero, nombres) => {
    montar(token)
    const selector = await esperarCampo(primero)
    expect(selector).toBeEnabled()
    expect(within(selector).getAllByRole('option').map((opcion) => opcion.textContent)).toEqual(nombres)
    expect(screen.getByRole('banner')).toContainElement(selector)
  })

  it('permite cambiar de campo y conserva la selección durante la navegación', async () => {
    montar()
    const selector = await esperarCampo('El Molino')
    fireEvent.change(selector, { target: { value: 'campo_la_esperanza' } })
    expect(selector).toHaveDisplayValue('La Esperanza')
    expect(screen.getByTestId('campo-contexto')).toHaveTextContent('campo_la_esperanza')
    fireEvent.click(screen.getByRole('link', { name: 'Áreas' }))
    expect(await screen.findByText('Áreas de prueba')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Campo' })).toHaveDisplayValue('La Esperanza')
    await waitFor(() => expect(localStorage.getItem(CLAVE_ANA)).toBe('campo_la_esperanza'))
  })

  it('recupera la preferencia del cliente tras recargar y la valida contra la lista', async () => {
    const vista = montar()
    const selector = await esperarCampo('El Molino')
    fireEvent.change(selector, { target: { value: 'campo_la_esperanza' } })
    await waitFor(() => expect(localStorage.getItem(CLAVE_ANA)).toBe('campo_la_esperanza'))
    vista.unmount()
    renderConRutas(rutas, '/dashboard')
    await esperarCampo('La Esperanza')
    expect(screen.getByTestId('campo-contexto')).toHaveTextContent('campo_la_esperanza')
  })

  it.each(['campo_inexistente', 'campo_la_ribera', 'El Molino'])('descarta la preferencia inválida %s', async (preferido) => {
    localStorage.setItem(CLAVE_ANA, preferido)
    montar()
    await esperarCampo('El Molino')
    await waitFor(() => expect(localStorage.getItem(CLAVE_ANA)).toBe('campo_el_molino'))
  })

  it('no acepta IDs ajenos ni inexistentes en el contexto', async () => {
    montar()
    await esperarCampo('El Molino')
    fireEvent.click(screen.getByRole('button', { name: 'Campo ajeno de prueba' }))
    fireEvent.click(screen.getByRole('button', { name: 'Campo inexistente de prueba' }))
    expect(screen.getByTestId('campo-contexto')).toHaveTextContent('campo_el_molino')
    await waitFor(() => expect(localStorage.getItem(CLAVE_ANA)).toBe('campo_el_molino'))
  })

  it('revalida la selección al cambiar de cuenta y conserva preferencias separadas por cliente', async () => {
    montar()
    fireEvent.change(await esperarCampo('El Molino'), { target: { value: 'campo_la_esperanza' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    ingresar('lucia.vega@los-aromos.example')
    fireEvent.change(await esperarCampo('La Ribera'), { target: { value: 'campo_los_olivos' } })
    await waitFor(() => expect(localStorage.getItem(CLAVE_LUCIA)).toBe('campo_los_olivos'))
    expect(screen.queryByRole('option', { name: 'La Esperanza' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    ingresar('ana.rios@horizonte-verde.example')
    await esperarCampo('La Esperanza')
    await waitFor(() => expect(localStorage.getItem(CLAVE_ANA)).toBe('campo_la_esperanza'))
    expect(screen.queryByRole('option', { name: 'Los Olivos' })).not.toBeInTheDocument()
  })

  it('contempla un cliente sin campos sin bloquear la pantalla', async () => {
    localStorage.setItem(CLAVE_ANA, 'campo_el_molino')
    server.use(http.get('*/auth/demo/campos', () => HttpResponse.json({ campos: [] })))
    montar()
    const selector = await esperarCampo('Sin campos disponibles')
    expect(selector).toBeDisabled()
    expect(screen.getByTestId('campo-contexto')).toHaveTextContent('sin-campo')
    expect(screen.getByText('Dashboard de prueba')).toBeInTheDocument()
    await waitFor(() => expect(localStorage.getItem(CLAVE_ANA)).toBeNull())
  })

  it('muestra carga accesible sin exponer un campo hasta recibir la respuesta', async () => {
    let liberar!: () => void
    const pendiente = new Promise<void>((resolver) => { liberar = resolver })
    server.use(http.get('*/auth/demo/campos', async () => {
      await pendiente
      return HttpResponse.json({ campos: camposDeCliente('cliente_horizonte_verde') })
    }))
    montar()
    const selector = await screen.findByRole('combobox', { name: 'Campo' })
    expect(selector).toBeDisabled()
    expect(selector).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('campo-contexto')).toHaveTextContent('sin-campo')
    expect(screen.getByRole('status')).toHaveTextContent('Cargando campos')
    liberar()
    await esperarCampo('El Molino')
  })

  it('muestra error y permite reintentar sin afectar el contenido principal', async () => {
    let intentos = 0
    server.use(http.get('*/auth/demo/campos', () => {
      intentos += 1
      return intentos === 1 ? HttpResponse.error()
        : HttpResponse.json({ campos: camposDeCliente('cliente_horizonte_verde') })
    }))
    montar()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los campos')
    expect(screen.getByRole('combobox', { name: 'Campo' })).toBeDisabled()
    expect(screen.getByTestId('campo-contexto')).toHaveTextContent('sin-campo')
    expect(screen.getByText('Dashboard de prueba')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar campos' }))
    await esperarCampo('El Molino')
    expect(intentos).toBe(2)
  })

  it('rechaza una respuesta con campos de otro cliente', async () => {
    server.use(http.get('*/auth/demo/campos', () => HttpResponse.json({ campos: camposDeCliente('cliente_los_aromos') })))
    montar()
    await screen.findByRole('alert')
    expect(screen.queryByRole('option', { name: 'La Ribera' })).not.toBeInTheDocument()
    expect(screen.getByTestId('campo-contexto')).toHaveTextContent('sin-campo')
  })

  it('ignora la respuesta tardía del usuario anterior después de cambiar de cuenta', async () => {
    let liberar!: () => void
    const pendiente = new Promise<void>((resolver) => { liberar = resolver })
    let recibido = false
    server.use(http.get('*/auth/demo/campos', async ({ request }) => {
      if (request.headers.get('Authorization') === 'Bearer token-demo') {
        recibido = true
        await pendiente
        return HttpResponse.json({ campos: camposDeCliente('cliente_horizonte_verde') })
      }
      return HttpResponse.json({ campos: camposDeCliente('cliente_los_aromos') })
    }))
    montar()
    await waitFor(() => expect(recibido).toBe(true))
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    ingresar('lucia.vega@los-aromos.example')
    await esperarCampo('La Ribera')
    await act(async () => { liberar(); await pendiente })
    expect(screen.getByRole('combobox', { name: 'Campo' })).toHaveDisplayValue('La Ribera')
    expect(screen.queryByRole('option', { name: 'El Molino' })).not.toBeInTheDocument()
  })

  it('mantiene la selección en memoria si no puede guardarse la preferencia', async () => {
    const original = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, clave, valor) {
      if (clave.startsWith('agro_campo_preferido:')) throw new Error('Almacenamiento no disponible')
      original.call(this, clave, valor)
    })
    montar()
    fireEvent.change(await esperarCampo('El Molino'), { target: { value: 'campo_la_esperanza' } })
    expect(screen.getByRole('combobox', { name: 'Campo' })).toHaveDisplayValue('La Esperanza')
    expect(screen.getByTestId('campo-contexto')).toHaveTextContent('campo_la_esperanza')
  })
})
