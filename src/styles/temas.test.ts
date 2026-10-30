import { describe, expect, it } from 'vitest'
import css from './tokens.css?raw'

function colores(bloque: string): Record<string, string> {
  return Object.fromEntries([...bloque.matchAll(/(--[\w-]+):\s*(#[\da-f]{6})\s*;/gi)]
    .map((coincidencia) => [coincidencia[1], coincidencia[2]]))
}
const oscuro = colores(css.match(/:root\s*\{([\s\S]*?)\}/)![1])
const claro = { ...oscuro, ...colores(css.match(/:root\[data-tema='claro'\]\s*\{([\s\S]*?)\}/)![1]) }

function rgb(hex: string): number[] {
  return [1, 3, 5].map((indice) => parseInt(hex.slice(indice, indice + 2), 16) / 255)
}
function luminancia(color: number[]): number {
  const [r, g, b] = color.map((valor) => valor <= 0.04045 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contraste(frente: number[], fondo: number[]): number {
  const a = luminancia(frente), b = luminancia(fondo)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
function mezcla(frente: number[], fondo: number[], proporcion: number): number[] {
  return frente.map((valor, indice) => valor * proporcion + fondo[indice] * (1 - proporcion))
}

describe.each([['oscuro', oscuro], ['claro', claro]] as const)('contraste de tokens: %s', (_tema, tokens) => {
  it('mantiene texto, texto secundario y enlaces legibles sobre las superficies principales', () => {
    for (const fondo of ['--color-fondo', '--color-superficie', '--color-superficie-2', '--color-menu', '--color-menu-activo']) {
      for (const texto of ['--color-texto', '--color-texto-suave', '--color-acento']) {
        expect(contraste(rgb(tokens[texto]), rgb(tokens[fondo])), `${texto} sobre ${fondo}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('mantiene etiquetas de estado y avisos legibles sobre sus fondos mezclados', () => {
    for (const token of ['--color-ok', '--color-advertencia', '--color-peligro']) {
      const frente = rgb(tokens[token])
      const fondo = mezcla(frente, rgb(tokens['--color-superficie-2']), token === '--color-advertencia' ? 0.18 : 0.15)
      expect(contraste(frente, fondo), token).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('conserva contraste en botones, insignia y símbolos de los pines', () => {
    for (const fondo of ['--color-accion', '--color-accion-hover']) {
      expect(contraste(rgb(tokens['--color-texto']), rgb(tokens[fondo]))).toBeGreaterThanOrEqual(4.5)
    }
    for (const fondo of ['--color-pin-ok', '--color-pin-peligro', '--color-menu-alerta']) {
      expect(contraste(rgb(tokens['--color-texto-sobre-intenso']), rgb(tokens[fondo]))).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('distingue foco y líneas de gráfico sobre las superficies', () => {
    for (const token of ['--color-foco', '--color-acento', '--color-grafico-rejilla']) {
      expect(contraste(rgb(tokens[token]), rgb(tokens['--color-superficie'])), token).toBeGreaterThanOrEqual(3)
    }
  })
})
