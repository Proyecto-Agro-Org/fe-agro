import { createContext, useContext } from 'react'

export interface AuthValor {
  token: string | null
  // true cuando la sesión se cerró por un 401: el login muestra "Tu sesión expiró".
  sesionExpirada: boolean
  iniciarSesion: (token: string) => void
  cerrarSesion: () => void
  limpiarAviso: () => void
}

export const AuthContext = createContext<AuthValor | null>(null)

export function useAuth(): AuthValor {
  const valor = useContext(AuthContext)
  if (!valor) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return valor
}