import { NoEncontrado } from '../../components/ui/NoEncontrado'
import { Link, useParams } from 'react-router-dom'
import { obtenerSensor } from '../../api/sensor'
import { useApi } from '../../hooks/useApi'
import { useBreadcrumb } from '../../hooks/useBreadcrumb'
import { ErrorBlock } from '../../components/ui/ErrorBlock'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatFechaHora, formatRelativo, formatValor } from '../../lib/formato'
import type { Variable } from '../../types/comun'
import styles from './SensorDetallePage.module.css'
const VARIABLES: { clave: Variable; nombre: string }[] = [
  { clave: 'humedad', nombre: 'Humedad' },
  { clave: 'temperatura', nombre: 'Temperatura' },
  { clave: 'conductividad', nombre: 'Conductividad eléctrica' },
  { clave: 'nitrogeno', nombre: 'Nitrógeno (N)' },
  { clave: 'fosforo', nombre: 'Fósforo (P)' },
  { clave: 'potasio', nombre: 'Potasio (K)' },
]
export default function SensorDetallePage() {
  const { deviceId = '' } = useParams()
  const resultado = useApi((signal) => obtenerSensor(deviceId, signal), [deviceId])
  const sensor = resultado.datos
  useBreadcrumb([
    { etiqueta: 'Inicio', a: '/dashboard' },
    {
      etiqueta: sensor?.area_nombre,
      a: sensor ? `/areas/${encodeURIComponent(sensor.area_id)}` : undefined,
    },
    {
      etiqueta:
        sensor?.nombre ?? (resultado.estado === 'error' ? 'Sensor no disponible' : undefined),
    },
  ])
  if (resultado.error?.estado === 404) return <NoEncontrado />
  return (
    <section
      className={styles.pagina}
      aria-label="Detalle del sensor"
      aria-busy={resultado.estado === 'cargando'}
    >
      {resultado.estado === 'cargando' && !sensor && (
        <div role="status" aria-label="Cargando sensor">
          <Skeleton alto="2rem" />
          <div className={styles.medidas}>
            {VARIABLES.map((v) => (
              <Skeleton key={v.clave} alto="6rem" />
            ))}
          </div>
        </div>
      )}
      {resultado.estado === 'error' && (
        <>
          {!sensor && <h1>Sensor no disponible</h1>}
          <ErrorBlock mensaje={'No se pudo cargar el sensor'} onReintentar={resultado.recargar} />
        </>
      )}
      {resultado.desactualizado && <p role="status">Los datos pueden estar desactualizados.</p>}
      {sensor && (
        <>
          <header className={styles.encabezado}>
            <div className={styles.titulo}>
              <div className={styles.fila}>
                <h1>Sensor {sensor.nombre}</h1>
                <StatusBadge estado={sensor.estado} />
              </div>
              <Link
                className={styles.historico}
                to={`/sensores/${encodeURIComponent(sensor.device_id)}/historico`}
              >
                Ver históricos
              </Link>
            </div>
            <dl className={styles.informacion}>
              <div>
                <dt>Identificador</dt>
                <dd>{sensor.nombre}</dd>
              </div>
              <div>
                <dt>Área</dt>
                <dd>
                  <Link to={`/areas/${encodeURIComponent(sensor.area_id)}`}>
                    {sensor.area_nombre}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>Ubicación</dt>
                <dd>
                  {sensor.ubicacion
                    ? `Lat ${sensor.ubicacion.lat.toFixed(4)} · Lon ${sensor.ubicacion.lon.toFixed(4)}`
                    : 'Sin ubicación'}
                </dd>
              </div>
              <div>
                <dt>Última comunicación</dt>
                <dd>
                  {sensor.ultima_comunicacion ? (
                    <time dateTime={sensor.ultima_comunicacion}>
                      {formatFechaHora(sensor.ultima_comunicacion)} (
                      {formatRelativo(sensor.ultima_comunicacion)})
                    </time>
                  ) : (
                    'Sin comunicación registrada'
                  )}
                </dd>
              </div>
            </dl>
          </header>
          {sensor.estado === 'desconectado' && (
            <p className={styles.aviso}>
              Sensor desconectado.{' '}
              {sensor.ultima_medicion
                ? 'Se muestran las últimas mediciones conocidas; revisá su fecha.'
                : 'No hay mediciones disponibles.'}
            </p>
          )}
          {sensor.ultima_medicion ? (
            <section aria-labelledby="titulo-mediciones">
              <h2 id="titulo-mediciones" className={styles.soloLectores}>
                Últimas mediciones
              </h2>
              <p className={styles.fecha}>
                Fecha de medición:{' '}
                <time dateTime={sensor.ultima_medicion.timestamp}>
                  {formatFechaHora(sensor.ultima_medicion.timestamp)}
                </time>
              </p>
              <dl className={styles.medidas}>
                {VARIABLES.map((v) => (
                  <div className={styles.tarjeta} key={v.clave}>
                    <dt>{v.nombre}</dt>
                    <dd>{formatValor(sensor.ultima_medicion![v.clave])}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : (
            <EmptyState titulo="Este sensor todavía no reportó mediciones" />
          )}
        </>
      )}
    </section>
  )
}
