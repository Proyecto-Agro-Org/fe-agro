import styles from './Insignia.module.css';

interface StatusBadgeProps {
  estado: 'conectado' | 'desconectado';
}

const ETIQUETAS = {
  conectado: { texto: 'Conectado', clase: styles.ok },
  desconectado: { texto: 'Desconectado', clase: styles.peligro },
} as const;

export function StatusBadge({ estado }: StatusBadgeProps) {
  const { texto, clase } = ETIQUETAS[estado];
  return <span className={`${styles.insignia} ${clase}`}>{texto}</span>;
}