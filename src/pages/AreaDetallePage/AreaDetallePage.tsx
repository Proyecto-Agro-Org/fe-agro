import { NoEncontrado } from '../../components/ui/NoEncontrado'
import { Link, useParams } from 'react-router-dom'
import { obtenerArea, obtenerSensoresDeArea } from '../../api/areaDetalle'
import { useApi } from '../../hooks/useApi'
import { useBreadcrumb } from '../../hooks/useBreadcrumb'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBlock } from '../../components/ui/ErrorBlock'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatFechaHora } from '../../lib/formato'
import styles from './AreaDetallePage.module.css'
import { useCampo } from '../../app/campo'
import { EstadoSinCampo } from '../../components/layout/EstadoSinCampo'
export default function AreaDetallePage() {
  const { areaId = '' } = useParams()
  const { campoSeleccionado } = useCampo()
  return campoSeleccionado
    ? <DetalleEnCampo key={`${campoSeleccionado.campo_id}:${areaId}`} campoId={campoSeleccionado.campo_id} areaId={areaId} />
    : <EstadoSinCampo titulo="Detalle de área" />
}

function DetalleEnCampo({ campoId, areaId }: { campoId: string; areaId: string }) {
  const area = useApi((signal) => obtenerArea(areaId, campoId, signal), [areaId, campoId])
  const listado = useApi((signal) => obtenerSensoresDeArea(areaId, campoId, signal), [areaId, campoId])
  useBreadcrumb([
    { etiqueta: 'Inicio', a: '/dashboard' },
    {
      etiqueta:
        area.datos?.nombre ??
        (area.estado === 'error' ? 'Área no disponible' : undefined),
    },
  ])
  if (area.error?.estado === 404) return <NoEncontrado />
  return (
    <section className={styles.pagina} aria-label="Detalle de área">
      <header className={styles.encabezado}>
        {area.datos ? (
          <>
            <h1>{area.datos.nombre} · Sensores</h1>
          </>
        ) : area.estado === 'cargando' ? (
          <div role="status" aria-label="Cargando área">
            <h1>
              <Skeleton ancho="18rem" alto="1.3em" />
            </h1>
          </div>
        ) : (
          <h1>Área no disponible</h1>
        )}
      </header>
      {area.estado === 'error' && (
        <ErrorBlock mensaje={'No se pudo cargar el área'} onReintentar={area.recargar} />
      )}
      {area.error?.estado !== 404 && (
        <section
          aria-labelledby="titulo-sensores"
          aria-busy={listado.estado === 'cargando'}
        >
          <h2 id="titulo-sensores" className={styles.soloLectores}>
            Sensores del área
          </h2>
          {listado.estado === 'error' && (
            <ErrorBlock
              mensaje="No se pudieron cargar los sensores"
              onReintentar={listado.recargar}
            />
          )}
          {listado.desactualizado && (
            <p role="status">Los datos pueden estar desactualizados.</p>
          )}
          {listado.estado === 'cargando' && !listado.datos && (
            <div role="status" aria-label="Cargando sensores">
              <ul className={styles.lista} aria-hidden="true">
                {[1, 2, 3, 4].map((fila) => (
                  <li key={fila} className={styles.sensor}>
                    <div className={styles.informacion}>
                      <span className={styles.nombre}>
                        <Skeleton ancho="9rem" alto="1em" />
                      </span>
                      <span className={styles.resumen}>
                        <Skeleton ancho="24rem" alto="1em" />
                      </span>
                      <span className={styles.resumen}>
                        <Skeleton ancho="8rem" alto="1em" />
                      </span>
                    </div>
                    <span className={styles.estado}>
                      <Skeleton ancho="102px" alto="24px" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {listado.datos?.sensores.length === 0 && (
            <EmptyState titulo="Todavía no hay sensores instalados en esta área" />
          )}
          {!!listado.datos?.sensores.length && (
            <ul className={styles.lista}>
              {listado.datos.sensores.map((sensor) => (
                <li key={sensor.device_id}>
                  <Link
                    className={styles.sensor}
                    to={`/sensores/${encodeURIComponent(sensor.device_id)}`}
                  >
                    <div className={styles.informacion}>
                      <strong className={styles.nombre}>{sensor.nombre}</strong>
                      <span className={styles.resumen}>
                        Última comunicación:{' '}
                        {sensor.ultima_comunicacion ? (
                          <time
                            dateTime={sensor.ultima_comunicacion}
                            title={formatFechaHora(sensor.ultima_comunicacion)}
                          >
                            {new Date(sensor.ultima_comunicacion).toDateString() ===
                            new Date().toDateString()
                              ? `hoy ${new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(sensor.ultima_comunicacion))}`
                              : formatFechaHora(sensor.ultima_comunicacion)}
                          </time>
                        ) : (
                          'Sin comunicación registrada'
                        )}
                        {' · '}
                        {sensor.ubicacion
                          ? `Ubicación: ${sensor.ubicacion.lat.toFixed(4)}, ${sensor.ubicacion.lon.toFixed(4)}`
                          : 'Sin ubicación'}
                      </span>
                      <span className={styles.resumen}>
                        {sensor.alertas_activas === 0
                          ? 'Sin alertas activas'
                          : `${sensor.alertas_activas} ${sensor.alertas_activas === 1 ? 'alerta activa' : 'alertas activas'}`}
                      </span>
                    </div>
                    <span className={styles.estado}>
                      <StatusBadge estado={sensor.estado} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </section>
  )
}
