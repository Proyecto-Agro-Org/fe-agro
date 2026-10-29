import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { reiniciarContadores } from '../mocks/escenarios'
import { server } from '../mocks/server'

// Una prueba que pide algo sin handler falla: así se detectan mocks que faltan.
beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  reiniciarContadores()
  sessionStorage.clear()
})

afterAll(() => {
  server.close()
})