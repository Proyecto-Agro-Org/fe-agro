import { Link } from 'react-router-dom'
import { obtenerAreas } from '../../api/areas'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBlock } from '../../components/ui/ErrorBlock'
import { Skeleton } from '../../components/ui/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useBreadcrumb } from '../../hooks/useBreadcrumb'
import { cantidad, formatFechaHora } from '../../lib/formato'
import type { AreaResumen, AreasRespuesta } from '../../types/areas'
import styles from './AreasPage.module.css'

function TarjetaArea({ area }: { area: AreaResumen }) {
  const conAlerta = area.alertas_activas > 0
  return (
    <li>
      <Link to={`/areas/${encodeURIComponent(area.area_id)}`} className={styles.tarjeta}>
        <span className={styles.informacion}>
          <span className={styles.nombre}>{area.nombre}</span>
          <span className={styles.resumen}>
            {cantidad(area.sensores, 'sensor', 'sensores')} ·{' '}
            {cantidad(area.conectados, 'conectado', 'conectados')} ·{' '}
            {cantidad(area.desconectados, 'desconectado', 'desconectados')}
          </span>
          <span className={styles.suave}>
            Última actualización:{' '}
            {area.ultima_actualizacion ? (
              <time
                dateTime={area.ultima_actualizacion}
                title={formatFechaHora(area.ultima_actualizacion)}
              >
                {new Date(area.ultima_actualizacion).toDateString() === new Date().toDateString()
                  ? `hoy ${new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(area.ultima_actualizacion))}`
                  : formatFechaHora(area.ultima_actualizacion)}
              </time>
            ) : (
              'Sin datos'
            )}
          </span>
        </span>
        <span
          className={`${styles.badgeAlerta} ${conAlerta ? styles.conAlertas : styles.sinAlertas}`}
        >
          {conAlerta
            ? cantidad(area.alertas_activas, 'alerta activa', 'alertas activas')
            : 'Sin alertas'}
        </span>
      </Link>
    </li>
  )
}

function CargandoAreas() {
  return (
    <div role="status" aria-label="Cargando áreas">
      <ul className={styles.lista}>
        {[1, 2, 3, 4].map((numero) => (
          <li key={numero} className={styles.tarjeta}>
            <Skeleton lineas={3} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AreasPage() {
  const { estado, datos, recargar, desactualizado } = useApi<AreasRespuesta>(
    (signal) => obtenerAreas(signal),
    [],
  )
  useBreadcrumb([{ etiqueta: 'Inicio', a: '/dashboard' }, { etiqueta: 'Áreas' }])

  let contenido
  if (datos === null) {
    contenido =
      estado === 'error' ? (
        <ErrorBlock mensaje="No se pudo cargar el listado de áreas." onReintentar={recargar} />
      ) : (
        <CargandoAreas />
      )
  } else if (datos.areas.length === 0) {
    // Mismo mensaje que el Dashboard, por consistencia.
    contenido = (
      <EmptyState
        titulo="Todavía no tenés áreas asignadas"
        descripcion="Contactá al administrador."
      />
    )
  } else {
    contenido = (
      <>
        <ul className={styles.lista} aria-busy={estado === 'cargando'}>
          {datos.areas.map((area) => (
            <TarjetaArea key={area.area_id} area={area} />
          ))}
        </ul>
      </>
    )
  }

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Áreas</h1>
        {datos !== null && (
          <button
            type="button"
            className={styles.actualizar}
            onClick={recargar}
            disabled={estado === 'cargando'}
          >
            {estado === 'cargando' ? 'Actualizando…' : 'Actualizar'}
          </button>
        )}
      </header>
      {desactualizado && (
        <ErrorBlock
          mensaje="No se pudo actualizar el listado: puede estar desactualizado."
          onReintentar={recargar}
        />
      )}
      {contenido}
    </section>
  )
}
