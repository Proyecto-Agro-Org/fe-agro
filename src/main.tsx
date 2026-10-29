import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import App from './App'

async function iniciar() {
  // Con VITE_USE_MOCKS en true, MSW responde los pedidos a la API antes de dibujar la app.
  // El import dinámico evita incluir los mocks cuando están apagados.
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { iniciarMocks } = await import('./mocks/browser')
    await iniciarMocks()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

iniciar()