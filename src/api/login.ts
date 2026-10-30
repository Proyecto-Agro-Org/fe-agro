import type { LoginPedido, LoginRespuesta } from '../types/auth'
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
