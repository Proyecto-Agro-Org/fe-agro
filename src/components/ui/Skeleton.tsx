import styles from './Skeleton.module.css';

interface SkeletonProps {
  lineas?: number;
  alto?: string;
}

export function Skeleton({ lineas = 1, alto = '1rem' }: SkeletonProps) {
  return (
    <div className={styles.contenedor} aria-hidden="true">
      {Array.from({ length: lineas }, (_, i) => (
        <div key={i} className={styles.linea} style={{ height: alto }} />
      ))}
    </div>
  );
}