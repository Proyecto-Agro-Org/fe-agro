import type { Area } from './dominio'

// campo_id será obligatorio cuando se migre el contrato y los datos en A04.
export type AreaApi = Omit<Area, 'campo_id'> & Partial<Pick<Area, 'campo_id'>>

export interface AreaResumen extends AreaApi {
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
