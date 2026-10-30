import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { guardarToken } from '../api/sesion'
import * as sensorApi from '../api/sensor'
import * as historicoApi from '../api/historico'
import { ErrorApi } from '../types/comun'
import AppLayout from '../components/layout/AppLayout'
import { server } from '../mocks/server'
import { ahoraMock } from '../mocks/data/db'
import SensorDetallePage from '../pages/SensorDetallePage/SensorDetallePage'
import HistoricoPage from '../pages/HistoricoPage/HistoricoPage'
// Se prueba el gráfico real, precargado para separar importación en frío de render.
import '../pages/HistoricoPage/GraficoHistorico'
import LoginPage from '../pages/LoginPage/LoginPage'
import { AuthProvider } from './AuthContext'
import { RutaProtegida, RutaSoloPublica } from './RutasProtegidas'

const rutas = <Routes>
  <Route element={<RutaSoloPublica />}><Route path="/login" element={<LoginPage />} /></Route>
  <Route element={<RutaProtegida />}><Route element={<AppLayout />}>
    <Route path="/sensores/:deviceId" element={<SensorDetallePage />} />
    <Route path="/sensores/:deviceId/historico" element={<HistoricoPage />} />
  </Route></Route>
</Routes>

beforeEach(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'true')
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  localStorage.clear()
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear() })

function montar(ruta: string, token = 'token-demo', state?: unknown) {
  guardarToken(token, 'demo')
  return render(<AuthProvider><MemoryRouter initialEntries={[{ pathname: ruta, state }]}>{rutas}</MemoryRouter></AuthProvider>)
}

function cambiar(campo: string) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Campo' }), { target: { value: campo } })
}

describe('sensor e histórico con el campo de la sesión', () => {
  it('permite ir del sensor propio a su histórico con las mediciones y filtros existentes', async () => {
    montar('/sensores/sensor_014')
    await screen.findByRole('heading', { name: 'Sensor SN-014' }, { timeout: 5000 })
    expect(screen.getByText('12 %')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Ver históricos' }))
    await screen.findByRole('heading', { name: 'Históricos · SN-014' }, { timeout: 5000 })
    expect(screen.getByLabelText('Variable')).toHaveValue('humedad')
    expect(screen.getByLabelText('Desde')).toHaveAttribute('type', 'date')
    expect(screen.getByRole('button', { name: 'Aplicar filtros' })).toBeInTheDocument()
    expect(await screen.findByRole('img', { name: /Gráfico de Humedad/ }, { timeout: 10000 })).toBeInTheDocument()
  })

  it.each(['', '/historico'])('bloquea por URL directa un sensor de otro cliente: %s', async (sufijo) => {
    montar(`/sensores/sensor_014${sufijo}`, 'token-demo-lucia')
    await screen.findByRole('heading', { name: 'No encontramos lo que buscás' }, { timeout: 5000 })
    expect(screen.queryByText('12 %')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
  })

  it.each(['', '/historico'])('elimina los datos al cambiar a otro campo del mismo cliente: %s', async (sufijo) => {
    montar(`/sensores/sensor_014${sufijo}`)
    await screen.findByRole('heading', { name: sufijo ? 'Históricos · SN-014' : 'Sensor SN-014' }, { timeout: 5000 })
    cambiar('campo_la_esperanza')
    expect(screen.queryByRole('heading', { name: /SN-014/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    await screen.findByRole('heading', { name: 'No encontramos lo que buscás' })
    expect(screen.queryByText('12 %')).not.toBeInTheDocument()
  })

  it.each(['sensor', 'historico'] as const)('un cambio rápido descarta las respuestas tardías de %s', async (pantalla) => {
    guardarToken('token-demo')
    let liberar!: () => void
    const pendiente = new Promise<void>((resolver) => { liberar = resolver })
    const senales: AbortSignal[] = []
    const filtros = { variable: 'humedad' as const, desde: new Date(ahoraMock() - 3600000).toISOString(), hasta: new Date(ahoraMock()).toISOString() }
    if (pantalla === 'sensor') {
      const respuesta = await sensorApi.obtenerSensor('sensor_014', 'campo_el_molino', new AbortController().signal)
      vi.spyOn(sensorApi, 'obtenerSensor').mockImplementation(async (_id, campo, signal) => {
        if (campo !== 'campo_el_molino') throw new ErrorApi('No encontramos este sensor', 404)
        senales.push(signal)
        await pendiente
        return respuesta
      })
    } else {
      const respuesta = await historicoApi.obtenerHistorico('sensor_014', 'campo_el_molino', filtros, new AbortController().signal)
      vi.spyOn(historicoApi, 'obtenerHistorico').mockImplementation(async (_id, campo, _filtros, signal) => {
        if (campo !== 'campo_el_molino') throw new ErrorApi('No encontramos este sensor', 404)
        senales.push(signal)
        await pendiente
        return respuesta
      })
    }
    montar(`/sensores/sensor_014${pantalla === 'historico' ? '/historico' : ''}`)
    await waitFor(() => expect(senales).toHaveLength(1), { timeout: 5000 })
    cambiar('campo_la_esperanza')
    cambiar('campo_el_molino')
    await waitFor(() => expect(senales).toHaveLength(2))
    cambiar('campo_la_esperanza')
    await screen.findByRole('heading', { name: 'No encontramos lo que buscás' })
    expect(senales.every((signal) => signal.aborted)).toBe(true)
    await act(async () => { liberar(); await pendiente })
    expect(screen.queryByRole('heading', { name: /SN-014/ })).not.toBeInTheDocument()
    expect(screen.queryByText('12 %')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('no muestra metadatos de navegación sin validar primero el histórico', async () => {
    let liberar!: () => void
    const pendiente = new Promise<void>((resolver) => { liberar = resolver })
    let recibida = false
    server.use(http.get('*/sensores/:deviceId/historico', async () => {
      recibida = true
      await pendiente
      return HttpResponse.json({ error: 'No encontramos este sensor' }, { status: 404 })
    }))
    montar('/sensores/sensor_014/historico', 'token-demo-lucia', {
      sensor: { deviceId: 'sensor_014', nombre: 'NOMBRE-AJENO', area_id: 'campo_norte', area_nombre: 'AREA-AJENA' },
    })
    await waitFor(() => expect(recibida).toBe(true), { timeout: 5000 })
    expect(screen.queryByText(/NOMBRE-AJENO|AREA-AJENA/)).not.toBeInTheDocument()
    expect(screen.getByText('Cargando histórico…')).toBeInTheDocument()
    liberar()
    await screen.findByRole('heading', { name: 'No encontramos lo que buscás' })
  })

  it.each(['', '/historico'])('no consulta sensores sin un campo disponible: %s', async (sufijo) => {
    let pedidos = 0
    server.use(
      http.get('*/auth/demo/campos', () => HttpResponse.json({ campos: [] })),
      http.get('*/sensores/:deviceId', () => { pedidos += 1; return HttpResponse.json({}) }),
      http.get('*/sensores/:deviceId/historico', () => { pedidos += 1; return HttpResponse.json({}) }),
    )
    montar(`/sensores/sensor_014${sufijo}`)
    await screen.findByText('No tenés campos disponibles', {}, { timeout: 5000 })
    expect(pedidos).toBe(0)
  })

  it.each(['', '/historico'])('trata una respuesta 403 como acceso no disponible: %s', async (sufijo) => {
    const ruta = sufijo ? '*/sensores/:deviceId/historico' : '*/sensores/:deviceId'
    server.use(http.get(ruta, () => HttpResponse.json({ error: 'Acceso denegado' }, { status: 403 })))
    montar(`/sensores/sensor_014${sufijo}`)
    await screen.findByRole('heading', { name: 'No encontramos lo que buscás' }, { timeout: 5000 })
    expect(screen.queryByRole('heading', { name: /SN-014/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
  })
})
