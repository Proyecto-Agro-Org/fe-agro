import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './auth'

// Sin token se redirige a /login.
export function RutaProtegida() {
  const { token } = useAuth()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

// Con token, /login redirige al Dashboard.
export function RutaSoloPublica() {
  const { token } = useAuth()
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />
}