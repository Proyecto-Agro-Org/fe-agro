import { http, passthrough } from 'msw'
import { setupWorker } from 'msw/browser'
import { handlers } from './registro'

// Misma base que usa api/client.ts.
const RUTA_API = new URL(import.meta.env.VITE_API_BASE_URL ?? '/api/v1', window.location.href)
  .pathname

function esPedidoApi(url: string): boolean {
  return new URL(url, window.location.href).pathname.startsWith(RUTA_API)
}

// Los handlers usan rutas como '*/alertas' o '*/sensores/:deviceId', que también coinciden
// con las páginas de la app. Al recargar una de esas páginas, el worker respondía el JSON
// del mock en lugar de la app. Todo lo que no esté bajo la base de la API pasa de largo.
const soloApi = http.all(({ request }) => !esPedidoApi(request.url), () => passthrough())

const worker = setupWorker(soloApi, ...handlers)

// Si el worker no confirma en este tiempo, el pedido sale igual para no colgar la app.
const ESPERA_MAXIMA_MS = 1000

let activacionEnCurso: Promise<void> | null = null

// El navegador apaga el service worker cuando la pestaña o el panel queda un rato sin uso
// (los timers del keepalive de MSW se frenan). Al volver a arrancar, el worker olvida qué
// pestañas tenían los mocks activos y deja pasar los pedidos a la API, que terminan en 404.
// Por eso, antes de cada pedido a la API se le vuelve a avisar que esta pestaña usa mocks
// (el mismo mensaje que manda worker.start() al cargar) y se espera su confirmación.
function activarPestania(): Promise<void> {
  const controlador = navigator.serviceWorker.controller
  if (!controlador) return Promise.resolve()

  // Los pedidos simultáneos comparten una misma activación.
  activacionEnCurso ??= new Promise<void>((resolver) => {
    const terminar = () => {
      clearTimeout(limite)
      navigator.serviceWorker.removeEventListener('message', alRecibir)
      activacionEnCurso = null
      resolver()
    }
    const alRecibir = (evento: MessageEvent<{ type?: string } | null>) => {
      if (evento.data?.type !== 'MOCKING_ENABLED') return
      // El worker queda esperando una respuesta por este puerto: se la da para que no quede colgado.
      evento.ports[0]?.postMessage(null)
      terminar()
    }
    const limite = setTimeout(terminar, ESPERA_MAXIMA_MS)
    navigator.serviceWorker.addEventListener('message', alRecibir)
    controlador.postMessage('MOCK_ACTIVATE')
  })
  return activacionEnCurso
}

export async function iniciarMocks(): Promise<void> {
  await worker.start({
    onUnhandledFrame({ frame, defaults }) {
      // Los archivos de la app pasan de largo; un pedido a la API sin handler avisa.
      if (frame.protocol !== 'http') return
      const { request } = frame.data as { request: Request }
      if (new URL(request.url).pathname.startsWith('/api/')) defaults.warn()
    },
  })

  const fetchOriginal = window.fetch.bind(window)
  window.fetch = async (entrada, opciones) => {
    const url = entrada instanceof Request ? entrada.url : String(entrada)
    if (!esPedidoApi(url)) return fetchOriginal(entrada, opciones)

    // Copia por si hay que repetirlo: un Request con cuerpo se consume al enviarlo.
    const copia = entrada instanceof Request ? entrada.clone() : entrada
    await activarPestania()
    const respuesta = await fetchOriginal(entrada, opciones)
    if (respondioElMock(respuesta)) return respuesta

    // Si el worker se apagó justo entre la activación y el pedido, el pedido llegó a Vite.
    // Se activa de nuevo y se repite una vez.
    await activarPestania()
    return fetchOriginal(copia, opciones)
  }
}

// Todos los handlers responden JSON; un pedido que no pasó por el mock vuelve de Vite como
// un 404 vacío, sin ese tipo de contenido.
function respondioElMock(respuesta: Response): boolean {
  return respuesta.headers.get('content-type')?.includes('application/json') ?? false
}
