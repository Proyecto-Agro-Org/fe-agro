import { useBreadcrumb } from '../../hooks/useBreadcrumb'
import { Link } from 'react-router-dom'
import { obtenerDashboard } from '../../api/dashboard'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBlock } from '../../components/ui/ErrorBlock'
import { SeverityBadge } from '../../components/ui/SeverityBadge'
import { Skeleton } from '../../components/ui/Skeleton'
import { useApi } from '../../hooks/useApi'
import { cantidad, formatFechaHora, formatRelativo } from '../../lib/formato'
import type { AreaDashboard, DashboardRespuesta } from '../../types/dashboard'
import styles from './DashboardPage.module.css'
import { useCampo } from '../../app/campo'
import { EstadoSinCampo } from '../../components/layout/EstadoSinCampo'

const CANTIDAD_ALERTAS_RECIENTES = 4

function horaActualizacion(iso: string): string {
  const fecha = new Date(iso)
  if (fecha.toDateString() !== new Date().toDateString()) return formatFechaHora(iso)
  return `hoy ${new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(fecha)}`
}

interface MetricaProps {
  titulo: string
  valor: number | string
  tono?: 'ok' | 'peligro'
}

function Metrica({ titulo, valor, tono }: MetricaProps) {
  return (
    <li className={`${styles.metrica} ${tono ? styles[tono] : ''}`}>
      <span className={styles.metricaTitulo}>{titulo}</span>
      <strong className={styles.metricaValor}>{valor}</strong>
    </li>
  )
}

function ItemArea({ area }: { area: AreaDashboard }) {
  const conAlerta = area.alertas_activas > 0
  return (
    <tr>
      <th scope="row">
        <Link to={`/areas/${encodeURIComponent(area.area_id)}`} className={styles.area}>
          <span className={styles.areaNombre}>{area.nombre}</span>
        </Link>
      </th>
      <td>{area.sensores}</td>
      <td>
        {area.conectados} / {area.sensores}
      </td>
      <td>
        <span
          className={`${styles.estadoArea} ${conAlerta ? styles.conAlertas : styles.sinAlertasArea}`}
        >
          {conAlerta
            ? cantidad(area.alertas_activas, 'alerta', 'alertas')
            : 'Sin alertas'}
        </span>
      </td>
    </tr>
  )
}

function CargandoDashboard() {
  return (
    <div className={styles.carga} role="status" aria-label="Cargando el resumen">
      <ul className={styles.metricas}>
        {[1, 2, 3, 4].map((numero) => (
          <li key={numero} className={styles.metrica}>
            <span className={styles.metricaTitulo}>
              <Skeleton ancho="8rem" alto="1em" />
            </span>
            <span className={styles.metricaValor}>
              <Skeleton ancho="4rem" alto="1em" />
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.paneles}>
        <section className={styles.bloque}>
          <h2 className={styles.subtitulo}>Áreas</h2>
          <div className={styles.tablaContenedor}>
            <table className={styles.tablaAreas} aria-hidden="true">
              <thead>
                <tr>
                  {['Área', 'Sensores', 'Conectados', 'Estado'].map((titulo) => (
                    <th key={titulo}>{titulo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((fila) => (
                  <tr key={fila}>
                    {[1, 2, 3, 4].map((columna) => (
                      <td key={columna}>
                        <Skeleton alto="19px" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className={styles.bloque}>
          <h2 className={styles.subtitulo}>Últimas alertas</h2>
          <ul className={styles.listaAlertas} aria-hidden="true">
            {[1, 2, 3, 4].map((fila) => (
              <li key={fila}>
                <div className={styles.alerta}>
                  <Skeleton ancho="49px" alto="19px" />
                  <div className={styles.alertaTexto}>
                    <Skeleton lineas={2} alto="12px" />
                  </div>
                  <Skeleton ancho="4rem" alto="12px" />
                </div>
              </li>
            ))}
          </ul>
          <span className={styles.verTodas}>
            <Skeleton ancho="8rem" alto="1em" />
          </span>
        </section>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { campoSeleccionado } = useCampo()
  useBreadcrumb([{ etiqueta: 'Inicio' }])
  return campoSeleccionado
    ? <DashboardDeCampo key={campoSeleccionado.campo_id} campoId={campoSeleccionado.campo_id} />
    : <EstadoSinCampo titulo="Dashboard" />
}

function DashboardDeCampo({ campoId }: { campoId: string }) {
  const { estado, datos, recargar } = useApi<DashboardRespuesta>(
    (signal) => obtenerDashboard(campoId, signal),
    [campoId],
  )

  let contenido
  if (estado === 'cargando') {
    contenido = <CargandoDashboard />
  } else if (estado === 'error' || datos === null) {
    // Sin datos parciales: o se ve todo el resumen o se ve el error.
    contenido = (
      <ErrorBlock mensaje="No se pudo cargar el resumen." onReintentar={recargar} />
    )
  } else if (datos.resumen.areas === 0) {
    contenido = (
      <EmptyState
        titulo="Todavía no tenés áreas asignadas"
        descripcion="Contactá al administrador."
      />
    )
  } else {
    const { resumen, areas, ultimas_alertas } = datos
    contenido = (
      <>
        <ul className={styles.metricas} aria-label="Resumen general">
          <Metrica titulo="Áreas" valor={resumen.areas} />
          <Metrica
            titulo="Sensores conectados"
            valor={`${resumen.conectados} / ${resumen.sensores}`}
            tono="ok"
          />
          <Metrica titulo="Sensores desconectados" valor={resumen.desconectados} />
          <Metrica
            titulo="Alertas activas"
            valor={resumen.alertas_activas}
            tono={resumen.alertas_activas > 0 ? 'peligro' : undefined}
          />
        </ul>

        <div className={styles.paneles}>
          <section className={styles.bloque} aria-labelledby="titulo-areas">
            <h2 id="titulo-areas" className={styles.subtitulo}>
              Áreas
            </h2>
            <div className={styles.tablaContenedor}>
              <table className={styles.tablaAreas} aria-label="Resumen por área">
                <thead>
                  <tr>
                    <th scope="col">Área</th>
                    <th scope="col">Sensores</th>
                    <th scope="col">Conectados</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.map((area) => (
                    <ItemArea key={area.area_id} area={area} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.bloque} aria-labelledby="titulo-alertas">
            <h2 id="titulo-alertas" className={styles.subtitulo}>
              Últimas alertas
            </h2>
            {ultimas_alertas.length === 0 ? (
              <p className={styles.sinAlertas}>No hay alertas recientes.</p>
            ) : (
              <ul className={styles.listaAlertas}>
                {ultimas_alertas.slice(0, CANTIDAD_ALERTAS_RECIENTES).map((alerta) => (
                  <li key={alerta.alerta_id}>
                    <Link
                      to={`/sensores/${encodeURIComponent(alerta.device_id)}`}
                      className={styles.alerta}
                    >
                      <SeverityBadge severidad={alerta.severidad} />
                      <div className={styles.alertaTexto}>
                        <strong className={styles.sensorNombre}>
                          {alerta.sensor_nombre}
                        </strong>
                        <span
                          className={styles.alertaDescripcion}
                          title={alerta.descripcion}
                        >
                          {alerta.descripcion}
                        </span>
                        {alerta.estado === 'resuelta' && (
                          <span className={styles.alertaDetalle}>Resuelta</span>
                        )}
                      </div>
                      <span
                        className={styles.alertaFecha}
                        title={formatFechaHora(alerta.timestamp)}
                      >
                        {formatRelativo(alerta.timestamp)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/alertas" className={styles.verTodas}>
              Ver todas las alertas
            </Link>
          </section>
        </div>
      </>
    )
  }

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Dashboard</h1>
        {estado === 'exito' && datos?.ultima_actualizacion && (
          <p className={styles.actualizacion}>
            Última actualización:{' '}
            <time
              dateTime={datos.ultima_actualizacion}
              title={formatFechaHora(datos.ultima_actualizacion)}
            >
              {horaActualizacion(datos.ultima_actualizacion)}
            </time>
          </p>
        )}
      </header>
      {contenido}
    </section>
  )
}
