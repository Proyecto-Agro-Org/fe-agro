import type { IdentidadSesion, LoginRespuesta } from '../../types/auth'
import { CLIENTES, USUARIOS } from './db'

// Tokens y claves públicos de demostración. No representan autenticación real.
export const PASSWORD_DEMO = 'demo1234'
export const EMAIL_DEMO = 'demo@agro.com'
const IDENTIDADES = [
  { usuario_id: 'usuario_ana_rios', token: 'token-demo' },
  { usuario_id: 'usuario_lucia_vega', token: 'token-demo-lucia' },
]

export function identidadPorToken(token: string): IdentidadSesion | undefined {
  const registro = IDENTIDADES.find((identidad) => identidad.token === token)
  const usuario = USUARIOS.find((usuario) => usuario.usuario_id === registro?.usuario_id)
  const cliente = CLIENTES.find((cliente) => cliente.cliente_id === usuario?.cliente_id)
  return usuario && cliente ? { usuario, cliente } : undefined
}

export function sesionPorEmail(email: string): LoginRespuesta | undefined {
  const usuario = USUARIOS.find((usuario) => usuario.email === email)
  const registro = email === EMAIL_DEMO
    ? IDENTIDADES[0]
    : IDENTIDADES.find((identidad) => identidad.usuario_id === usuario?.usuario_id)
  const identidad = registro && identidadPorToken(registro.token)
  return identidad ? { token: registro!.token, ...identidad } : undefined
}
