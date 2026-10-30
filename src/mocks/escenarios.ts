import { delay, HttpResponse } from 'msw'
import { LATENCIA_MS } from './data/db'

export type Escenario = 'normal' | 'lento' | 'vacio' | 'error' | 'offline' | 'error-reintento'

export type ClaveEndpoint =
  | 'login'
  | 'campos'
  | 'dashboard'
  | 'areas'
  | 'area'
  | 'area-sensores'
  | 'sensor'
  | 'historico'
  | 'mapa'
  | 'alertas'

export interface Configuracion {
  escenario: Escenario
  // null = el escenario vale para todos los endpoints
  endpoint: ClaveEndpoint | null
}

export type ResultadoEscenario =
  | { tipo: 'normal' }
  | { tipo: 'vacio' }
  | { tipo: 'respuesta'; respuesta: Response }

const ESCENARIOS: readonly Escenario[] = [
  'normal',
  'lento',
  'vacio',
  'error',
  'offline',
  'error-reintento',
]

const ENDPOINTS: readonly ClaveEndpoint[] = [
  'login',
  'campos',
  'dashboard',
  'areas',
  'area',
  'area-sensores',
  'sensor',
  'historico',
  'mapa',
  'alertas',
]

const NORMAL: Configuracion = { escenario: 'normal', endpoint: null }

// Lee el valor de ?mock=. Ejemplos: "vacio", "error:area-sensores".
export function interpretarEscenario(valor: string | null): Configuracion {
  if (!valor) return NORMAL
  const [nombre, clave] = valor.split(':')
  const escenario = ESCENARIOS.find((e) => e === nombre)
  if (!escenario) return NORMAL
  if (clave === undefined) return { escenario, endpoint: null }
  const endpoint = ENDPOINTS.find((e) => e === clave)
  return endpoint ? { escenario, endpoint } : NORMAL
}

// Se lee una sola vez al cargar la página y se mantiene mientras se navega dentro de la app.
const configuracionActual: Configuracion = interpretarEscenario(
  typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('mock'),
)

const LATENCIA_LENTO_MS = 3000
// En las pruebas no se espera: sería lento sin aportar nada.
const latenciaNormal = import.meta.env.MODE === 'test' ? 0 : LATENCIA_MS

const pedidosPorEndpoint = new Map<ClaveEndpoint, number>()

export function reiniciarContadores(): void {
  pedidosPorEndpoint.clear()
}

function errorServidor(): Response {
  return HttpResponse.json({ error: 'Error simulado del servidor' }, { status: 500 })
}

// Cada handler lo llama primero y decide qué responder según el resultado.
export async function escenarioPara(
  endpoint: ClaveEndpoint,
  configuracion: Configuracion = configuracionActual,
): Promise<ResultadoEscenario> {
  const aplica = configuracion.endpoint === null || configuracion.endpoint === endpoint
  const escenario: Escenario = aplica ? configuracion.escenario : 'normal'

  const numeroPedido = (pedidosPorEndpoint.get(endpoint) ?? 0) + 1
  pedidosPorEndpoint.set(endpoint, numeroPedido)

  await delay(escenario === 'lento' ? LATENCIA_LENTO_MS : latenciaNormal)

  switch (escenario) {
    case 'vacio':
      return { tipo: 'vacio' }
    case 'offline':
      return { tipo: 'respuesta', respuesta: HttpResponse.error() }
    case 'error':
      return { tipo: 'respuesta', respuesta: errorServidor() }
    case 'error-reintento':
      // El primer pedido de cada endpoint sale bien y los siguientes fallan.
      return numeroPedido === 1
        ? { tipo: 'normal' }
        : { tipo: 'respuesta', respuesta: errorServidor() }
    default:
      return { tipo: 'normal' }
  }
}
