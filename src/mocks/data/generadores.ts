import type { Medida, Variable } from '../../types/comun'
import { buscarSensor, ultimaComunicacion } from './db'

/** Datos ilustrativos: no son mediciones reales ni umbrales agronómicos. */
export type { Variable } from '../../types/comun'
export type { Medida } from '../../types/comun'
export type Medicion = { timestamp: string } & Record<Variable, Medida>
export interface Punto {
  timestamp: string
  valor: number | null
}
export interface Serie {
  puntos: Punto[]
  truncado: boolean
}

const PASO_MS = 30 * 60 * 1000
const PUNTOS_MAXIMOS = 1440
const DIA_MS = 24 * 60 * 60 * 1000
const VARIABLES: Record<Variable, { base: number; unidad: string; amplitud: number }> = {
  humedad: { base: 34, unidad: '%', amplitud: 2 },
  temperatura: { base: 22.5, unidad: '°C', amplitud: 1.5 },
  conductividad: { base: 1.2, unidad: 'dS/m', amplitud: 0.1 },
  nitrogeno: { base: 45, unidad: 'mg/kg', amplitud: 2 },
  fosforo: { base: 18, unidad: 'mg/kg', amplitud: 1 },
  potasio: { base: 120, unidad: 'mg/kg', amplitud: 4 },
}

export function ultimaComunicacionSimulada(deviceId: string): string | null {
  const sensor = buscarSensor(deviceId)
  if (!sensor) {
    throw new RangeError(`Sensor de ejemplo inexistente: ${deviceId}`)
  }
  return ultimaComunicacion(sensor)
}

function semilla(texto: string): number {
  let valor = 2166136261
  for (let i = 0; i < texto.length; i++) valor = Math.imul(valor ^ texto.charCodeAt(i), 16777619)
  return (valor >>> 0) / 4294967296
}

function valorSimulado(
  deviceId: string,
  variable: Variable,
  instante: number,
  ultimo: number,
): number | null {
  if (deviceId === 'sensor_013' && variable === 'conductividad') return null
  // Hueco de seis horas dentro del histórico de humedad de SN-012.
  const antiguedad = ultimo - instante
  if (
    deviceId === 'sensor_012' &&
    variable === 'humedad' &&
    antiguedad >= DIA_MS &&
    antiguedad < DIA_MS + 6 * 3600000
  )
    return null
  const config = VARIABLES[variable]
  const base =
    deviceId === 'sensor_014' && variable === 'humedad'
      ? 12
      : deviceId === 'sensor_007' && variable === 'nitrogeno'
        ? 8
        : config.base + (semilla(`${deviceId}:${variable}`) - 0.5) * config.amplitud
  // Anclar el ciclo al último reporte hace coincidir el último punto con la ficha.
  const ciclo = Math.sin(((instante - ultimo) / DIA_MS) * 2 * Math.PI) * config.amplitud
  const ruido =
    instante === ultimo
      ? 0
      : (semilla(`${deviceId}:${variable}:${instante}`) - 0.5) * config.amplitud * 0.2
  return Math.round((base + ciclo + ruido) * 100) / 100
}

export function generarMedicion(deviceId: string): Medicion | null {
  const timestamp = ultimaComunicacionSimulada(deviceId)
  if (timestamp === null) return null
  const ultimo = Date.parse(timestamp)
  const lecturas = Object.fromEntries(
    (Object.keys(VARIABLES) as Variable[]).map((variable) => [
      variable,
      {
        valor: valorSimulado(deviceId, variable, ultimo, ultimo),
        unidad: VARIABLES[variable].unidad,
      },
    ]),
  ) as Record<Variable, Medida>
  return { timestamp, ...lecturas }
}

export function generarSerie(
  deviceId: string,
  variable: Variable,
  desde: string,
  hasta: string,
  limit = 500,
): Serie {
  const timestamp = ultimaComunicacionSimulada(deviceId)
  if (!Object.hasOwn(VARIABLES, variable)) throw new RangeError('Variable desconocida')
  const inicio = Date.parse(desde)
  const fin = Date.parse(hasta)
  if (!Number.isFinite(inicio) || !Number.isFinite(fin) || inicio > fin)
    throw new RangeError('Rango de fechas inválido')
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000)
    throw new RangeError('limit debe ser un entero entre 1 y 1000')
  if (timestamp === null) return { puntos: [], truncado: false }
  const ultimo = Date.parse(timestamp)
  // 1440 muestras en una ventana de 30 días; no crear muestras antes de esa ventana.
  const primero = Math.max(0, Math.ceil((inicio - ultimo) / PASO_MS) + PUNTOS_MAXIMOS - 1)
  const final = Math.min(
    PUNTOS_MAXIMOS - 1,
    Math.floor((fin - ultimo) / PASO_MS) + PUNTOS_MAXIMOS - 1,
  )
  const cantidad = Math.max(0, final - primero + 1)
  const puntos: Punto[] = []
  for (let indice = primero; indice <= final && puntos.length < limit; indice++) {
    const instante = ultimo - (PUNTOS_MAXIMOS - 1 - indice) * PASO_MS
    puntos.push({
      timestamp: new Date(instante).toISOString(),
      valor: valorSimulado(deviceId, variable, instante, ultimo),
    })
  }
  return { puntos, truncado: cantidad > limit }
}
