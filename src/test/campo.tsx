import type { ReactNode } from 'react'
import { CampoContext } from '../app/campo'
import { CAMPOS } from '../mocks/data/db'

// Las pruebas unitarias de pantalla fijan un campo; las de integración usan el provider real.
export function CampoPrueba({ children, campoId = 'campo_el_molino' }: { children: ReactNode; campoId?: string }) {
  const campo = CAMPOS.find((campo) => campo.campo_id === campoId)!
  return <CampoContext.Provider value={{
    campos: CAMPOS.filter((opcion) => opcion.cliente_id === campo.cliente_id),
    campoSeleccionado: campo, estado: 'exito', disponible: true,
    seleccionarCampo: () => undefined, reintentar: () => undefined,
  }}>{children}</CampoContext.Provider>
}
