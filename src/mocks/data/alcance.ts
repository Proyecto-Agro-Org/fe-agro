import { HttpResponse } from 'msw'
import type { Campo } from '../../types/dominio'
import { CAMPOS, buscarArea, buscarSensor, type SensorDb } from './db'
import { identidadPorToken } from './identidades'

// Validación del mock, independiente de preferencias o parámetros de cliente.
export function campoAutorizado(request: Request): Campo | Response {
  const header = request.headers.get('Authorization') ?? ''
  const identidad = header.startsWith('Bearer ') ? identidadPorToken(header.slice(7)) : undefined
  if (!identidad) return HttpResponse.json({ error: 'Sesión demo inválida' }, { status: 401 })
  const ids = new URL(request.url).searchParams.getAll('campo_id')
  if (ids.length !== 1 || !ids[0].trim()) {
    return HttpResponse.json({ error: 'Se requiere un único campo_id' }, { status: 400 })
  }
  const campo = CAMPOS.find((campo) => campo.campo_id === ids[0] && campo.cliente_id === identidad.cliente.cliente_id)
  return campo ?? HttpResponse.json({ error: 'Campo no disponible' }, { status: 404 })
}

export function sensorAutorizado(request: Request, deviceId: string): SensorDb | Response {
  const campo = campoAutorizado(request)
  if (campo instanceof Response) return campo
  const sensor = buscarSensor(deviceId)
  if (!sensor || buscarArea(sensor.area_id)?.campo_id !== campo.campo_id) {
    return HttpResponse.json({ error: 'No encontramos este sensor' }, { status: 404 })
  }
  return sensor
}
