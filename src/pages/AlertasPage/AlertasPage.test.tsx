import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes, useParams } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BreadcrumbProvider } from '../../components/layout/BreadcrumbProvider'
import { server } from '../../mocks/server'
import { renderConRutas } from '../../test/utils'
import type { AlertasRespuesta } from '../../types/alertas'
import AlertasPage from './AlertasPage'

function Destino() {
  const { deviceId } = useParams()
  return <h1>Sensor {deviceId}</h1>
}

function mostrarAlertas() {
  return renderConRutas(
    <BreadcrumbProvider>
      <Routes>
        <Route path="/alertas" element={<AlertasPage />} />
        <Route path="/sensores/:deviceId" element={<Destino />} />
      </Routes>
    </BreadcrumbProvider>,
    '/alertas',
  )
}

function sensoresMostrados(): (string | undefined)[] {
  return screen.getAllByRole('link').map((enlace) => /SN-\d+/.exec(enlace.textContent ?? '')?.[0])
}

function filtrar(etiqueta: 'Área' | 'Tipo' | 'Severidad', valor: string) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
}

describe('AlertasPage', () => {
  it('AC1: lista las alertas activas con la de mayor severidad primero', async () => {
    mostrarAlertas()

    await screen.findAllByRole('link')

    expect(sensoresMostrados()).toEqual(['SN-015', 'SN-008', 'SN-005', 'SN-014', 'SN-007'])
    expect(screen.queryByText('5 alertas activas')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')[0].closest('tr')).toHaveTextContent('Alta')
    expect(screen.getAllByRole('link')[0].closest('tr')).toHaveTextContent(
      'SN-015Área NorteTécnica',
    )
  })

  it('AC1: filtra por severidad', async () => {
    mostrarAlertas()
    await screen.findAllByRole('link')

    filtrar('Severidad', 'alta')

    await waitFor(() => expect(sensoresMostrados()).toEqual(['SN-015', 'SN-008', 'SN-005']))
  })

  it('AC1: filtra por tipo', async () => {
    mostrarAlertas()
    await screen.findAllByRole('link')

    filtrar('Tipo', 'agronomica')

    await waitFor(() => expect(sensoresMostrados()).toEqual(['SN-014', 'SN-007']))
  })

  it('AC1: filtra por área', async () => {
    mostrarAlertas()
    await screen.findAllByRole('link')
    // Las opciones del desplegable llegan con el pedido de áreas.
    await screen.findByRole('option', { name: 'Área Norte' })

    filtrar('Área', 'campo_norte')

    await waitFor(() => expect(sensoresMostrados()).toEqual(['SN-015', 'SN-014']))
  })

  it('un área sin alertas activas lo dice y permite limpiar el filtro', async () => {
    mostrarAlertas()
    await screen.findAllByRole('link')
    await screen.findByRole('option', { name: 'Área Oeste' })

    filtrar('Área', 'campo_oeste')

    expect(await screen.findByText('No hay alertas activas con estos filtros')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    await waitFor(() => expect(screen.getAllByRole('link')).toHaveLength(5))
    expect(screen.getByLabelText('Área')).toHaveValue('')
  })

  it('si falla el pedido de áreas, las alertas se siguen mostrando', async () => {
    server.use(http.get('*/areas', () => HttpResponse.json({ error: 'falló' }, { status: 500 })))
    mostrarAlertas()

    await screen.findAllByRole('link')

    expect(sensoresMostrados()).toHaveLength(5)
    expect(screen.getByLabelText('Área')).toHaveValue('')
    expect(screen.queryByRole('option', { name: 'Área Norte' })).not.toBeInTheDocument()
  })

  it('si los filtros no encuentran nada lo dice y permite limpiarlos', async () => {
    mostrarAlertas()
    await screen.findAllByRole('link')

    filtrar('Severidad', 'alta')
    filtrar('Tipo', 'agronomica')

    expect(await screen.findByText('No hay alertas activas con estos filtros')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    await waitFor(() => expect(screen.getAllByRole('link')).toHaveLength(5))
    expect(screen.getByLabelText('Severidad')).toHaveValue('')
    expect(screen.getByLabelText('Tipo')).toHaveValue('')
  })

  it('AC2: sin alertas muestra el estado vacío positivo', async () => {
    const vacia: AlertasRespuesta = { total: 0, limit: 50, alertas: [] }
    server.use(http.get('*/alertas', () => HttpResponse.json(vacia)))
    mostrarAlertas()

    expect(await screen.findByText('No hay alertas activas')).toBeInTheDocument()
    expect(screen.getByText('No se registran alertas activas.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument()
  })

  it('AC3: al hacer clic en una alerta navega al sensor que la originó', async () => {
    mostrarAlertas()

    fireEvent.click((await screen.findAllByRole('link'))[0])

    expect(await screen.findByRole('heading', { name: 'Sensor sensor_015' })).toBeInTheDocument()
  })

  it('mientras carga muestra el estado de carga', async () => {
    mostrarAlertas()

    expect(screen.getByRole('status', { name: 'Cargando alertas' })).toBeInTheDocument()

    await screen.findAllByRole('link')

    expect(screen.queryByRole('status', { name: 'Cargando alertas' })).not.toBeInTheDocument()
  })

  it('si falla el pedido muestra el error y al reintentar conserva los filtros', async () => {
    mostrarAlertas()
    await screen.findAllByRole('link')

    server.use(
      http.get('*/alertas', () => HttpResponse.json({ error: 'falló' }, { status: 500 }), {
        once: true,
      }),
    )
    filtrar('Severidad', 'alta')

    expect(await screen.findByText('No se pudieron cargar las alertas.')).toBeInTheDocument()
    expect(screen.getByLabelText('Severidad')).toHaveValue('alta')

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    // Con el filtro todavía aplicado, vuelven solo las 3 alertas altas y no las 5.
    await waitFor(() => expect(sensoresMostrados()).toEqual(['SN-015', 'SN-008', 'SN-005']))
  })

  it('si hay más alertas que las que se muestran, el contador lo aclara', async () => {
    const parcial: AlertasRespuesta = {
      total: 73,
      limit: 50,
      alertas: [
        {
          alerta_id: 'alerta_x',
          device_id: 'sensor_015',
          sensor_nombre: 'SN-015',
          area_id: 'campo_norte',
          area_nombre: 'Área Norte',
          tipo: 'tecnica',
          severidad: 'alta',
          descripcion: 'Sin comunicación hace más de 30 minutos',
          timestamp: new Date().toISOString(),
          estado: 'activa',
        },
      ],
    }
    server.use(http.get('*/alertas', () => HttpResponse.json(parcial)))
    mostrarAlertas()

    expect(await screen.findByText(/Mostrando 1 de 73 alertas activas/)).toBeInTheDocument()
  })
  it('editar un filtro no hace pedidos hasta aplicar y conserva el filtro al reintentar', async () => {
    let pedidos = 0
    server.use(
      http.get('*/alertas', () => {
        pedidos++
        return HttpResponse.json({ total: 0, limit: 50, alertas: [] })
      }),
    )
    mostrarAlertas()
    await screen.findByText('No hay alertas activas')
    const anteriores = pedidos
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'agronomica' } })
    expect(pedidos).toBe(anteriores)
    expect(screen.getByText('No hay alertas activas')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await waitFor(() => expect(pedidos).toBe(anteriores + 1))
    expect(await screen.findByText('No hay alertas activas con estos filtros')).toBeInTheDocument()
  })
  it('ofrece recuperar el selector de áreas sin bloquear las alertas', async () => {
    server.use(
      http.get('*/areas', () => HttpResponse.json({ error: 'falló' }, { status: 500 }), {
        once: true,
      }),
    )
    mostrarAlertas()
    expect(
      await screen.findByText(/No se pudieron cargar las áreas del filtro/),
    ).toBeInTheDocument()
    await screen.findAllByRole('link')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar áreas' }))
    expect(await screen.findByRole('option', { name: 'Área Norte' })).toBeInTheDocument()
    expect(screen.queryByText(/No se pudieron cargar las áreas del filtro/)).not.toBeInTheDocument()
  })
})
