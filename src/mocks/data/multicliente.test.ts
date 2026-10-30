import { describe, expect, it } from 'vitest'
import {
  ALERTAS,
  AREAS,
  CAMPOS,
  CLIENTES,
  SENSORES,
  USUARIOS,
  areasDeCampo,
  camposDeCliente,
  sensoresDeArea,
} from './db'

describe('datos simulados multicliente', () => {
  it('tiene al menos dos clientes, dos campos por cliente y usuarios de distintos clientes', () => {
    expect(CLIENTES.length).toBeGreaterThanOrEqual(2)
    expect(USUARIOS.length).toBeGreaterThanOrEqual(2)
    expect(new Set(USUARIOS.map((usuario) => usuario.cliente_id)).size).toBeGreaterThanOrEqual(2)
    for (const cliente of CLIENTES) {
      expect(camposDeCliente(cliente.cliente_id).length).toBeGreaterThanOrEqual(2)
      expect(USUARIOS.some((usuario) => usuario.cliente_id === cliente.cliente_id)).toBe(true)
    }
  })

  it('todas las entidades tienen identificadores únicos, no vacíos y sin colisiones entre campos y áreas', () => {
    const ids = [
      ...CLIENTES.map((cliente) => cliente.cliente_id),
      ...USUARIOS.map((usuario) => usuario.usuario_id),
      ...CAMPOS.map((campo) => campo.campo_id),
      ...AREAS.map((area) => area.area_id),
      ...SENSORES.map((sensor) => sensor.device_id),
      ...ALERTAS.map((alerta) => alerta.alerta_id),
    ]
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9_]+$/)
  })

  it('no tiene usuarios, campos, áreas, sensores ni alertas con referencias inexistentes', () => {
    const clientes = new Set(CLIENTES.map((cliente) => cliente.cliente_id))
    const campos = new Set(CAMPOS.map((campo) => campo.campo_id))
    const areas = new Set(AREAS.map((area) => area.area_id))
    const sensores = new Set(SENSORES.map((sensor) => sensor.device_id))
    for (const usuario of USUARIOS) expect(clientes.has(usuario.cliente_id)).toBe(true)
    for (const campo of CAMPOS) expect(clientes.has(campo.cliente_id)).toBe(true)
    for (const area of AREAS) expect(campos.has(area.campo_id)).toBe(true)
    for (const sensor of SENSORES) expect(areas.has(sensor.area_id)).toBe(true)
    for (const alerta of ALERTAS) expect(sensores.has(alerta.device_id)).toBe(true)
  })

  it('permite recorrer cada jerarquía sin duplicar ni compartir sensores entre clientes', () => {
    const recorridos: string[] = []
    for (const cliente of CLIENTES) {
      const campos = camposDeCliente(cliente.cliente_id)
      const areas = campos.flatMap((campo) => areasDeCampo(campo.campo_id))
      const sensores = areas.flatMap((area) => sensoresDeArea(area.area_id))
      expect(areas.length).toBeGreaterThan(0)
      expect(sensores.length).toBeGreaterThan(0)
      recorridos.push(...sensores.map((sensor) => sensor.device_id))
    }
    expect(recorridos.toSorted()).toEqual(SENSORES.map((sensor) => sensor.device_id).toSorted())
    expect(new Set(recorridos).size).toBe(recorridos.length)
  })

  it('consulta por identificadores y conserva los registros compartidos como única fuente de datos', () => {
    expect(camposDeCliente('cliente_horizonte_verde').map((campo) => campo.campo_id))
      .toEqual(['campo_el_molino', 'campo_la_esperanza'])
    expect(areasDeCampo('campo_el_molino').map((area) => area.area_id))
      .toEqual(['campo_norte', 'campo_oeste'])
    expect(sensoresDeArea('campo_norte').map((sensor) => sensor.device_id))
      .toEqual(['sensor_011', 'sensor_012', 'sensor_013', 'sensor_014', 'sensor_015'])
    expect(camposDeCliente('cliente_horizonte_verde')[0]).toBe(CAMPOS[0])
    expect(areasDeCampo('campo_el_molino')[0]).toBe(AREAS[0])
    expect(sensoresDeArea('campo_norte')[0]).toBe(SENSORES[10])
    expect(camposDeCliente('Agropecuaria Horizonte Verde')).toEqual([])
    expect(areasDeCampo('El Molino')).toEqual([])
    expect(sensoresDeArea('Área Norte')).toEqual([])
  })

  it('distingue campos vacíos de IDs desconocidos y no agrega entidades de respaldo', () => {
    expect(CAMPOS.some((campo) => campo.campo_id === 'campo_la_esperanza')).toBe(true)
    expect(areasDeCampo('campo_la_esperanza')).toEqual([])
    expect(areasDeCampo('campo_los_olivos')).toEqual([])
    expect(camposDeCliente('cliente_inexistente')).toEqual([])
    expect(areasDeCampo('campo_inexistente')).toEqual([])
    expect(sensoresDeArea('area_inexistente')).toEqual([])
  })
})
