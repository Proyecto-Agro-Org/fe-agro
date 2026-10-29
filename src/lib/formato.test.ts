import { afterEach, describe, expect, it, vi } from 'vitest';
import { cantidad, formatFechaHora, formatRelativo, formatValor } from './formato';

afterEach(() => vi.useRealTimers());

describe('formatValor', () => {
  it('usa coma decimal y conserva la unidad recibida', () => {
    expect(formatValor({ valor: 22.5, unidad: '°C' })).toBe('22,5 °C');
  });
  it('conserva una lectura real de cero', () => {
    expect(formatValor({ valor: 0, unidad: '%' })).toBe('0 %');
  });
  it('distingue una lectura ausente de cero', () => {
    expect(formatValor({ valor: null, unidad: '%' })).toBe('sin datos');
    expect(formatValor({ valor: NaN, unidad: '%' })).toBe('sin datos');
  });
  it('muestra temperaturas negativas', () => {
    expect(formatValor({ valor: -2.5, unidad: '°C' })).toBe('-2,5 °C');
  });
});

describe('formatFechaHora', () => {
  it('muestra fecha y hora local con ceros iniciales', () => {
    const fecha = new Date(2026, 9, 5, 8, 7);
    expect(formatFechaHora(fecha.toISOString())).toBe('05/10/2026 08:07');
  });
  it('maneja fechas inválidas', () => {
    expect(formatFechaHora('fecha inválida')).toBe('sin datos');
    expect(formatRelativo('fecha inválida')).toBe('sin datos');
  });
});

describe('formatRelativo', () => {
  const ahora = new Date('2026-10-27T13:00:00Z');
  it('calcula minutos y horas con un reloj fijo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(ahora);
    expect(formatRelativo('2026-10-27T12:48:00Z')).toMatch(/12.*min/);
    expect(formatRelativo('2026-10-27T11:00:00Z')).toMatch(/2.*h/);
    expect(formatRelativo('2026-10-27T12:59:45Z')).toBe('ahora');
  });
  it('no presenta una fecha futura como pasada', () => {
    vi.useFakeTimers();
    vi.setSystemTime(ahora);
    expect(formatRelativo('2026-10-27T13:12:00Z')).toMatch(/dentro de 12/);
  });
  it('muestra la fecha completa para lecturas antiguas', () => {
    vi.useFakeTimers();
    vi.setSystemTime(ahora);
    const iso = '2026-10-20T13:00:00Z';
    expect(formatRelativo(iso)).toBe(formatFechaHora(iso));
  });
});

describe('cantidad', () => {
  it('usa el singular solo cuando el número es 1', () => {
    expect(cantidad(1, 'sensor', 'sensores')).toBe('1 sensor');
  });
  it('usa el plural para cero y para varios', () => {
    expect(cantidad(0, 'sensor', 'sensores')).toBe('0 sensores');
    expect(cantidad(3, 'alerta activa', 'alertas activas')).toBe('3 alertas activas');
  });
});
