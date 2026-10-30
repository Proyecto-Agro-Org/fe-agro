import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { esIdentidadSesion, recuperarIdentidadDemo } from '../api/login'
import { alExpirarSesion, borrarToken, guardarToken, leerModoSesion, leerToken } from '../api/sesion'
import type { LoginRespuesta } from '../types/auth'
import { AuthContext, type AuthValor } from './auth'

type Sesion = Pick<AuthValor, 'token' | 'usuario' | 'cliente' | 'recuperando'>
const SIN_SESION: Sesion = { token: null, usuario: null, cliente: null, recuperando: false }

function sesionInicial(mocks: boolean): Sesion {
  const modo = leerModoSesion()
  if ((modo === 'demo' && !mocks) || (modo === 'real' && mocks)) {
    borrarToken()
    return SIN_SESION
  }
  const token = leerToken()
  return { ...SIN_SESION, token, recuperando: Boolean(mocks && token) }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const mocks = import.meta.env.VITE_USE_MOCKS === 'true'
  const [sesion, setSesion] = useState<Sesion>(() => sesionInicial(mocks))
  const [sesionExpirada, setSesionExpirada] = useState(false)
  // Invalida respuestas tardías al salir o cambiar de sesión.
  const revision = useRef(0)

  const cerrarSesion = useCallback(() => {
    revision.current += 1
    borrarToken()
    setSesion(SIN_SESION)
  }, [])

  const iniciarSesion = useCallback(async (respuesta: LoginRespuesta | string) => {
    const actual = ++revision.current
    const token = typeof respuesta === 'string' ? respuesta : respuesta.token
    borrarToken()
    setSesion(SIN_SESION)
    const identidad = mocks
      ? await recuperarIdentidadDemo(token)
      : esIdentidadSesion(respuesta) ? respuesta : null
    if (actual !== revision.current) throw new Error('El inicio de sesión fue cancelado.')
    guardarToken(token, mocks ? 'demo' : 'real')
    setSesion({ token, usuario: identidad?.usuario ?? null, cliente: identidad?.cliente ?? null, recuperando: false })
    setSesionExpirada(false)
  }, [mocks])

  const limpiarAviso = useCallback(() => setSesionExpirada(false), [])

  useEffect(() => alExpirarSesion(() => {
    cerrarSesion()
    setSesionExpirada(true)
  }), [cerrarSesion])

  useEffect(
    () => {
      const token = leerToken()
      if (!mocks || !token) return () => { revision.current += 1 }
      const actual = ++revision.current
      const controlador = new AbortController()
      void recuperarIdentidadDemo(token, controlador.signal).then((identidad) => {
        if (controlador.signal.aborted || actual !== revision.current) return
        guardarToken(token, 'demo')
        setSesion({ token, ...identidad, recuperando: false })
      }).catch(() => {
        if (controlador.signal.aborted || actual !== revision.current) return
        cerrarSesion()
        setSesionExpirada(true)
      })
      return () => {
        controlador.abort()
        revision.current += 1
      }
    },
    [mocks, cerrarSesion],
  )

  const valor = useMemo<AuthValor>(
    () => ({ ...sesion, sesionExpirada, iniciarSesion, cerrarSesion, limpiarAviso }),
    [sesion, sesionExpirada, iniciarSesion, cerrarSesion, limpiarAviso],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
