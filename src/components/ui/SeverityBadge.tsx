import styles from './Insignia.module.css';

interface SeverityBadgeProps {
  severidad: 'alta' | 'media' | 'baja';
}

const ETIQUETAS = {
  alta: { texto: 'Alta', clase: styles.peligro },
  media: { texto: 'Media', clase: styles.advertencia },
  baja: { texto: 'Baja', clase: styles.ok },
} as const;

export function SeverityBadge({ severidad }: SeverityBadgeProps) {
  const { texto, clase } = ETIQUETAS[severidad];
  return <span className={`${styles.insignia} ${clase}`}>{texto}</span>;
}