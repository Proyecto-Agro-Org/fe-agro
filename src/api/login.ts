import type { IdentidadSesion, LoginPedido, LoginRespuesta } from '../types/auth'
import { apiFetch } from './client'

// sinSesion: no manda un token viejo y un 401 se toma como credenciales inválidas,
// no como sesión expirada.
export function login(pedido: LoginPedido, signal?: AbortSignal): Promise<LoginRespuesta> {
  return apiFetch<LoginRespuesta>('/auth/login', {
    method: 'POST',
    body: pedido,
    sinSesion: true,
    signal,
  })
}

// Endpoint exclusivo de MSW: nunca debe solicitarse en el modo sin mocks.
export async function loginGoogleDemo(): Promise<LoginRespuesta> {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') {
    throw new Error('El acceso con Google todavía no está disponible.')
  }
  return apiFetch<LoginRespuesta>('/auth/google-demo', {
    method: 'POST',
    sinSesion: true,
  })
}

// Solo en modo mock: la identidad se resuelve desde el token, nunca desde un cliente elegido.
export async function recuperarIdentidadDemo(token: string, signal?: AbortSignal): Promise<IdentidadSesion> {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') {
    throw new Error('La recuperación demo requiere mocks.')
  }
  const identidad = await apiFetch<IdentidadSesion>('/auth/demo/sesion', {
    method: 'POST',
    body: { token },
    sinSesion: true,
    signal,
  })
  if (!esIdentidadSesion(identidad)) throw new Error('Identidad de sesión inválida.')
  return identidad
}

export function esIdentidadSesion(valor: unknown): valor is IdentidadSesion {
  if (!valor || typeof valor !== 'object') return false
  const { usuario, cliente } = valor as Partial<IdentidadSesion>
  return Boolean(
    usuario && cliente &&
    typeof usuario.usuario_id === 'string' && usuario.usuario_id.trim() &&
    typeof usuario.nombre === 'string' && usuario.nombre.trim() &&
    typeof usuario.email === 'string' && usuario.email.trim() &&
    typeof usuario.cliente_id === 'string' && usuario.cliente_id.trim() &&
    typeof cliente.cliente_id === 'string' && cliente.cliente_id.trim() &&
    typeof cliente.nombre === 'string' && cliente.nombre.trim() &&
    usuario.cliente_id === cliente.cliente_id,
  )
}
