// Entidades de dominio completas. Los DTO de la API actual se derivan de ellas
// y mantienen opcionales los campos pendientes de incorporar en A04.
// Los nombres son etiquetas; las relaciones usan exclusivamente identificadores.
export interface Cliente {
  cliente_id: string
  nombre: string
}

export interface Usuario {
  usuario_id: string
  nombre: string
  email: string
  cliente_id: Cliente['cliente_id']
}

export interface Campo {
  campo_id: string
  nombre: string
  cliente_id: Cliente['cliente_id']
}

export interface Area {
  area_id: string
  nombre: string
  campo_id: Campo['campo_id']
}

export interface Sensor {
  device_id: string
  nombre: string
  area_id: Area['area_id']
}
