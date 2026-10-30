import type { Campo } from '../types/dominio'
import { apiFetch } from './client'

export async function obtenerCamposDemo(clienteId: string, signal: AbortSignal): Promise<Campo[]> {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') {
    throw new Error('La consulta de campos demo requiere mocks.')
  }
  // El cliente no se envía como parámetro: el mock lo resuelve desde el token.
  const respuesta = await apiFetch<{ campos: Campo[] }>('/auth/demo/campos', { signal })
  const campos = respuesta?.campos
  if (!Array.isArray(campos) || campos.some((campo) => (
    !campo || typeof campo.campo_id !== 'string' || !campo.campo_id.trim() ||
    typeof campo.nombre !== 'string' || !campo.nombre.trim() || campo.cliente_id !== clienteId
  )) || new Set(campos.map((campo) => campo.campo_id)).size !== campos.length) {
    throw new Error('La respuesta de campos no corresponde al cliente de la sesión.')
  }
  return campos
}
