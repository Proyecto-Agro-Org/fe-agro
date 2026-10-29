import type { Alerta, EstadoAlerta, TipoAlerta } from '../../types/alertas'
import type { Estado, Severidad, Ubicacion } from '../../types/comun'

// Un sensor se considera desconectado si pasaron más de estos minutos sin comunicar.
// Está en un solo lugar porque la frecuencia real de publicación está pendiente de confirmar.
export const UMBRAL_DESCONECTADO_MIN = 30

// Latencia simulada en cada respuesta, para que se vean los estados de carga.
export const LATENCIA_MS = 400

// Hora de referencia: se fija una sola vez al iniciar, no en cada pedido,
// así una medición no cambia de fecha si no hay una lectura nueva.
let ahoraReferencia = Date.now()

export function ahoraMock(): number {
  return ahoraReferencia
}

// Solo para las pruebas.
export function fijarAhoraMock(milisegundos: number): void {
  ahoraReferencia = milisegundos
}

export function haceMinutos(minutos: number): string {
  return new Date(ahoraMock() - minutos * 60_000).toISOString()
}

export interface AreaDb {
  area_id: string
  nombre: string
}

export interface SensorDb {
  device_id: string
  nombre: string
  area_id: string
  // null = el sensor nunca comunicó
  minutos_sin_comunicar: number | null
  ubicacion: Ubicacion | null
}

export interface AlertaDb {
  alerta_id: string
  device_id: string
  tipo: TipoAlerta
  severidad: Severidad
  descripcion: string
  estado: EstadoAlerta
  creada_hace_min: number
}

export const AREAS: AreaDb[] = [
  { area_id: 'campo_norte', nombre: 'Área Norte' },
  { area_id: 'campo_sur', nombre: 'Área Sur' },
  { area_id: 'campo_este', nombre: 'Área Este' },
  { area_id: 'campo_oeste', nombre: 'Área Oeste' },
]

export const SENSORES: SensorDb[] = [
  { device_id: 'sensor_001', nombre: 'SN-001', area_id: 'campo_oeste', minutos_sin_comunicar: 3, ubicacion: { lat: -34.6, lon: -58.46 } },
  { device_id: 'sensor_002', nombre: 'SN-002', area_id: 'campo_oeste', minutos_sin_comunicar: 7, ubicacion: null },
  { device_id: 'sensor_003', nombre: 'SN-003', area_id: 'campo_oeste', minutos_sin_comunicar: 12, ubicacion: { lat: -34.6012, lon: -58.4585 } },
  { device_id: 'sensor_004', nombre: 'SN-004', area_id: 'campo_este', minutos_sin_comunicar: 5, ubicacion: { lat: -34.6, lon: -58.38 } },
  { device_id: 'sensor_005', nombre: 'SN-005', area_id: 'campo_este', minutos_sin_comunicar: 2880, ubicacion: { lat: -34.6015, lon: -58.379 } },
  { device_id: 'sensor_006', nombre: 'SN-006', area_id: 'campo_este', minutos_sin_comunicar: 18, ubicacion: { lat: -34.599, lon: -58.3812 } },
  { device_id: 'sensor_007', nombre: 'SN-007', area_id: 'campo_sur', minutos_sin_comunicar: 9, ubicacion: { lat: -34.65, lon: -58.42 } },
  { device_id: 'sensor_008', nombre: 'SN-008', area_id: 'campo_sur', minutos_sin_comunicar: 95, ubicacion: { lat: -34.6512, lon: -58.4188 } },
  { device_id: 'sensor_009', nombre: 'SN-009', area_id: 'campo_sur', minutos_sin_comunicar: 1, ubicacion: { lat: -34.649, lon: -58.4215 } },
  { device_id: 'sensor_010', nombre: 'SN-010', area_id: 'campo_sur', minutos_sin_comunicar: null, ubicacion: { lat: -34.6505, lon: -58.417 } },
  { device_id: 'sensor_011', nombre: 'SN-011', area_id: 'campo_norte', minutos_sin_comunicar: 4, ubicacion: { lat: -34.55, lon: -58.42 } },
  { device_id: 'sensor_012', nombre: 'SN-012', area_id: 'campo_norte', minutos_sin_comunicar: 22, ubicacion: { lat: -34.551, lon: -58.4185 } },
  { device_id: 'sensor_013', nombre: 'SN-013', area_id: 'campo_norte', minutos_sin_comunicar: 6, ubicacion: { lat: -34.5495, lon: -58.4212 } },
  { device_id: 'sensor_014', nombre: 'SN-014', area_id: 'campo_norte', minutos_sin_comunicar: 2, ubicacion: { lat: -34.5503, lon: -58.417 } },
  { device_id: 'sensor_015', nombre: 'SN-015', area_id: 'campo_norte', minutos_sin_comunicar: 45, ubicacion: { lat: -34.552, lon: -58.4195 } },
]

export const ALERTAS: AlertaDb[] = [
  { alerta_id: 'alerta_001', device_id: 'sensor_015', tipo: 'tecnica', severidad: 'alta', descripcion: 'Sin comunicación hace más de 30 minutos', estado: 'activa', creada_hace_min: 15 },
  { alerta_id: 'alerta_002', device_id: 'sensor_008', tipo: 'tecnica', severidad: 'alta', descripcion: 'Sin comunicación hace más de 30 minutos', estado: 'activa', creada_hace_min: 65 },
  { alerta_id: 'alerta_003', device_id: 'sensor_014', tipo: 'agronomica', severidad: 'media', descripcion: 'Humedad por debajo del rango esperado', estado: 'activa', creada_hace_min: 25 },
  { alerta_id: 'alerta_004', device_id: 'sensor_007', tipo: 'agronomica', severidad: 'baja', descripcion: 'Nitrógeno en el límite inferior', estado: 'activa', creada_hace_min: 50 },
  { alerta_id: 'alerta_005', device_id: 'sensor_005', tipo: 'tecnica', severidad: 'alta', descripcion: 'Sin comunicación hace más de 30 minutos', estado: 'activa', creada_hace_min: 2850 },
  { alerta_id: 'alerta_006', device_id: 'sensor_011', tipo: 'agronomica', severidad: 'media', descripcion: 'Conductividad fuera de rango', estado: 'resuelta', creada_hace_min: 300 },
]

export function buscarArea(areaId: string): AreaDb | undefined {
  return AREAS.find((area) => area.area_id === areaId)
}

export function buscarSensor(deviceId: string): SensorDb | undefined {
  return SENSORES.find((sensor) => sensor.device_id === deviceId)
}

export function sensoresDeArea(areaId: string): SensorDb[] {
  return SENSORES.filter((sensor) => sensor.area_id === areaId)
}

// Un sensor que nunca comunicó cuenta como desconectado.
export function estadoSensor(sensor: SensorDb): Estado {
  const minutos = sensor.minutos_sin_comunicar
  return minutos !== null && minutos <= UMBRAL_DESCONECTADO_MIN ? 'conectado' : 'desconectado'
}

export function ultimaComunicacion(sensor: SensorDb): string | null {
  return sensor.minutos_sin_comunicar === null ? null : haceMinutos(sensor.minutos_sin_comunicar)
}

export function alertasActivas(areaId?: string): AlertaDb[] {
  return ALERTAS.filter((alerta) => {
    if (alerta.estado !== 'activa') return false
    if (areaId === undefined) return true
    return buscarSensor(alerta.device_id)?.area_id === areaId
  })
}

// Convierte una alerta de la base al formato que responde la API (sección 10.9).
export function alertaParaApi(alerta: AlertaDb): Alerta {
  const sensor = buscarSensor(alerta.device_id)
  const area = sensor ? buscarArea(sensor.area_id) : undefined
  return {
    alerta_id: alerta.alerta_id,
    device_id: alerta.device_id,
    sensor_nombre: sensor?.nombre ?? alerta.device_id,
    area_id: area?.area_id ?? '',
    area_nombre: area?.nombre ?? '',
    tipo: alerta.tipo,
    severidad: alerta.severidad,
    descripcion: alerta.descripcion,
    timestamp: haceMinutos(alerta.creada_hace_min),
    estado: alerta.estado,
  }
}