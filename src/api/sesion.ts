// Guarda el token en sessionStorage: se borra al cerrar la pestaña.
// Es una decisión propuesta (sección 8 de la guía); una cookie httpOnly se evalúa más adelante.
const CLAVE_TOKEN = 'agro_token'
const CLAVE_MODO = 'agro_modo_sesion'

export function leerModoSesion(): string | null {
  try {
    return sessionStorage.getItem(CLAVE_MODO)
  } catch {
    return null
  }
}

type Oyente = () => void

let oyentesExpiracion: Oyente[] = []

export function leerToken(): string | null {
  try {
    return sessionStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token: string, modo?: 'demo' | 'real'): void {
  try {
    if (modo) sessionStorage.setItem(CLAVE_MODO, modo)
    else sessionStorage.removeItem(CLAVE_MODO)
    sessionStorage.setItem(CLAVE_TOKEN, token)
  } catch {
    // Sin almacenamiento disponible: la sesión dura solo mientras la app esté abierta.
    borrarToken()
  }
}

export function borrarToken(): void {
  try {
    sessionStorage.removeItem(CLAVE_TOKEN)
    sessionStorage.removeItem(CLAVE_MODO)
  } catch {
    // Nada que borrar.
  }
}

// El contexto de sesión se suscribe acá para enterarse cuando apiFetch recibe un 401.
export function alExpirarSesion(oyente: Oyente): () => void {
  oyentesExpiracion.push(oyente)
  return () => {
    oyentesExpiracion = oyentesExpiracion.filter((o) => o !== oyente)
  }
}

export function avisarSesionExpirada(): void {
  borrarToken()
  oyentesExpiracion.forEach((oyente) => oyente())
}
