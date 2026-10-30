import { createContext, useContext } from 'react'
import type { LoginRespuesta } from '../types/auth'
import type { Cliente, Usuario } from '../types/dominio'

export interface AuthValor {
  token: string | null
  usuario: Usuario | null
  cliente: Cliente | null
  recuperando: boolean
  // true cuando la sesión se cerró por un 401: el login muestra "Tu sesión expiró".
  sesionExpirada: boolean
  iniciarSesion: (respuesta: LoginRespuesta | string) => Promise<void>
  cerrarSesion: () => void
  limpiarAviso: () => void
}

export const AuthContext = createContext<AuthValor | null>(null)

export function useAuth(): AuthValor {
  const valor = useContext(AuthContext)
  if (!valor) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return valor
}
