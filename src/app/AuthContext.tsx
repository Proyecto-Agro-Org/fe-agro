import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { alExpirarSesion, borrarToken, guardarToken, leerToken } from '../api/sesion'
import { AuthContext, type AuthValor } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => leerToken())
  const [sesionExpirada, setSesionExpirada] = useState(false)

  const iniciarSesion = useCallback((nuevoToken: string) => {
    guardarToken(nuevoToken)
    setToken(nuevoToken)
    setSesionExpirada(false)
  }, [])

  const cerrarSesion = useCallback(() => {
    borrarToken()
    setToken(null)
  }, [])

  const limpiarAviso = useCallback(() => setSesionExpirada(false), [])

  // Cuando apiFetch recibe un 401, se cierra la sesión y se avisa al login.
  useEffect(
    () =>
      alExpirarSesion(() => {
        setToken(null)
        setSesionExpirada(true)
      }),
    [],
  )

  const valor = useMemo<AuthValor>(
    () => ({ token, sesionExpirada, iniciarSesion, cerrarSesion, limpiarAviso }),
    [token, sesionExpirada, iniciarSesion, cerrarSesion, limpiarAviso],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}