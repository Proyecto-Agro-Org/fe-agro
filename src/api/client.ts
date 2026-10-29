import { ErrorApi } from '../types/comun'
import { avisarSesionExpirada, leerToken } from './sesion'

const URL_BASE: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

interface Opciones {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
  // true solo para POST /auth/login: no manda token y un 401 no cierra sesión.
  sinSesion?: boolean
}

async function leerMensajeError(respuesta: Response): Promise<string> {
  try {
    const cuerpo = (await respuesta.json()) as { error?: string }
    if (cuerpo.error) return cuerpo.error
  } catch {
    // El cuerpo no era JSON: se usa el texto del estado HTTP.
  }
  return respuesta.statusText || `Error ${respuesta.status}`
}

export async function apiFetch<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { method = 'GET', body, signal, sinSesion = false } = opciones

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = leerToken()
  if (!sinSesion && token) headers.Authorization = `Bearer ${token}`

  let respuesta: Response
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    // Un pedido cancelado a propósito no es un error de conexión.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ErrorApi('No se pudo conectar con el servidor', null)
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && !sinSesion) avisarSesionExpirada()
    throw new ErrorApi(await leerMensajeError(respuesta), respuesta.status)
  }

  return (await respuesta.json()) as T
}

// Arma una ruta con parámetros, salteando los que no tienen valor.
export function conParametros(
  ruta: string,
  parametros: Record<string, string | number | undefined>,
): string {
  const query = new URLSearchParams()
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== '') query.set(clave, String(valor))
  })
  const texto = query.toString()
  return texto ? `${ruta}?${texto}` : ruta
}