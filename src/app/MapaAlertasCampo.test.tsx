import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as mapaApi from '../api/mapa'
import * as alertasApi from '../api/alertas'
import * as areasApi from '../api/areas'
import { guardarToken } from '../api/sesion'
import type { SensorMapa } from '../types/mapa'
import AppLayout from '../components/layout/AppLayout'
import MapaPage from '../pages/MapaPage/MapaPage'
import AlertasPage from '../pages/AlertasPage/AlertasPage'
import LoginPage from '../pages/LoginPage/LoginPage'
import { renderConRutas } from '../test/utils'
import { server } from '../mocks/server'
import { RutaProtegida, RutaSoloPublica } from './RutasProtegidas'

// Se comprueba el conjunto exacto de marcadores que recibe Leaflet, sin simular su layout.
vi.mock('../pages/MapaPage/MapaSensores', () => ({
  default: ({ sensores }: { sensores: SensorMapa[] }) => <div aria-label="Mapa de prueba">
    {sensores.map((sensor) => <span key={sensor.device_id}>Marcador {sensor.nombre}</span>)}
  </div>,
}))

const rutas = <Routes>
  <Route element={<RutaSoloPublica />}><Route path="/login" element={<LoginPage />} /></Route>
  <Route element={<RutaProtegida />}><Route element={<AppLayout />}>
    <Route path="/dashboard" element={<p>Inicio de prueba</p>} />
    <Route path="/mapa" element={<MapaPage />} />
    <Route path="/alertas" element={<AlertasPage />} />
  </Route></Route>
</Routes>

beforeEach(() => { vi.stubEnv('VITE_USE_MOCKS', 'true'); localStorage.clear() })
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); localStorage.clear() })

function montar(pantalla = 'mapa', token = 'token-demo') {
  guardarToken(token, 'demo')
  return renderConRutas(rutas, `/${pantalla}`)
}

function cambiar(campo: string) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Campo' }), { target: { value: campo } })
}

async function esperarDatos(pantalla: string) {
  if (pantalla === 'mapa') await screen.findByText('Marcador SN-014', {}, { timeout: 5000 })
  else await screen.findByRole('link', { name: 'SN-015' }, { timeout: 5000 })
}

function tablaAlertas() {
  return within(screen.getByRole('table', { name: 'Alertas' }))
}

describe('Mapa, Alertas y contador con campo e identidad reales', () => {
  it('el mapa recibe solo marcadores propios y sus filtros contienen solo áreas del campo', async () => {
    montar()
    await esperarDatos('mapa')
    expect(screen.getAllByText(/^Marcador /)).toHaveLength(7)
    expect(screen.queryByText('Marcador SN-005')).not.toBeInTheDocument()
    const areas = screen.getByLabelText('Área')
    expect(within(areas).getAllByRole('option').map((opcion) => opcion.textContent))
      .toEqual(['Todas las áreas', 'Área Oeste', 'Área Norte'])
    fireEvent.change(areas, { target: { value: 'campo_norte' } })
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'desconectado' } })
    expect(screen.getAllByText(/^Marcador /).map((marcador) => marcador.textContent)).toEqual(['Marcador SN-015'])
  })

  it('limpia filtros del mapa y actualiza el contador al cambiar de campo', async () => {
    montar()
    await esperarDatos('mapa')
    await screen.findByLabelText('2 activas')
    fireEvent.change(screen.getByLabelText('Área'), { target: { value: 'campo_norte' } })
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'desconectado' } })
    cambiar('campo_la_esperanza')
    expect(screen.queryByText(/^Marcador /)).not.toBeInTheDocument()
    await screen.findByText('No hay sensores geolocalizados para mostrar')
    expect(screen.queryByLabelText(/activas$/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Área')).toHaveValue('')
    expect(screen.getByLabelText('Estado')).toHaveValue('')
    cambiar('campo_el_molino')
    await esperarDatos('mapa')
    expect(screen.getAllByText(/^Marcador /)).toHaveLength(7)
    await screen.findByLabelText('2 activas')
  })

  it('Alertas consulta las áreas del campo y conserva la aplicación de filtros', async () => {
    montar('alertas')
    await esperarDatos('alertas')
    await screen.findByLabelText('2 activas')
    expect(tablaAlertas().getAllByRole('link').map((link) => link.textContent)).toEqual(['SN-015', 'SN-014'])
    expect(screen.queryByRole('option', { name: 'Área Sur' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Severidad'), { target: { value: 'alta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await waitFor(() => expect(tablaAlertas().getAllByRole('link')).toHaveLength(1))
    expect(tablaAlertas().getByRole('link')).toHaveTextContent('SN-015')
    // La insignia refleja todas las activas del campo, no solo el filtro de la tabla.
    expect(screen.getByLabelText('2 activas')).toBeInTheDocument()
    cambiar('campo_la_esperanza')
    await screen.findByText('No hay alertas activas')
    expect(screen.getByLabelText('Severidad')).toHaveValue('')
    expect(screen.queryByLabelText(/activas$/)).not.toBeInTheDocument()
  })

  it.each(['mapa', 'alertas'])('cambiar de cliente reemplaza los datos de %s y su contador', async (pantalla) => {
    montar(pantalla)
    await esperarDatos(pantalla)
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    fireEvent.change(screen.getByLabelText('Usuario o email'), { target: { value: 'lucia.vega@los-aromos.example' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'demo1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    await screen.findByText('Inicio de prueba', {}, { timeout: 5000 })
    fireEvent.click(screen.getByRole('link', { name: pantalla === 'mapa' ? 'Mapa' : /Alertas/ }))
    if (pantalla === 'mapa') {
      await screen.findByText('Marcador SN-005')
      expect(screen.queryByText('Marcador SN-014')).not.toBeInTheDocument()
    } else {
      await waitFor(() => expect(tablaAlertas().getAllByRole('link').map((link) => link.textContent)).toEqual(['SN-008', 'SN-005', 'SN-007']))
      expect(tablaAlertas().queryByText('SN-015')).not.toBeInTheDocument()
    }
    await screen.findByLabelText('3 activas')
    expect(screen.getByRole('combobox', { name: 'Campo' })).toHaveDisplayValue('La Ribera')
  })

  it.each(['mapa', 'alertas'])('descarta respuestas tardías de %s, incluido el contador', async (pantalla) => {
    guardarToken('token-demo')
    let liberar!: () => void
    const pendiente = new Promise<void>((resolver) => { liberar = resolver })
    const senales: AbortSignal[] = []
    if (pantalla === 'mapa') {
      const anterior = await mapaApi.obtenerMapa('campo_el_molino', new AbortController().signal)
      vi.spyOn(mapaApi, 'obtenerMapa').mockImplementation(async (campo, signal) => {
        if (campo !== 'campo_el_molino') return { sensores: [] }
        senales.push(signal)
        await pendiente
        return anterior
      })
    } else {
      const anterior = await alertasApi.obtenerAlertas('campo_el_molino', { estado: 'activa' })
      vi.spyOn(alertasApi, 'obtenerAlertas').mockImplementation(async (campo, _filtros, signal) => {
        if (campo !== 'campo_el_molino') return { total: 0, limit: 50, alertas: [] }
        if (signal) senales.push(signal)
        await pendiente
        return anterior
      })
    }
    montar(pantalla)
    await waitFor(() => expect(senales.length).toBeGreaterThan(0), { timeout: 5000 })
    cambiar('campo_la_esperanza')
    await screen.findByText(pantalla === 'mapa' ? 'No hay sensores geolocalizados para mostrar' : 'No hay alertas activas')
    expect(senales.every((signal) => signal.aborted)).toBe(true)
    await act(async () => { liberar(); await pendiente })
    expect(screen.queryByText(/^Marcador /)).not.toBeInTheDocument()
    expect(screen.queryByRole('table', { name: 'Alertas' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('2 activas')).not.toBeInTheDocument()
  })

  it('el catálogo de áreas tardío no repone opciones del campo anterior', async () => {
    guardarToken('token-demo')
    const anterior = await areasApi.obtenerAreas('campo_el_molino')
    let liberar!: () => void
    const pendiente = new Promise<void>((resolver) => { liberar = resolver })
    let senal: AbortSignal | undefined
    vi.spyOn(areasApi, 'obtenerAreas').mockImplementation(async (campo, signal) => {
      if (campo !== 'campo_el_molino') return { areas: [] }
      senal = signal
      await pendiente
      return anterior
    })
    montar('alertas')
    await waitFor(() => expect(senal).toBeDefined())
    cambiar('campo_la_esperanza')
    await screen.findByText('No hay alertas activas')
    expect(senal!.aborted).toBe(true)
    await act(async () => { liberar(); await pendiente })
    expect(screen.queryByRole('option', { name: 'Área Norte' })).not.toBeInTheDocument()
  })

  it.each(['mapa', 'alertas'])('un error en el nuevo campo no conserva datos previos de %s y permite reintentar', async (pantalla) => {
    montar(pantalla)
    await esperarDatos(pantalla)
    let intentos = 0
    server.use(http.get(pantalla === 'mapa' ? '*/mapa/sensores' : '*/alertas', ({ request }) => {
      if (new URL(request.url).searchParams.get('limit') === '1') {
        return HttpResponse.json({ total: 0, limit: 1, alertas: [] })
      }
      intentos += 1
      if (intentos === 1) return HttpResponse.error()
      return HttpResponse.json(pantalla === 'mapa' ? { sensores: [] } : { total: 0, limit: 50, alertas: [] })
    }))
    cambiar('campo_la_esperanza')
    expect(await within(screen.getByRole('main')).findByRole('alert')).toHaveTextContent(
      pantalla === 'mapa' ? 'No se pudieron cargar los sensores del mapa' : 'No se pudieron cargar las alertas.',
    )
    expect(screen.queryByText(/^Marcador /)).not.toBeInTheDocument()
    expect(screen.queryByRole('table', { name: 'Alertas' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    await screen.findByText(pantalla === 'mapa' ? 'No hay sensores geolocalizados para mostrar' : 'No hay alertas activas')
    expect(intentos).toBe(2)
  })

  it.each(['mapa', 'alertas'])('no consulta datos globales ni contadores sin campo: %s', async (pantalla) => {
    let pedidos = 0
    server.use(
      http.get('*/auth/demo/campos', () => HttpResponse.json({ campos: [] })),
      http.get('*/mapa/sensores', () => { pedidos += 1; return HttpResponse.json({ sensores: [] }) }),
      http.get('*/alertas', () => { pedidos += 1; return HttpResponse.json({ total: 0, limit: 1, alertas: [] }) }),
    )
    montar(pantalla)
    await screen.findByText('No tenés campos disponibles')
    expect(pedidos).toBe(0)
    expect(screen.queryByLabelText(/activas$/)).not.toBeInTheDocument()
  })
})
