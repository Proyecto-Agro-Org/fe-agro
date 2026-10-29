import { BreadcrumbProvider } from '../../components/layout/BreadcrumbProvider'
import { Breadcrumb } from '../../components/layout/Breadcrumb'
import { fireEvent, screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { server } from '../../mocks/server'
import { renderConRutas } from '../../test/utils'
import type { DashboardRespuesta } from '../../types/dashboard'
import DashboardPage from './DashboardPage'

function mostrarDashboard() {
  return renderConRutas(
    <Routes>
      <Route
        path="/dashboard"
        element={
          <BreadcrumbProvider>
            <Breadcrumb />
            <DashboardPage />
          </BreadcrumbProvider>
        }
      />
    </Routes>,
    '/dashboard',
  )
}

async function esperarMetricas() {
  return within(await screen.findByRole('list', { name: 'Resumen general' }))
}

describe('DashboardPage', () => {
  it('AC1: muestra las métricas, la última actualización, las áreas y las últimas alertas', async () => {
    mostrarDashboard()
    const metricas = await esperarMetricas()

    expect(metricas.getByText('Áreas').closest('li')).toHaveTextContent(/^Áreas4$/)
    expect(metricas.getByText('Sensores conectados').closest('li')).toHaveTextContent(
      /^Sensores conectados11 \/ 15$/,
    )
    expect(metricas.getByText('Sensores desconectados').closest('li')).toHaveTextContent(
      /^Sensores desconectados4$/,
    )
    expect(metricas.getByText('Alertas activas').closest('li')).toHaveTextContent(
      /^Alertas activas5$/,
    )
    expect(screen.getByText(/Última actualización:/)).toBeInTheDocument()

    expect(
      within(screen.getByRole('region', { name: 'Áreas' })).getByRole('link', {
        name: /Área Norte/,
      }),
    ).toHaveAttribute('href', '/areas/campo_norte')
    expect(
      within(screen.getByRole('region', { name: 'Áreas' })).getByRole('link', {
        name: /Área Oeste/,
      }),
    ).toBeInTheDocument()

    const alertas = within(screen.getByRole('region', { name: 'Últimas alertas' }))
    expect(alertas.getAllByRole('listitem')).toHaveLength(4)
  })

  it('AC2: la tabla distingue áreas con alertas y sin alertas', async () => {
    mostrarDashboard()
    await esperarMetricas()

    expect(
      within(screen.getByRole('region', { name: 'Áreas' }))
        .getByRole('link', {
          name: /Área Norte/,
        })
        .closest('tr'),
    ).toHaveTextContent('2 alertas')
    expect(
      within(screen.getByRole('region', { name: 'Áreas' }))
        .getByRole('link', {
          name: /Área Este/,
        })
        .closest('tr'),
    ).toHaveTextContent('1 alerta')
    expect(
      within(screen.getByRole('region', { name: 'Áreas' }))
        .getByRole('link', {
          name: /Área Oeste/,
        })
        .closest('tr'),
    ).toHaveTextContent('Sin alertas')
  })

  it('limita las últimas alertas a las cuatro más recientes', async () => {
    mostrarDashboard()
    await esperarMetricas()

    expect(screen.queryByText('SN-011')).not.toBeInTheDocument()
    expect(screen.getByText('SN-015')).toBeInTheDocument()
  })

  it('mientras carga muestra el estado de carga y después lo reemplaza por los datos', async () => {
    mostrarDashboard()

    expect(screen.getByRole('status', { name: 'Cargando el resumen' })).toBeInTheDocument()
    expect(screen.queryByText('Sensores conectados')).not.toBeInTheDocument()

    await esperarMetricas()

    expect(screen.queryByRole('status', { name: 'Cargando el resumen' })).not.toBeInTheDocument()
  })

  it('si el cliente no tiene áreas muestra el mensaje y no tarjetas en cero', async () => {
    const vacia: DashboardRespuesta = {
      resumen: { areas: 0, sensores: 0, conectados: 0, desconectados: 0, alertas_activas: 0 },
      areas: [],
      ultimas_alertas: [],
      ultima_actualizacion: new Date().toISOString(),
    }
    server.use(http.get('*/dashboard/resumen', () => HttpResponse.json(vacia)))
    mostrarDashboard()

    expect(await screen.findByText('Todavía no tenés áreas asignadas')).toBeInTheDocument()
    expect(screen.getByText('Contactá al administrador.')).toBeInTheDocument()
    expect(screen.queryByText('Sensores conectados')).not.toBeInTheDocument()
  })

  it('AC3: si falla el pedido muestra el error sin datos parciales y permite reintentar', async () => {
    server.use(
      http.get(
        '*/dashboard/resumen',
        () => HttpResponse.json({ error: 'falló' }, { status: 500 }),
        {
          once: true,
        },
      ),
    )
    mostrarDashboard()

    expect(await screen.findByText('No se pudo cargar el resumen.')).toBeInTheDocument()
    expect(screen.queryByText('Sensores conectados')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    await esperarMetricas()
    expect(screen.queryByText('No se pudo cargar el resumen.')).not.toBeInTheDocument()
  })
  it('muestra Inicio en el breadcrumb y enlaza las alertas al sensor', async () => {
    mostrarDashboard()
    await esperarMetricas()
    expect(screen.getByRole('navigation', { name: 'Migas de pan' })).toHaveTextContent('Inicio')
    const alertas = within(screen.getByRole('region', { name: 'Últimas alertas' }))
    const enlaces = alertas
      .getAllByRole('link')
      .filter((enlace) => enlace.getAttribute('href')?.startsWith('/sensores/'))
    expect(enlaces).toHaveLength(4)
    expect(enlaces[0]).toHaveAttribute('href', '/sensores/sensor_015')
  })
})
