import { useCallback, useEffect, useRef, useState } from 'react'
import { ErrorApi } from '../types/comun'

export type EstadoCarga = 'cargando' | 'exito' | 'error'

export interface ResultadoApi<T> {
  estado: EstadoCarga
  datos: T | null
  error: ErrorApi | null
  recargar: () => void
  // true cuando la última recarga falló pero hay datos anteriores en pantalla
  desactualizado: boolean
}

interface Guardado<T> {
  clave: string
  intento: number
  estado: 'exito' | 'error'
  datos: T | null
  error: ErrorApi | null
}

function comoErrorApi(error: unknown): ErrorApi {
  return error instanceof ErrorApi ? error : new ErrorApi('Ocurrió un error inesperado', null)
}

export function useApi<T>(
  funcion: (signal: AbortSignal) => Promise<T>,
  dependencias: readonly unknown[] = [],
): ResultadoApi<T> {
  // Los parámetros se comparan por su contenido: son ids y filtros simples.
  const clave = JSON.stringify(dependencias)
  const [intento, setIntento] = useState(0)
  const [guardado, setGuardado] = useState<Guardado<T> | null>(null)

  // Siempre se usa la versión más reciente de la función, sin reiniciar el pedido.
  const funcionActual = useRef(funcion)
  useEffect(() => {
    funcionActual.current = funcion
  })

  useEffect(() => {
    const controlador = new AbortController()

    new Promise<T>((resolver) => resolver(funcionActual.current(controlador.signal)))
      .then((datos) => {
        // Respuesta de un pedido ya cancelado: se ignora (regla anti-carrera).
        if (controlador.signal.aborted) return
        setGuardado({ clave, intento, estado: 'exito', datos, error: null })
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        setGuardado((previo) => ({
          clave,
          intento,
          estado: 'error',
          // Si falla una recarga con los mismos parámetros, se conservan los datos.
          datos: previo?.clave === clave ? previo.datos : null,
          error: comoErrorApi(error),
        }))
      })

    return () => controlador.abort()
  }, [clave, intento])

  const recargar = useCallback(() => setIntento((n) => n + 1), [])

  if (guardado === null || guardado.clave !== clave) {
    // Primer pedido o parámetros nuevos: no se muestra nada del pedido anterior.
    return { estado: 'cargando', datos: null, error: null, desactualizado: false, recargar }
  }

  if (guardado.intento !== intento) {
    // Recargando con los mismos parámetros: se conservan los datos anteriores.
    return { estado: 'cargando', datos: guardado.datos, error: null, desactualizado: false, recargar }
  }

  return {
    estado: guardado.estado,
    datos: guardado.datos,
    error: guardado.error,
    desactualizado: guardado.estado === 'error' && guardado.datos !== null,
    recargar,
  }
}