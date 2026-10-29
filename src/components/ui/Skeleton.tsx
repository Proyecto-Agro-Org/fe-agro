import styles from "./Skeleton.module.css";

interface SkeletonProps {
  lineas?: number;
  alto?: string;
  ancho?: string;
}

export function Skeleton({
  lineas = 1,
  alto = "1rem",
  ancho = "100%",
}: SkeletonProps) {
  return (
    <div
      className={styles.contenedor}
      style={{ width: ancho, maxWidth: "100%" }}
      aria-hidden="true"
    >
      {Array.from({ length: lineas }, (_, i) => (
        <div key={i} className={styles.linea} style={{ height: alto }} />
      ))}
    </div>
  );
}
