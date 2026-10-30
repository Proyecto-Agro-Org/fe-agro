import type { Usuario } from './dominio'

export type { Usuario } from './dominio'

export interface LoginPedido {
  email: string
  password: string
}

// Compatibilidad con el login actual. A04 deberá completar ambos identificadores
// antes de tratar esta respuesta como un Usuario de dominio.
export type UsuarioLogin = Pick<Usuario, 'nombre' | 'email'> &
  Partial<Pick<Usuario, 'usuario_id' | 'cliente_id'>>

// El frontend solo necesita el token; usuario es opcional.
export interface LoginRespuesta {
  token: string
  usuario?: UsuarioLogin
}
