import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse, delay } from 'msw'
import { BreadcrumbProvider } from '../../components/layout/BreadcrumbProvider'
import { server } from '../../mocks/server'
import { tieneUbicacion, type SensorMapa } from '../../types/mapa'
import MapaPage from './MapaPage'
import { CampoPrueba } from '../../test/campo'
import { prepararCampoPrueba } from '../../test/prepararCampo'
import { obtenerMapa } from '../../api/mapa'
// La integración real Leaflet/popup se verifica en navegador. Aquí se inspecciona
// qué sensores recibe el mapa, sin depender del motor de layout de jsdom.
vi.mock('./MapaSensores', () => ({
  default: ({ sensores }: { sensores: SensorMapa[] }) => (
    <div aria-label="Mapa base">
      {sensores.map((s) => (
        <span key={s.device_id}>{`Pin ${s.nombre} ${s.estado}`}</span>
      ))}
    </div>
  ),
}))
function montar() {
  prepararCampoPrueba()
  render(
    <CampoPrueba><MemoryRouter initialEntries={['/mapa']}>
      <BreadcrumbProvider>
        <Routes>
          <Route path="/mapa" element={<MapaPage />} />
          <Route path="/sensores/:deviceId" element={<h1>Detalle del sensor</h1>} />
        </Routes>
      </BreadcrumbProvider>
    </MemoryRouter></CampoPrueba>,
  )
}
describe('mapa de sensores', () => {
  it('ubica los 7 sensores del campo con coordenadas y lista aparte el restante', async () => {
    montar()
    expect(await screen.findByRole('heading', { name: 'Sensores sin ubicación' })).toBeTruthy()
    expect(screen.getAllByText(/^Pin /)).toHaveLength(7)
    expect(screen.queryByText('Pin SN-005 desconectado')).toBeNull()
    expect(screen.getByText('Pin SN-015 desconectado')).toBeTruthy()
    expect(screen.getByText('Pin SN-014 conectado')).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'SN-002 · Área Oeste' }))
    expect(await screen.findByRole('heading', { name: 'Detalle del sensor' })).toBeTruthy()
  })
  it('filtra por área y conectividad sin mezclar sensores', async () => {
    montar()
    await screen.findByRole('heading', { name: 'Sensores sin ubicación' })
    fireEvent.change(screen.getByLabelText('Área'), { target: { value: 'campo_norte' } })
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'desconectado' } })
    expect(screen.queryByRole('heading', { name: 'Sensores sin ubicación' })).toBeNull()
    expect(screen.getByText('Pin SN-015 desconectado')).toBeTruthy()
    expect(screen.queryByText('Pin SN-014 conectado')).toBeNull()
  })
  it('conserva el mapa base durante carga y error y permite reintentar', async () => {
    let falla = true
    server.use(
      http.get('*/api/v1/mapa/sensores', async () => {
        await delay(40)
        return falla
          ? HttpResponse.json({ error: 'Fallo' }, { status: 500 })
          : HttpResponse.json({ sensores: [] })
      }),
    )
    montar()
    expect(await screen.findByLabelText('Mapa base')).toBeTruthy()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los sensores del mapa',
    )
    expect(screen.getByLabelText('Mapa base')).toBeTruthy()
    falla = false
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('No hay sensores geolocalizados para mostrar')).toBeTruthy()
  })
  it('una respuesta vacía no genera pines', async () => {
    server.use(http.get('*/api/v1/mapa/sensores', () => HttpResponse.json({ sensores: [] })))
    montar()
    expect(await screen.findByText('No hay sensores geolocalizados para mostrar')).toBeTruthy()
    expect(screen.queryByText(/Pin SN/)).toBeNull()
  })
  it('lista los sensores propios sin inventar marcadores cuando faltan todas las ubicaciones', async () => {
    prepararCampoPrueba()
    const mapa = await obtenerMapa('campo_el_molino', new AbortController().signal)
    server.use(http.get('*/mapa/sensores', () => HttpResponse.json({
      sensores: mapa.sensores.map((sensor) => ({ ...sensor, ubicacion: null })),
    })))
    montar()
    await screen.findByText('No hay sensores geolocalizados para mostrar')
    expect(screen.getByRole('heading', { name: 'Sensores sin ubicación' })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(8)
    expect(screen.queryByText(/Pin SN/)).not.toBeInTheDocument()
  })
  it('rechaza coordenadas inválidas y conserva ceros válidos', () => {
    const sensor = { ubicacion: { lat: 0, lon: 0 } } as SensorMapa
    expect(tieneUbicacion(sensor)).toBe(true)
    for (const ubicacion of [null, { lat: NaN, lon: 1 }, { lat: 91, lon: 0 }, { lat: 0, lon: 181 }])
      expect(tieneUbicacion({ ...sensor, ubicacion })).toBe(false)
  })
})
