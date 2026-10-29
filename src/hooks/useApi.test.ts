import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ErrorApi } from '../types/comun'
import { useApi } from './useApi'

interface Diferido<T> {
  promesa: Promise<T>
  resolver: (valor: T) => void
  rechazar: (motivo: unknown) => void
}

// Una promesa que se resuelve o falla cuando el test lo decide.
function diferido<T>(): Diferido<T> {
  let resolver!: (valor: T) => void
  let rechazar!: (motivo: unknown) => void
  const promesa = new Promise<T>((res, rej) => {
    resolver = res
    rechazar = rej
  })
  return { promesa, resolver, rechazar }
}

describe('useApi', () => {
  it('pasa de cargando a éxito con los datos', async () => {
    const { result } = renderHook(() => useApi(() => Promise.resolve('hola')))

    expect(result.current.estado).toBe('cargando')
    await waitFor(() => expect(result.current.estado).toBe('exito'))
    expect(result.current.datos).toBe('hola')
    expect(result.current.error).toBeNull()
  })

  it('devuelve el error cuando el pedido falla', async () => {
    const { result } = renderHook(() =>
      useApi(() => Promise.reject(new ErrorApi('falló', 500))),
    )

    await waitFor(() => expect(result.current.estado).toBe('error'))
    expect(result.current.error?.estado).toBe(500)
    expect(result.current.datos).toBeNull()
    expect(result.current.desactualizado).toBe(false)
  })

  it('al recargar conserva los datos anteriores mientras carga', async () => {
    const pedidos = [diferido<string>(), diferido<string>()]
    let llamadas = 0
    const { result } = renderHook(() => useApi(() => pedidos[llamadas++].promesa))

    await act(async () => {
      pedidos[0].resolver('uno')
    })
    expect(result.current.datos).toBe('uno')

    act(() => {
      result.current.recargar()
    })
    expect(result.current.estado).toBe('cargando')
    expect(result.current.datos).toBe('uno')

    await act(async () => {
      pedidos[1].resolver('dos')
    })
    expect(result.current.estado).toBe('exito')
    expect(result.current.datos).toBe('dos')
  })

  it('si la recarga falla conserva los datos y queda desactualizado', async () => {
    const pedidos = [diferido<string>(), diferido<string>()]
    let llamadas = 0
    const { result } = renderHook(() => useApi(() => pedidos[llamadas++].promesa))

    await act(async () => {
      pedidos[0].resolver('uno')
    })
    act(() => {
      result.current.recargar()
    })
    await act(async () => {
      pedidos[1].rechazar(new ErrorApi('sin conexión', null))
    })

    expect(result.current.estado).toBe('error')
    expect(result.current.datos).toBe('uno')
    expect(result.current.desactualizado).toBe(true)
  })

  it('al cambiar los parámetros descarta los datos del pedido anterior', async () => {
    const pedidos: Record<string, Diferido<string>> = { a: diferido(), b: diferido() }
    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useApi(() => pedidos[id].promesa, [id]),
      { initialProps: { id: 'a' } },
    )

    await act(async () => {
      pedidos.a.resolver('datos de a')
    })
    expect(result.current.datos).toBe('datos de a')

    rerender({ id: 'b' })
    expect(result.current.estado).toBe('cargando')
    expect(result.current.datos).toBeNull()
  })

  it('una respuesta vieja nunca reemplaza a la nueva', async () => {
    const pedidos: Record<string, Diferido<string>> = { a: diferido(), b: diferido() }
    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useApi(() => pedidos[id].promesa, [id]),
      { initialProps: { id: 'a' } },
    )

    // Se cambia de "a" a "b" antes de que "a" responda.
    rerender({ id: 'b' })
    await act(async () => {
      pedidos.b.resolver('datos de b')
    })
    expect(result.current.datos).toBe('datos de b')

    // La respuesta lenta de "a" llega tarde y se ignora.
    await act(async () => {
      pedidos.a.resolver('datos de a')
    })
    expect(result.current.datos).toBe('datos de b')
    expect(result.current.estado).toBe('exito')
  })
})