import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import html from '../../index.html?raw'
import { alternarTema, inicializarTema, obtenerTema, suscribirTema } from './tema'

beforeEach(() => { localStorage.clear(); inicializarTema() })
afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); inicializarTema() })

describe('preferencia centralizada de tema', () => {
  it('usa oscuro sin preferencia guardada', () => {
    expect(obtenerTema()).toBe('oscuro')
    expect(document.documentElement.dataset.tema).toBe('oscuro')
  })

  it('alterna en ambos sentidos y recupera la preferencia al iniciar de nuevo', () => {
    alternarTema()
    expect(obtenerTema()).toBe('claro')
    expect(localStorage.getItem('agro_tema')).toBe('claro')
    document.documentElement.dataset.tema = 'oscuro'
    inicializarTema()
    expect(obtenerTema()).toBe('claro')
    alternarTema()
    expect(localStorage.getItem('agro_tema')).toBe('oscuro')
    inicializarTema()
    expect(obtenerTema()).toBe('oscuro')
  })

  it.each(['light', 'dark', 'CLARO', '', '{"tema":"claro"}'])('descarta una preferencia inválida: %s', (valor) => {
    localStorage.setItem('agro_tema', valor)
    document.documentElement.dataset.tema = 'claro'
    inicializarTema()
    expect(obtenerTema()).toBe('oscuro')
  })

  it('usa oscuro si no puede leer el almacenamiento', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('No disponible') })
    document.documentElement.dataset.tema = 'claro'
    expect(() => inicializarTema()).not.toThrow()
    expect(obtenerTema()).toBe('oscuro')
  })

  it('permite cambiar en memoria si no se puede guardar', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('No disponible') })
    expect(() => alternarTema()).not.toThrow()
    expect(obtenerTema()).toBe('claro')
    inicializarTema()
    expect(obtenerTema()).toBe('oscuro')
  })

  it('notifica a todos los controles activos y permite cancelar la suscripción', () => {
    const oyente = vi.fn()
    const cancelar = suscribirTema(oyente)
    alternarTema()
    expect(oyente).toHaveBeenCalledOnce()
    cancelar()
    alternarTema()
    expect(oyente).toHaveBeenCalledOnce()
  })

  it.each(['claro', 'oscuro', 'valor-invalido'])('el arranque previo a React aplica la misma preferencia: %s', (tema) => {
    localStorage.setItem('agro_tema', tema)
    const script = html.match(/<script id="tema-inicial">([\s\S]*?)<\/script>/)![1]
    // Ejecuta el código real del HTML, sin copiar la lógica de inicialización.
    new Function(script)()
    const inicial = document.documentElement.dataset.tema
    inicializarTema()
    expect(obtenerTema()).toBe(inicial)
    expect(inicial).toBe(tema === 'claro' ? 'claro' : 'oscuro')
  })
})
