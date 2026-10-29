import styles from './DemoBanner.module.css';

export function DemoBanner() {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') return null;
  return (
    <div className={styles.banner} role="note">
      <strong>Datos de ejemplo:</strong> los valores son ilustrativos, no mediciones reales.
    </div>
  );
}