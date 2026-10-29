export interface LoginPedido {
  email: string
  password: string
}

export interface Usuario {
  nombre: string
  email: string
}

// El frontend solo necesita el token; usuario es opcional.
export interface LoginRespuesta {
  token: string
  usuario?: Usuario
}