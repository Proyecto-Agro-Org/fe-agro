import { beforeEach, afterAll, describe, expect, it, vi } from 'vitest';
import type * as Generadores from './generadores';
import { ahoraMock, buscarSensor, fijarAhoraMock, SENSORES, ultimaComunicacion } from './db';

let generadores: typeof Generadores;
beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-27T13:00:00Z'));
  fijarAhoraMock(Date.now());
  generadores = await import('./generadores');
});
afterAll(() => vi.useRealTimers());
const desde = '2026-09-27T00:00:00Z';
const hasta = '2026-10-27T23:59:59Z';

describe('generarMedicion', () => {
  it('produce lecturas reproducibles con unidades y un reloj común', () => {
    const medicion = generadores.generarMedicion('sensor_001');
    expect(medicion).toEqual(generadores.generarMedicion('sensor_001'));
    expect(medicion?.timestamp).toBe('2026-10-27T12:57:00.000Z');
    expect(medicion?.temperatura.unidad).toBe('°C');
    expect(medicion?.nitrogeno.unidad).toBe('mg/kg');
    vi.advanceTimersByTime(60000);
    expect(generadores.generarMedicion('sensor_001')).toEqual(medicion);
  });
  it('coincide con db.ts para todos los sensores y conserva la hora de referencia', () => {
    for (const sensor of SENSORES) {
      expect(generadores.generarMedicion(sensor.device_id)?.timestamp ?? null)
        .toBe(ultimaComunicacion(sensor));
    }
    expect(ahoraMock()).toBe(Date.parse('2026-10-27T13:00:00Z'));
    fijarAhoraMock(Date.parse('2026-10-28T13:00:00Z'));
    const sensor = buscarSensor('sensor_001')!;
    const medicion = generadores.generarMedicion(sensor.device_id)!;
    expect(medicion.timestamp).toBe('2026-10-28T12:57:00.000Z');
    expect(medicion.timestamp).toBe(ultimaComunicacion(sensor));
    const serie = generadores.generarSerie(sensor.device_id, 'humedad', medicion.timestamp, medicion.timestamp);
    expect(serie.puntos).toEqual([{ timestamp: medicion.timestamp, valor: medicion.humedad.valor }]);
  });
  it('respeta cambios en la base compartida sin una tabla propia de sensores', () => {
    const sensor = buscarSensor('sensor_001')!;
    const anterior = sensor.minutos_sin_comunicar;
    try {
      sensor.minutos_sin_comunicar = 95;
      expect(generadores.generarMedicion(sensor.device_id)?.timestamp).toBe(ultimaComunicacion(sensor));
      sensor.minutos_sin_comunicar = null;
      expect(generadores.generarMedicion(sensor.device_id)).toBeNull();
      expect(generadores.generarSerie(sensor.device_id, 'humedad', desde, hasta).puntos).toEqual([]);
    } finally {
      sensor.minutos_sin_comunicar = anterior;
    }
  });
  it('conserva los casos especiales sin convertir ausencias en cero', () => {
    expect(generadores.generarMedicion('sensor_010')).toBeNull();
    expect(generadores.generarMedicion('sensor_014')?.humedad.valor).toBe(12);
    expect(generadores.generarMedicion('sensor_007')?.nitrogeno.valor).toBe(8);
    expect(generadores.generarMedicion('sensor_013')?.conductividad.valor).toBeNull();
  });
  it('rechaza sensores inexistentes', () => {
    expect(() => generadores.generarMedicion('sensor_999')).toThrow(RangeError);
  });
});

describe('generarSerie', () => {
  it('limita resultados, ordena por fecha y avisa el truncamiento', () => {
    const serie = generadores.generarSerie('sensor_001', 'humedad', desde, hasta);
    expect(serie.puntos).toHaveLength(500);
    expect(serie.truncado).toBe(true);
    for (let i = 1; i < serie.puntos.length; i++) {
      expect(Date.parse(serie.puntos[i].timestamp) - Date.parse(serie.puntos[i - 1].timestamp)).toBe(1800000);
    }
  });
  it('mantiene los mismos valores al cambiar el filtro temporal', () => {
    const fin = '2026-10-27T13:00:00Z';
    const amplia = generadores.generarSerie('sensor_001', 'humedad', '2026-10-25T00:00:00Z', fin);
    const corta = generadores.generarSerie('sensor_001', 'humedad', '2026-10-26T00:00:00Z', fin);
    expect(corta.puntos).toEqual(amplia.puntos.filter(p => p.timestamp >= '2026-10-26T00:00:00Z'));
  });
  it.each(['sensor_005', 'sensor_008', 'sensor_015'])('termina en la última comunicación de %s', deviceId => {
    const medicion = generadores.generarMedicion(deviceId)!;
    const serie = generadores.generarSerie(deviceId, 'humedad', '2026-10-20T00:00:00Z', hasta, 1000);
    expect(serie.puntos.at(-1)).toEqual({ timestamp: medicion.timestamp, valor: medicion.humedad.valor });
    expect(serie.truncado).toBe(false);
  });
  it('devuelve vacío sin mediciones o fuera de la ventana disponible', () => {
    expect(generadores.generarSerie('sensor_010', 'humedad', desde, hasta).puntos).toEqual([]);
    expect(generadores.generarSerie('sensor_001', 'humedad', '2020-01-01', '2020-02-01')).toEqual({ puntos: [], truncado: false });
    expect(generadores.generarSerie('sensor_001', 'humedad', '2030-01-01', '2030-02-01').puntos).toEqual([]);
  });
  it('representa el hueco de seis horas con null', () => {
    const serie = generadores.generarSerie('sensor_012', 'humedad', '2026-10-25T00:00:00Z', hasta);
    expect(serie.puntos.filter(p => p.valor === null)).toHaveLength(12);
  });
  it('no marca truncamiento si el límite coincide con la cantidad disponible', () => {
    const ultimo = generadores.ultimaComunicacionSimulada('sensor_001')!;
    expect(generadores.generarSerie('sensor_001', 'humedad', ultimo, ultimo, 1)).toEqual({
      puntos: [{ timestamp: ultimo, valor: generadores.generarMedicion('sensor_001')!.humedad.valor }], truncado: false,
    });
  });
  it('valida fechas, orden del rango, variable y límite', () => {
    expect(() => generadores.generarSerie('sensor_001', 'humedad', 'mal', hasta)).toThrow(RangeError);
    expect(() => generadores.generarSerie('sensor_001', 'humedad', hasta, desde)).toThrow(RangeError);
    for (const limite of [0, -1, 1.5, 1001]) {
      expect(() => generadores.generarSerie('sensor_001', 'humedad', desde, hasta, limite)).toThrow(RangeError);
    }
    expect(() => generadores.generarSerie('sensor_001', 'otra' as Generadores.Variable, desde, hasta)).toThrow(RangeError);
  });
});
