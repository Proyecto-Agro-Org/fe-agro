import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { BreadcrumbProvider } from '../../components/layout/BreadcrumbProvider'
import { server } from '../../mocks/server'
import AreaDetallePage from './AreaDetallePage'
function Cambiar() {
  const ir = useNavigate()
  return <button onClick={() => ir('/areas/campo_oeste')}>Cambiar área</button>
}
function montar(id = 'campo_norte') {
  return render(
    <MemoryRouter initialEntries={[`/areas/${id}`]}>
      <BreadcrumbProvider>
        <Cambiar />
        <Routes>
          <Route path="/areas/:areaId" element={<AreaDetallePage />} />
          <Route path="/sensores/:deviceId" element={<h1>Detalle del sensor</h1>} />
        </Routes>
      </BreadcrumbProvider>
    </MemoryRouter>,
  )
}
describe('detalle de área', () => {
  it('muestra sensores, desconexiones y alertas y navega al detalle', async () => {
    montar()
    expect(await screen.findByRole('heading', { name: 'Área Norte · Sensores' })).toBeTruthy()
    const sensor = await screen.findByRole('link', { name: /SN-015/ })
    expect(sensor).toHaveTextContent('Desconectado')
    expect(sensor).toHaveTextContent('1 alerta activa')
    expect(sensor.querySelector('time')?.getAttribute('datetime')).toBeTruthy()
    fireEvent.click(sensor)
    expect(await screen.findByRole('heading', { name: 'Detalle del sensor' })).toBeTruthy()
  })
  it('muestra el encabezado sin esperar a la lista', async () => {
    server.use(
      http.get('*/api/v1/areas/:areaId/sensores', async () => {
        await delay(150)
        return HttpResponse.json({ sensores: [] })
      }),
    )
    montar()
    expect(await screen.findByRole('heading', { name: 'Área Norte · Sensores' })).toBeTruthy()
    expect(screen.getByRole('status', { name: 'Cargando sensores' })).toBeTruthy()
    expect(await screen.findByText('Todavía no hay sensores instalados en esta área')).toBeTruthy()
  })
  it('conserva el encabezado cuando falla la lista y permite reintentar', async () => {
    let falla = true
    server.use(
      http.get('*/api/v1/areas/:areaId/sensores', () =>
        falla
          ? HttpResponse.json({ error: 'Fallo' }, { status: 500 })
          : HttpResponse.json({ sensores: [] }),
      ),
    )
    montar()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los sensores')
    expect(screen.getByRole('heading', { name: 'Área Norte · Sensores' })).toBeTruthy()
    falla = false
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Todavía no hay sensores instalados en esta área')).toBeTruthy()
  })
  it('distingue un área inexistente de una lista vacía', async () => {
    montar('inexistente')
    expect(
      await screen.findByRole('heading', { name: 'No encontramos lo que buscás' }),
    ).toBeTruthy()
    expect(screen.queryByText('Todavía no hay sensores instalados en esta área')).toBeNull()
    expect(screen.getByRole('link', { name: 'Volver a Áreas' })).toHaveAttribute('href', '/areas')
    expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull()
  })
  it('maneja sensores sin comunicación y sin ubicación', async () => {
    montar('campo_sur')
    expect(await screen.findByRole('link', { name: /SN-010/ })).toHaveTextContent(
      'Sin comunicación registrada',
    )
  })
  it('descarta la lista anterior al cambiar de área', async () => {
    montar()
    await screen.findByRole('link', { name: /SN-015/ })
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar área' }))
    await waitFor(() => expect(screen.queryByRole('link', { name: /SN-015/ })).toBeNull())
    expect(await screen.findByRole('link', { name: /SN-002/ })).toHaveTextContent('Sin ubicación')
    expect(screen.getByRole('heading', { name: 'Área Oeste · Sensores' })).toBeTruthy()
  })
})
