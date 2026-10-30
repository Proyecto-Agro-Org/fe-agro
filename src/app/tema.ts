export type Tema = 'claro' | 'oscuro'
const CLAVE_TEMA = 'agro_tema'
const oyentes = new Set<() => void>()

export function obtenerTema(): Tema {
  return document.documentElement.dataset.tema === 'claro' ? 'claro' : 'oscuro'
}

export function suscribirTema(oyente: () => void): () => void {
  oyentes.add(oyente)
  return () => { oyentes.delete(oyente) }
}

function aplicarTema(tema: Tema): void {
  document.documentElement.dataset.tema = tema
  oyentes.forEach((oyente) => oyente())
}

export function inicializarTema(): void {
  let tema: Tema = 'oscuro'
  try {
    if (localStorage.getItem(CLAVE_TEMA) === 'claro') tema = 'claro'
  } catch {
    // La preferencia visual nunca impide iniciar la aplicación.
  }
  aplicarTema(tema)
}

export function alternarTema(): void {
  const tema = obtenerTema() === 'oscuro' ? 'claro' : 'oscuro'
  aplicarTema(tema)
  try {
    localStorage.setItem(CLAVE_TEMA, tema)
  } catch {
    // Sin almacenamiento, se mantiene el tema en memoria mientras la pestaña siga abierta.
  }
}
