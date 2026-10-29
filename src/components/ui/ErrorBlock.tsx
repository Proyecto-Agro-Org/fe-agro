import styles from './ErrorBlock.module.css';

interface ErrorBlockProps {
  mensaje: string;
  onReintentar: () => void;
}

export function ErrorBlock({ mensaje, onReintentar }: ErrorBlockProps) {
  return (
    <div className={styles.bloque} role="alert">
      <p className={styles.mensaje}>{mensaje}</p>
      <button type="button" className={styles.boton} onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  );
}