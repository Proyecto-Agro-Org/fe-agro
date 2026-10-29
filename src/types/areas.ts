export interface AreaResumen {
  area_id: string
  nombre: string
  sensores: number
  conectados: number
  desconectados: number
  alertas_activas: number
  // null si ningún sensor del área reportó nunca
  ultima_actualizacion: string | null
}

export interface AreasRespuesta {
  areas: AreaResumen[]
}