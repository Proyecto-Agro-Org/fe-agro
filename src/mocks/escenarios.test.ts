import { beforeEach, describe, expect, it } from 'vitest'
import { escenarioPara, interpretarEscenario, reiniciarContadores } from './escenarios'

describe('interpretarEscenario', () => {
  it('sin valor es normal', () => {
    expect(interpretarEscenario(null)).toEqual({ escenario: 'normal', endpoint: null })
  })

  it('lee un escenario para todos los endpoints', () => {
    expect(interpretarEscenario('vacio')).toEqual({ escenario: 'vacio', endpoint: null })
  })

  it('lee un escenario limitado a un endpoint', () => {
    expect(interpretarEscenario('error:area-sensores')).toEqual({
      escenario: 'error',
      endpoint: 'area-sensores',
    })
  })

  it('ignora un escenario desconocido', () => {
    expect(interpretarEscenario('cualquiera')).toEqual({ escenario: 'normal', endpoint: null })
  })

  it('ignora un endpoint desconocido', () => {
    expect(interpretarEscenario('error:inexistente')).toEqual({
      escenario: 'normal',
      endpoint: null,
    })
  })
})

describe('escenarioPara', () => {
  beforeEach(() => {
    reiniciarContadores()
  })

  it('vacío devuelve el aviso de lista vacía', async () => {
    const resultado = await escenarioPara('areas', { escenario: 'vacio', endpoint: null })
    expect(resultado).toEqual({ tipo: 'vacio' })
  })

  it('un escenario limitado a otro endpoint no aplica', async () => {
    const resultado = await escenarioPara('areas', { escenario: 'error', endpoint: 'alertas' })
    expect(resultado).toEqual({ tipo: 'normal' })
  })

  it('error responde 500 con el cuerpo { error }', async () => {
    const resultado = await escenarioPara('areas', { escenario: 'error', endpoint: null })
    expect(resultado.tipo).toBe('respuesta')
    if (resultado.tipo === 'respuesta') {
      expect(resultado.respuesta.status).toBe(500)
      expect(await resultado.respuesta.json()).toEqual({ error: expect.any(String) })
    }
  })

  it('error-reintento: el primer pedido sale bien y los siguientes fallan', async () => {
    const config = { escenario: 'error-reintento', endpoint: null } as const
    expect(await escenarioPara('areas', config)).toEqual({ tipo: 'normal' })
    const segundo = await escenarioPara('areas', config)
    expect(segundo.tipo).toBe('respuesta')
  })
})