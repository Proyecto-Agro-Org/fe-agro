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