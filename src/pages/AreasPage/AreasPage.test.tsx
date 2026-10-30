import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BreadcrumbProvider } from '../../components/layout/BreadcrumbProvider'
import { server } from '../../mocks/server'
import { renderConRutas } from '../../test/utils'
import type { AreasRespuesta } from '../../types/areas'
import AreasPage from './AreasPage'
import { CampoPrueba } from '../../test/campo'
import { prepararCampoPrueba } from '../../test/prepararCampo'

function mostrarAreas() {
  prepararCampoPrueba()
  return renderConRutas(
    <CampoPrueba><BreadcrumbProvider>
      <Routes>
        <Route path="/areas" element={<AreasPage />} />
        <Route path="/areas/:areaId" element={<h1>Detalle del área</h1>} />
      </Routes>
    </BreadcrumbProvider></CampoPrueba>,
    '/areas',
  )
}

function tarjeta(nombre: RegExp) {
  return screen.findByRole('link', { name: nombre })
}

describe('AreasPage', () => {
  it('AC1: cada tarjeta muestra sensores, conectados, desconectados y última actualización', async () => {
    mostrarAreas()

    const norte = await tarjeta(/Área Norte/)
    expect(norte).toHaveTextContent('5 sensores')
    expect(norte).toHaveTextContent('4 conectados')
    expect(norte).toHaveTextContent('1 desconectado')
    expect(norte).toHaveTextContent('Última actualización:')
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('AC1: sin comunicación de ningún sensor, la última actualización dice "Sin datos"', async () => {
    const respuesta: AreasRespuesta = {
      areas: [
        {
          area_id: 'campo_nuevo',
          nombre: 'Área Nueva',
          sensores: 1,
          conectados: 0,
          desconectados: 1,
          alertas_activas: 0,
          ultima_actualizacion: null,
        },
      ],
    }
    server.use(http.get('*/areas', () => HttpResponse.json(respuesta)))
    mostrarAreas()

    expect(await tarjeta(/Área Nueva/)).toHaveTextContent('Última actualización: Sin datos')
  })

  it('AC2: un área con alertas activas muestra su badge y una sin alertas no', async () => {
    mostrarAreas()

    expect(await tarjeta(/Área Norte/)).toHaveTextContent('2 alertas activas')
    expect(screen.queryByRole('link', { name: /Área Este/ })).not.toBeInTheDocument()

    const oeste = await tarjeta(/Área Oeste/)
    expect(oeste).toHaveTextContent('Sin alertas')
    expect(oeste).not.toHaveTextContent(/\d+ alertas? activas?/)
  })

  it('AC3: al hacer clic en una tarjeta navega al detalle del área', async () => {
    mostrarAreas()

    fireEvent.click(await tarjeta(/Área Norte/))

    expect(await screen.findByRole('heading', { name: 'Detalle del área' })).toBeInTheDocument()
  })

  it('mientras carga muestra las tarjetas de carga y después las reemplaza por los datos', async () => {
    mostrarAreas()

    expect(screen.getByRole('status', { name: 'Cargando áreas' })).toBeInTheDocument()

    await tarjeta(/Área Norte/)

    expect(screen.queryByRole('status', { name: 'Cargando áreas' })).not.toBeInTheDocument()
  })

  it('si el cliente no tiene áreas muestra el mismo mensaje que el dashboard', async () => {
    server.use(http.get('*/areas', () => HttpResponse.json({ areas: [] })))
    mostrarAreas()

    expect(await screen.findByText('Todavía no tenés áreas asignadas')).toBeInTheDocument()
    expect(screen.getByText('Contactá al administrador.')).toBeInTheDocument()
  })

  it('si falla la primera carga muestra el error y permite reintentar', async () => {
    server.use(
      http.get('*/areas', () => HttpResponse.json({ error: 'falló' }, { status: 500 }), {
        once: true,
      }),
    )
    mostrarAreas()

    expect(await screen.findByText('No se pudo cargar el listado de áreas.')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    await tarjeta(/Área Norte/)
    expect(screen.queryByText('No se pudo cargar el listado de áreas.')).not.toBeInTheDocument()
  })

  it('si falla una actualización mantiene el listado anterior con el aviso de desactualizado', async () => {
    mostrarAreas()
    await tarjeta(/Área Norte/)

    server.use(
      http.get('*/areas', () => HttpResponse.json({ error: 'falló' }, { status: 500 }), {
        once: true,
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))

    expect(await screen.findByText(/puede estar desactualizado/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Área Norte/ })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    await waitFor(() =>
      expect(screen.queryByText(/puede estar desactualizado/)).not.toBeInTheDocument(),
    )
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })
  it('si falla una actualización del listado vacío muestra el error y permite reintentar', async () => {
    server.use(http.get('*/areas', () => HttpResponse.json({ areas: [] })))
    mostrarAreas()
    await screen.findByText('Todavía no tenés áreas asignadas')
    server.use(
      http.get('*/areas', () => HttpResponse.json({ error: 'falló' }, { status: 500 }), {
        once: true,
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('puede estar desactualizado')
    expect(screen.getByText('Todavía no tenés áreas asignadas')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(screen.getByText('Todavía no tenés áreas asignadas')).toBeInTheDocument()
  })
})
