import type { Cliente, Usuario } from './dominio'

export type { Usuario } from './dominio'

export interface LoginPedido {
  email: string
  password: string
}

// Compatibilidad con el backend actual. Los mocks ya completan los IDs;
// el contrato real todavía permite respuestas sin identidad completa.
export type UsuarioLogin = Pick<Usuario, 'nombre' | 'email'> &
  Partial<Pick<Usuario, 'usuario_id' | 'cliente_id'>>

// El contrato real conserva token como único campo obligatorio.
export interface LoginRespuesta {
  token: string
  usuario?: UsuarioLogin
  cliente?: Cliente
}

export interface IdentidadSesion {
  usuario: Usuario
  cliente: Cliente
}
