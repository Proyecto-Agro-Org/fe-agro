import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse, delay } from 'msw'
import { describe, expect, it } from 'vitest'
import { BreadcrumbProvider } from '../../components/layout/BreadcrumbProvider'
import { server } from '../../mocks/server'
import SensorDetallePage from './SensorDetallePage'
import { CampoPrueba } from '../../test/campo'
import { prepararCampoPrueba } from '../../test/prepararCampo'
function montar(id = 'sensor_014') {
  const campoId = ['sensor_005', 'sensor_010'].includes(id) ? 'campo_la_ribera' : 'campo_el_molino'
  prepararCampoPrueba(campoId)
  render(
    <CampoPrueba campoId={campoId}><MemoryRouter initialEntries={[`/sensores/${id}`]}>
      <BreadcrumbProvider>
        <Routes>
          <Route path="/sensores/:deviceId" element={<SensorDetallePage />} />
          <Route path="/sensores/:deviceId/historico" element={<h1>Históricos</h1>} />
        </Routes>
      </BreadcrumbProvider>
    </MemoryRouter></CampoPrueba>,
  )
}
describe('detalle del sensor', () => {
  it('muestra seis variables con unidades y permite ir a históricos', async () => {
    montar()
    await screen.findByRole('heading', { name: 'Sensor SN-014' })
    expect(screen.getByText('12 %')).toBeTruthy()
    expect(
      within(screen.getByRole('region', { name: 'Últimas mediciones' })).getAllByRole('definition'),
    ).toHaveLength(6)
    expect(screen.getByText(/°C/)).toBeTruthy()
    expect(screen.getByText(/dS\/m/)).toBeTruthy()
    expect(screen.getAllByText(/mg\/kg/)).toHaveLength(3)
    fireEvent.click(screen.getByRole('link', { name: 'Ver históricos' }))
    expect(await screen.findByRole('heading', { name: 'Históricos' })).toBeTruthy()
  })
  it('un sensor desconectado conserva sus últimas lecturas y fechas', async () => {
    montar('sensor_005')
    await screen.findByRole('heading', { name: 'Sensor SN-005' })
    expect(screen.getByText('Desconectado')).toBeTruthy()
    expect(screen.getByText(/Se muestran las últimas mediciones conocidas/)).toBeTruthy()
    expect(
      within(screen.getByRole('region', { name: 'Últimas mediciones' })).getAllByRole('definition'),
    ).toHaveLength(6)
    expect(document.querySelectorAll('time[datetime]')).toHaveLength(2)
    expect(screen.queryByRole('alert')).toBeNull()
  })
  it('sin mediciones muestra vacío sin inventar ceros', async () => {
    montar('sensor_010')
    expect(await screen.findByText('Este sensor todavía no reportó mediciones')).toBeTruthy()
    expect(screen.getByText(/Sin comunicación registrada/)).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Últimas mediciones' })).toBeNull()
  })
  it('muestra sin datos para conductividad ausente y admite ubicación ausente', async () => {
    montar('sensor_013')
    expect(await screen.findByText('sin datos')).toBeTruthy()
    expect(
      within(screen.getByRole('region', { name: 'Últimas mediciones' })).getAllByRole('definition'),
    ).toHaveLength(6)
  })
  it('muestra skeleton mientras espera y recupera un error con reintento', async () => {
    let falla = true
    server.use(
      http.get('*/api/v1/sensores/:deviceId', async () => {
        await delay(40)
        if (falla) return HttpResponse.json({ error: 'Fallo' }, { status: 500 })
        return HttpResponse.json({
          device_id: 'sensor_002',
          nombre: 'SN-002',
          area_id: 'campo_oeste',
          area_nombre: 'Área Oeste',
          estado: 'conectado',
          ultima_comunicacion: null,
          ubicacion: null,
          ultima_medicion: null,
        })
      }),
    )
    montar('sensor_002')
    expect(screen.getByRole('status', { name: 'Cargando sensor' })).toBeTruthy()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el sensor')
    falla = false
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: 'Sensor SN-002' })).toBeTruthy()
    expect(screen.getByText('Sin ubicación')).toBeTruthy()
  })
  it('distingue sensor inexistente de sensor sin lecturas', async () => {
    montar('inexistente')
    expect(
      await screen.findByRole('heading', { name: 'No encontramos lo que buscás' }),
    ).toBeTruthy()
    expect(screen.queryByText('Este sensor todavía no reportó mediciones')).toBeNull()
    expect(screen.getByRole('link', { name: 'Volver a Áreas' })).toHaveAttribute('href', '/areas')
    expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull()
  })
})
