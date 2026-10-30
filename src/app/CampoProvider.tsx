import { useEffect, useState, type ReactNode } from 'react'
import { obtenerCamposDemo } from '../api/campos'
import { useApi } from '../hooks/useApi'
import { useAuth } from './auth'
import { CampoContext } from './campo'

function clavePreferencia(clienteId: string): string {
  return `agro_campo_preferido:demo:${clienteId}`
}

function leerPreferencia(clienteId: string): string | null {
  try {
    return localStorage.getItem(clavePreferencia(clienteId))
  } catch {
    return null
  }
}

function EstadoCampo({ children }: { children: ReactNode }) {
  const { token, usuario, cliente, recuperando } = useAuth()
  const disponible = import.meta.env.VITE_USE_MOCKS === 'true' &&
    Boolean(token && usuario && cliente && !recuperando)
  const clienteId = cliente?.cliente_id ?? ''
  const [preferido, setPreferido] = useState(() => leerPreferencia(clienteId))
  const { estado, datos, recargar } = useApi(
    (signal) => disponible ? obtenerCamposDemo(clienteId, signal) : Promise.resolve([]),
    [token, usuario?.usuario_id, clienteId, disponible],
  )
  // Durante una carga o error no se expone una selección anterior como válida.
  const campos = disponible && estado === 'exito' ? datos ?? [] : []
  const campoSeleccionado = campos.find((campo) => campo.campo_id === preferido) ?? campos[0] ?? null

  useEffect(() => {
    if (!disponible || estado !== 'exito') return
    try {
      // Preferencia de interfaz: siempre se contrasta con la respuesta vigente.
      if (campoSeleccionado) localStorage.setItem(clavePreferencia(clienteId), campoSeleccionado.campo_id)
      else localStorage.removeItem(clavePreferencia(clienteId))
    } catch {
      // Sin almacenamiento disponible, la selección se mantiene en memoria.
    }
  }, [clienteId, campoSeleccionado, disponible, estado])

  function seleccionarCampo(campoId: string) {
    if (campos.some((campo) => campo.campo_id === campoId)) setPreferido(campoId)
  }

  return <CampoContext.Provider value={{
    campos, campoSeleccionado, estado, disponible, seleccionarCampo, reintentar: recargar,
  }}>{children}</CampoContext.Provider>
}

export function CampoProvider({ children }: { children: ReactNode }) {
  const { token, usuario, cliente } = useAuth()
  // Cambiar de cuenta desmonta el pedido y la selección anteriores inmediatamente.
  const identidad = JSON.stringify([token, usuario?.usuario_id, cliente?.cliente_id])
  return <EstadoCampo key={identidad}>{children}</EstadoCampo>
}
