import styles from './Spinner.module.css';

interface SpinnerProps {
  etiqueta?: string;
}

export function Spinner({ etiqueta = 'Cargando…' }: SpinnerProps) {
  return (
    <div className={styles.contenedor} role="status">
      <span className={styles.rueda} aria-hidden="true" />
      <span>{etiqueta}</span>
    </div>
  );
}