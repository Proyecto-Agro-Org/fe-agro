import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { BreadcrumbProvider } from '../../components/layout/BreadcrumbProvider'
import { server } from '../../mocks/server'
import HistoricoPage from './HistoricoPage'
beforeAll(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
)
afterAll(() => vi.unstubAllGlobals())
function montar(id = 'sensor_014') {
  render(
    <MemoryRouter initialEntries={[`/sensores/${id}/historico`]}>
      <BreadcrumbProvider>
        <Routes>
          <Route path="/sensores/:deviceId/historico" element={<HistoricoPage />} />
        </Routes>
      </BreadcrumbProvider>
    </MemoryRouter>,
  )
}
const respuesta = {
  device_id: 'sensor_014',
  nombre: 'SN-014',
  area_id: 'campo_norte',
  area_nombre: 'Área Norte',
  variable: 'humedad',
  unidad: '%',
  puntos: [
    { timestamp: '2026-10-27T12:00:00Z', valor: 34 },
    { timestamp: '2026-10-27T12:30:00Z', valor: null },
    { timestamp: '2026-10-27T13:00:00Z', valor: 36 },
  ],
  truncado: false,
}
describe('históricos', () => {
  it('muestra gráfico, unidades y tabla con huecos sin convertirlos a cero', async () => {
    server.use(
      http.get('*/api/v1/sensores/:deviceId/historico', () => HttpResponse.json(respuesta)),
    )
    montar()
    expect(
      await screen.findByRole(
        'img',
        { name: /Gráfico de Humedad: 2 mediciones en %/ },
        { timeout: 10000 },
      ),
    ).toBeTruthy()
    fireEvent.click(screen.getByText('Ver datos en tabla'))
    expect(screen.getByRole('table')).toHaveTextContent('sin datos')
    expect(screen.getByRole('table')).toHaveTextContent('34 %')
  })
  it('no hace pedidos cuando el rango es inválido', async () => {
    let pedidos = 0
    server.use(
      http.get('*/api/v1/sensores/:deviceId/historico', () => {
        pedidos++
        return HttpResponse.json(respuesta)
      }),
    )
    montar()
    await screen.findByRole('img')
    const previos = pedidos
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2030-01-02' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2030-01-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    expect(screen.getByRole('alert')).toHaveTextContent('posterior')
    expect(pedidos).toBe(previos)
  })
  it('aplica variable y fechas convertidas a UTC', async () => {
    let url = ''
    server.use(
      http.get('*/api/v1/sensores/:deviceId/historico', ({ request }) => {
        url = request.url
        return HttpResponse.json(respuesta)
      }),
    )
    montar()
    await screen.findByRole('img')
    fireEvent.change(screen.getByLabelText('Variable'), { target: { value: 'temperatura' } })
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-20' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-10-21' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await waitFor(() => expect(new URL(url).searchParams.get('variable')).toBe('temperatura'))
    expect(new URL(url).searchParams.get('desde')).toBe(
      new Date('2026-10-20T00:00:00').toISOString(),
    )
    expect(new URL(url).searchParams.get('hasta')).toBe(
      new Date('2026-10-21T23:59:59.999').toISOString(),
    )
  })
  it('muestra vacío para sensor sin mediciones usando el handler real', async () => {
    montar('sensor_010')
    expect(await screen.findByText('No hay datos para el período seleccionado')).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
  })
  it('permite reintentar un error de API', async () => {
    let falla = true
    server.use(
      http.get('*/api/v1/sensores/:deviceId/historico', () =>
        falla
          ? HttpResponse.json({ error: 'Fallo' }, { status: 500 })
          : HttpResponse.json(respuesta),
      ),
    )
    montar()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el histórico')
    falla = false
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('img')).toBeTruthy()
  })
  it('avisa cuando los resultados están truncados', async () => {
    server.use(
      http.get('*/api/v1/sensores/:deviceId/historico', () =>
        HttpResponse.json({ ...respuesta, truncado: true }),
      ),
    )
    montar()
    expect(await screen.findByText(/primeros 1000 puntos/)).toBeTruthy()
  })
  it('muestra el 404 con enlace a Áreas y sin reintento', async () => {
    montar('inexistente')
    expect(
      await screen.findByRole('heading', { name: 'No encontramos lo que buscás' }),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Volver a Áreas' })).toHaveAttribute('href', '/areas')
    expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull()
  })
  it('inicia con siete fechas locales y consulta hasta el fin del día', async () => {
    let url = ''
    server.use(
      http.get('*/api/v1/sensores/:deviceId/historico', ({ request }) => {
        url = request.url
        return HttpResponse.json(respuesta)
      }),
    )
    montar()
    await screen.findByRole('img')
    const desde = screen.getByLabelText('Desde') as HTMLInputElement
    const hasta = screen.getByLabelText('Hasta') as HTMLInputElement
    expect(desde.type).toBe('date')
    expect(hasta.type).toBe('date')
    const primero = new Date(`${hasta.value}T00:00:00`)
    primero.setDate(primero.getDate() - 6)
    expect(new Date(`${desde.value}T00:00:00`).getTime()).toBe(primero.getTime())
    expect(new URL(url).searchParams.get('hasta')).toBe(
      new Date(`${hasta.value}T23:59:59.999`).toISOString(),
    )
  })
})
