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

function TarjetaArea({ area }: { area?: AreaResumen }) {
  const conAlerta = (area?.alertas_activas ?? 0) > 0
  const contenido = (
    <>
      <span className={styles.informacion}>
        <span className={styles.nombre}>
          {area ? area.nombre : <Skeleton ancho="10rem" alto="1.3em" />}
        </span>
        <span className={styles.resumen}>
          {area ? (
            <>
              {cantidad(area.sensores, 'sensor', 'sensores')} ·{' '}
              {cantidad(area.conectados, 'conectado', 'conectados')} ·{' '}
              {cantidad(area.desconectados, 'desconectado', 'desconectados')}
            </>
          ) : (
            <Skeleton ancho="20rem" alto="1.4em" />
          )}
        </span>
        <span className={styles.suave}>
          {area ? (
            <>
              Última actualización:{' '}
              {area.ultima_actualizacion ? (
                <time
                  dateTime={area.ultima_actualizacion}
                  title={formatFechaHora(area.ultima_actualizacion)}
                >
                  {new Date(area.ultima_actualizacion).toDateString() ===
                  new Date().toDateString()
                    ? `hoy ${new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(area.ultima_actualizacion))}`
                    : formatFechaHora(area.ultima_actualizacion)}
                </time>
              ) : (
                'Sin datos'
              )}
            </>
          ) : (
            <Skeleton ancho="13rem" alto="1.4em" />
          )}
        </span>
      </span>
      <span
        className={`${styles.badgeAlerta} ${area ? (conAlerta ? styles.conAlertas : styles.sinAlertas) : ''}`}
      >
        {area ? (
          conAlerta ? (
            cantidad(area.alertas_activas, 'alerta activa', 'alertas activas')
          ) : (
            'Sin alertas'
          )
        ) : (
          <Skeleton alto="24px" />
        )}
      </span>
    </>
  )
  return (
    <li>
      {area ? (
        <Link
          to={`/areas/${encodeURIComponent(area.area_id)}`}
          className={styles.tarjeta}
        >
          {contenido}
        </Link>
      ) : (
        <div className={styles.tarjeta} aria-hidden="true">
          {contenido}
        </div>
      )}
    </li>
  )
}

function CargandoAreas() {
  return (
    <div role="status" aria-label="Cargando áreas">
      <ul className={styles.lista}>
        {[1, 2, 3, 4].map((numero) => (
          <TarjetaArea key={numero} />
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
        <ErrorBlock
          mensaje="No se pudo cargar el listado de áreas."
          onReintentar={recargar}
        />
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
        <button
          type="button"
          className={styles.actualizar}
          onClick={recargar}
          disabled={estado === 'cargando' || datos === null}
        >
          Actualizar
        </button>
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
