import type { RequestHandler } from 'msw'

// Registra solo todos los archivos de mocks/handlers/. Cada Issue agrega el suyo
// y nadie tiene que editar un archivo común.
const modulos = import.meta.glob<{ default: RequestHandler[] }>('./handlers/*.ts', {
  eager: true,
})

export const handlers: RequestHandler[] = Object.values(modulos).flatMap(
  (modulo) => modulo.default,
)