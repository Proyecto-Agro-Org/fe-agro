import type { Medida } from '../types/comun';

/** Formatos compartidos del frontend. Las fechas se muestran en la zona local. */
export type { Medida as MedidaFormateable } from '../types/comun';

function fechaValida(iso: string): Date | null {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function formatFechaHora(iso: string): string {
  const fecha = fechaValida(iso);
  if (!fecha) return 'sin datos';
  const dos = (valor: number) => String(valor).padStart(2, '0');
  return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}

export function formatRelativo(iso: string): string {
  const fecha = fechaValida(iso);
  if (!fecha) return 'sin datos';
  const segundos = (fecha.getTime() - Date.now()) / 1000;
  if (Math.abs(segundos) < 60) return 'ahora';
  const formato = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto', style: 'short' });
  if (Math.abs(segundos) < 3600) return formato.format(Math.trunc(segundos / 60), 'minute');
  if (Math.abs(segundos) < 86400) return formato.format(Math.trunc(segundos / 3600), 'hour');
  return formatFechaHora(iso);
}

export function formatValor(medida: Medida): string {
  if (medida.valor === null || !Number.isFinite(medida.valor)) return 'sin datos';
  const valor = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(medida.valor);
  return medida.unidad ? `${valor} ${medida.unidad}` : valor;
}

/** Número seguido de su unidad en singular o plural: "1 sensor", "3 sensores". */
export function cantidad(numero: number, singular: string, plural: string): string {
  return `${numero} ${numero === 1 ? singular : plural}`;
}
