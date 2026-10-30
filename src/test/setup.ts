import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { reiniciarContadores } from '../mocks/escenarios'
import { server } from '../mocks/server'

// Una prueba que pide algo sin handler falla: así se detectan mocks que faltan.
// MSW 3 intercepta sockets de Node: cada caso debe tener su propio ciclo,
// también cuando el anterior cancela pedidos o simula errores de red.
beforeEach(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  reiniciarContadores()
  sessionStorage.clear()
  server.close()
})
