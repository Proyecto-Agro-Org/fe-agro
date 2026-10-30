import { useSyncExternalStore } from 'react'
import { alternarTema, obtenerTema, suscribirTema } from '../../app/tema'
import estilos from './SelectorTema.module.css'

export function SelectorTema() {
  const tema = useSyncExternalStore(suscribirTema, obtenerTema, () => 'oscuro')
  const claro = tema === 'claro'
  const accion = claro ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'
  return <button
    type="button"
    className={estilos.boton}
    onClick={alternarTema}
    aria-label={accion}
    title={accion}
  >
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {!claro ? <path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z" /> : <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>}
    </svg>
    <span>Tema {tema}</span>
  </button>
}
