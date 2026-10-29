import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  icono?: ReactNode;
}

export function EmptyState({ titulo, descripcion, icono }: EmptyStateProps) {
  return (
    <div className={styles.vacio}>
      {icono && (
        <span className={styles.icono} aria-hidden="true">
          {icono}
        </span>
      )}
      <h2 className={styles.titulo}>{titulo}</h2>
      {descripcion && <p className={styles.descripcion}>{descripcion}</p>}
    </div>
  );
}