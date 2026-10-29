import { setupServer } from 'msw/node'
import { handlers } from './registro'

export const server = setupServer(...handlers)