import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './auth'
import { Spinner } from '../components/ui/Spinner'

// Sin token se redirige a /login.
export function RutaProtegida() {
  const { token, recuperando } = useAuth()
  if (recuperando) return <Spinner etiqueta="Recuperando sesión…" />
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

// Con token, /login redirige al Dashboard.
export function RutaSoloPublica() {
  const { token, recuperando } = useAuth()
  if (recuperando) return <Spinner etiqueta="Recuperando sesión…" />
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />
}
