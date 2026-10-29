import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../app/AuthContext'

// Dibuja unas rutas (un <Routes>) dentro de un router en memoria y del contexto de sesión.
export function renderConRutas(rutas: ReactElement, ruta = '/') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[ruta]}>{rutas}</MemoryRouter>
    </AuthProvider>,
  )
}