import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as dashboardApi from '../api/dashboard'
import * as areasApi from '../api/areas'
import { guardarToken } from '../api/sesion'
import AppLayout from '../components/layout/AppLayout'
import { server } from '../mocks/server'
import DashboardPage from '../pages/DashboardPage/DashboardPage'
import AreasPage from '../pages/AreasPage/AreasPage'
import AreaDetallePage from '../pages/AreaDetallePage/AreaDetallePage'
import LoginPage from '../pages/LoginPage/LoginPage'
import { renderConRutas } from '../test/utils'
import { RutaProtegida, RutaSoloPublica } from './RutasProtegidas'

const rutas = <Routes>
  <Route element={<RutaSoloPublica />}><Route path="/login" element={<LoginPage />} /></Route>
  <Route element={<RutaProtegida />}>
    <Route element={<AppLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/areas" element={<AreasPage />} />
      <Route path="/areas/:areaId" element={<AreaDetallePage />} />
    </Route>
  </Route>
</Routes>

beforeEach(() => { vi.stubEnv('VITE_USE_MOCKS', 'true'); localStorage.clear() })
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); localStorage.clear() })

function montar(ruta = '/dashboard', token = 'token-demo') {
  guardarToken(token, 'demo')
  return renderConRutas(rutas, ruta)
}

async function metricas() {
  // La integración encadena recuperación de sesión, catálogo de campos y resumen.
  return within(await screen.findByRole('list', { name: 'Resumen general' }, { timeout: 5000 }))
}

function cambiarCampo(campo: string) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Campo' }), { target: { value: campo } })
}

describe('Dashboard y Áreas con el selector real', () => {
  it('actualiza el Dashboard al cambiar de campo y no inventa datos en el vacío', async () => {
    montar()
    expect((await metricas()).getByText('Sensores conectados').closest('li')).toHaveTextContent('7 / 8')
    expect(screen.queryByRole('link', { name: 'Área Sur' })).not.toBeInTheDocument()
    cambiarCampo('campo_la_esperanza')
    expect(screen.queryByRole('list', { name: 'Resumen general' })).not.toBeInTheDocument()
    expect(await screen.findByText('Todavía no tenés áreas asignadas')).toBeInTheDocument()
    expect(screen.queryByText(/Última actualización:/)).not.toBeInTheDocument()
    expect(screen.queryByRole('table', { name: 'Resumen por área' })).not.toBeInTheDocument()
    cambiarCampo('campo_el_molino')
    expect((await metricas()).getByText('Alertas activas').closest('li')).toHaveTextContent('2')
  })

  it('actualiza Áreas y mantiene la selección al navegar entre ambas pantallas', async () => {
    montar('/areas')
    await screen.findByRole('link', { name: /Área Norte.*5 sensores/ })
    expect(screen.queryByRole('link', { name: /Área Sur.*sensores/ })).not.toBeInTheDocument()
    cambiarCampo('campo_la_esperanza')
    await screen.findByText('Todavía no tenés áreas asignadas')
    expect(screen.queryByRole('link', { name: /Área Norte.*sensores/ })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }))
    await screen.findByText('Todavía no tenés áreas asignadas')
    expect(screen.getByRole('combobox', { name: 'Campo' })).toHaveDisplayValue('La Esperanza')
  })

  it('el cambio de cliente reemplaza métricas, áreas y alertas', async () => {
    montar()
    await metricas()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    fireEvent.change(screen.getByLabelText('Usuario o email'), { target: { value: 'lucia.vega@los-aromos.example' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'demo1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect((await metricas()).getByText('Sensores conectados').closest('li')).toHaveTextContent('4 / 7')
    expect(screen.queryByRole('link', { name: 'Área Norte' })).not.toBeInTheDocument()
    expect(screen.queryByText('SN-015')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Área Sur' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Campo' })).toHaveDisplayValue('La Ribera')
  })

  it('el detalle se invalida al seleccionar un campo al que el área no pertenece', async () => {
    montar('/areas/campo_norte')
    await screen.findByRole('link', { name: /SN-015/ })
    cambiarCampo('campo_la_esperanza')
    expect(screen.queryByRole('link', { name: /SN-015/ })).not.toBeInTheDocument()
    await screen.findByRole('heading', { name: 'No encontramos lo que buscás' })
    expect(screen.queryByRole('heading', { name: 'Área Norte · Sensores' })).not.toBeInTheDocument()
  })

  it('no muestra datos de un área de otro cliente al entrar directamente por URL', async () => {
    montar('/areas/campo_norte', 'token-demo-lucia')
    await screen.findByRole('heading', { name: 'No encontramos lo que buscás' })
    expect(screen.queryByRole('link', { name: /SN-015/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Área Norte · Sensores' })).not.toBeInTheDocument()
  })

  it.each(['dashboard', 'areas'] as const)('descarta respuestas tardías de %s del campo anterior', async (pantalla) => {
    guardarToken('token-demo')
    let liberar!: () => void
    const pendiente = new Promise<void>((resolver) => { liberar = resolver })
    let senal: AbortSignal | undefined
    // Se simula una promesa que llega aun después de cancelarse el AbortSignal.
    if (pantalla === 'dashboard') {
      const anterior = await dashboardApi.obtenerDashboard('campo_el_molino')
      vi.spyOn(dashboardApi, 'obtenerDashboard').mockImplementation(async (campo, signal) => {
        if (campo === 'campo_el_molino') {
          senal = signal
          await pendiente
          return anterior
        }
        return {
          resumen: { areas: 0, sensores: 0, conectados: 0, desconectados: 0, alertas_activas: 0 },
          areas: [], ultimas_alertas: [], ultima_actualizacion: null,
        }
      })
    } else {
      const anterior = await areasApi.obtenerAreas('campo_el_molino')
      vi.spyOn(areasApi, 'obtenerAreas').mockImplementation(async (campo, signal) => {
        if (campo === 'campo_el_molino') {
          senal = signal
          await pendiente
          return anterior
        }
        return { areas: [] }
      })
    }
    montar(`/${pantalla}`)
    await waitFor(() => expect(senal).toBeDefined())
    expect(screen.getByRole('status', { name: pantalla === 'dashboard' ? 'Cargando el resumen' : 'Cargando áreas' })).toBeInTheDocument()
    cambiarCampo('campo_la_esperanza')
    await screen.findByText('Todavía no tenés áreas asignadas')
    expect(senal!.aborted).toBe(true)
    await act(async () => { liberar(); await pendiente })
    expect(screen.queryByRole('link', { name: /Área Norte/ })).not.toBeInTheDocument()
    expect(screen.getByText('Todavía no tenés áreas asignadas')).toBeInTheDocument()
  })

  it.each(['dashboard', 'areas'] as const)('un error al cambiar %s no conserva datos del campo anterior y permite reintentar', async (pantalla) => {
    montar(`/${pantalla}`)
    if (pantalla === 'dashboard') await metricas()
    else await screen.findByRole('link', { name: /Área Norte.*sensores/ })
    server.use(http.get(pantalla === 'dashboard' ? '*/dashboard/resumen' : '*/areas', () => HttpResponse.error(), { once: true }))
    cambiarCampo('campo_la_esperanza')
    const principal = screen.getByRole('main')
    expect(await within(principal).findByRole('alert')).toHaveTextContent(pantalla === 'dashboard' ? 'No se pudo cargar el resumen.' : 'No se pudo cargar el listado de áreas.')
    expect(within(principal).queryByRole('link', { name: /Área Norte/ })).not.toBeInTheDocument()
    fireEvent.click(within(principal).getByRole('button', { name: 'Reintentar' }))
    await screen.findByText('Todavía no tenés áreas asignadas')
  })

  it('no realiza consultas globales si el cliente no tiene campos', async () => {
    let pedidos = 0
    server.use(
      http.get('*/auth/demo/campos', () => HttpResponse.json({ campos: [] })),
      http.get('*/dashboard/resumen', () => { pedidos += 1; return HttpResponse.json({}) }),
      http.get('*/areas', () => { pedidos += 1; return HttpResponse.json({}) }),
    )
    montar()
    await screen.findByText('No tenés campos disponibles')
    fireEvent.click(screen.getByRole('link', { name: 'Áreas' }))
    await screen.findByText('No tenés campos disponibles')
    expect(pedidos).toBe(0)
  })
})
