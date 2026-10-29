// Una medición: un dato ausente viaja como valor null (nunca 0).
export interface Medida {
  valor: number | null
  unidad: string
}

export interface Ubicacion {
  lat: number
  lon: number
}

export type Estado = 'conectado' | 'desconectado'

export type Severidad = 'alta' | 'media' | 'baja'

// Error que lanza apiFetch. estado es el código HTTP, o null si no hubo conexión.
export class ErrorApi extends Error {
  estado: number | null

  constructor(mensaje: string, estado: number | null) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
  }
}
export type Variable =
  'humedad' | 'temperatura' | 'conductividad' | 'nitrogeno' | 'fosforo' | 'potasio'
