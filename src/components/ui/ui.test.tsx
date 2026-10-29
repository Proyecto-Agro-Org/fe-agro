import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';
import { ErrorBlock } from './ErrorBlock';
import { EmptyState } from './EmptyState';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { DemoBanner } from './DemoBanner';

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('componentes de UI', () => {
  it('Spinner anuncia la carga con role status y su etiqueta', () => {
    render(<Spinner etiqueta="Cargando áreas…" />);
    expect(screen.getByRole('status').textContent).toContain('Cargando áreas…');
  });

  it('ErrorBlock muestra el mensaje como alerta y llama a onReintentar', () => {
    const onReintentar = vi.fn();
    render(<ErrorBlock mensaje="No se pudo cargar" onReintentar={onReintentar} />);
    expect(screen.getByRole('alert').textContent).toContain('No se pudo cargar');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onReintentar).toHaveBeenCalledTimes(1);
  });

  it('EmptyState muestra título y descripción', () => {
    render(<EmptyState titulo="Sin alertas" descripcion="No hay alertas activas" />);
    expect(screen.getByRole('heading', { name: 'Sin alertas' })).toBeTruthy();
    expect(screen.getByText('No hay alertas activas')).toBeTruthy();
  });

  it('StatusBadge muestra el estado con texto', () => {
    render(<StatusBadge estado="desconectado" />);
    expect(screen.getByText('Desconectado')).toBeTruthy();
  });

  it('SeverityBadge muestra la severidad con texto', () => {
    render(<SeverityBadge severidad="alta" />);
    expect(screen.getByText('Alta')).toBeTruthy();
  });

  it('DemoBanner aparece solo con VITE_USE_MOCKS en true', () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true');
    const { unmount } = render(<DemoBanner />);
    expect(screen.getByRole('note').textContent).toContain('Datos de ejemplo');
    unmount();

    vi.stubEnv('VITE_USE_MOCKS', 'false');
    render(<DemoBanner />);
    expect(screen.queryByRole('note')).toBeNull();
  });
});