import { useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerAlertas } from '../../api/alertas'
import { obtenerAreas } from '../../api/areas'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBlock } from '../../components/ui/ErrorBlock'
import { SeverityBadge } from '../../components/ui/SeverityBadge'
import { Skeleton } from '../../components/ui/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useBreadcrumb } from '../../hooks/useBreadcrumb'
import { formatFechaHora } from '../../lib/formato'
import type { Alerta, AlertasRespuesta, TipoAlerta } from '../../types/alertas'
import type { AreasRespuesta } from '../../types/areas'
import type { Severidad } from '../../types/comun'
import styles from './AlertasPage.module.css'
import { useCampo } from '../../app/campo'
import { EstadoSinCampo } from '../../components/layout/EstadoSinCampo'

const LIMITE_ALERTAS = 50

const ETIQUETA_TIPO: Record<TipoAlerta, string> = {
  tecnica: 'Técnica',
  agronomica: 'Agronómica',
}

interface Filtros {
  area_id: string
  tipo: '' | TipoAlerta
  severidad: '' | Severidad
}

const SIN_FILTROS: Filtros = { area_id: '', tipo: '', severidad: '' }

function ItemAlerta({ alerta }: { alerta: Alerta }) {
  return (
    <tr>
      <td className={styles.severidad}>
        <SeverityBadge severidad={alerta.severidad} />
      </td>
      <td>
        <Link
          to={`/sensores/${encodeURIComponent(alerta.device_id)}`}
          className={styles.sensor}
        >
          {alerta.sensor_nombre}
        </Link>
      </td>
      <td>{alerta.area_nombre}</td>
      <td>{ETIQUETA_TIPO[alerta.tipo]}</td>
      <td className={styles.descripcion}>{alerta.descripcion}</td>
      <td>
        <time
          className={styles.fecha}
          dateTime={alerta.timestamp}
          title={formatFechaHora(alerta.timestamp)}
        >
          {new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(new Date(alerta.timestamp))}
        </time>
      </td>
      <td>
        <span className={alerta.estado === 'activa' ? styles.activa : styles.resuelta}>
          {alerta.estado === 'activa' ? 'Activa' : 'Resuelta'}
        </span>
      </td>
    </tr>
  )
}

function TablaAlertas({
  alertas,
  cargando = false,
}: {
  alertas: Alerta[]
  cargando?: boolean
}) {
  return (
    <div className={styles.resultados}>
      {cargando && (
        <span className={styles.soloLectores} role="status" aria-label="Cargando alertas">
          Cargando alertas
        </span>
      )}
      <div
        className={styles.tablaContenedor}
        role="region"
        aria-label="Resultados de alertas"
        tabIndex={0}
        aria-busy={cargando}
      >
        <table className={styles.tabla} aria-label="Alertas">
          <colgroup>
            <col className={styles.colSeveridad} />
            <col className={styles.colSensor} />
            <col className={styles.colArea} />
            <col className={styles.colTipo} />
            <col />
            <col className={styles.colFecha} />
            <col className={styles.colEstado} />
          </colgroup>
          <thead>
            <tr>
              {[
                'Severidad',
                'Sensor',
                'Área',
                'Tipo',
                'Descripción',
                'Fecha / hora',
                'Estado',
              ].map((titulo) => (
                <th key={titulo} scope="col">
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando
              ? [1, 2, 3, 4, 5].map((fila) => (
                  <tr key={fila} aria-hidden="true">
                    {[1, 2, 3, 4, 5, 6, 7].map((columna) => (
                      <td
                        key={columna}
                        className={columna === 5 ? styles.descripcion : undefined}
                      >
                        <Skeleton
                          alto="19px"
                          ancho={columna === 1 ? '49px' : columna === 7 ? '3rem' : '100%'}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : alertas.map((alerta) => (
                  <ItemAlerta key={alerta.alerta_id} alerta={alerta} />
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AlertasPage() {
  const { campoSeleccionado } = useCampo()
  useBreadcrumb([{ etiqueta: 'Inicio', a: '/dashboard' }, { etiqueta: 'Alertas' }])
  return campoSeleccionado
    ? <AlertasDelCampo key={campoSeleccionado.campo_id} campoId={campoSeleccionado.campo_id} />
    : <EstadoSinCampo titulo="Alertas" />
}

function AlertasDelCampo({ campoId }: { campoId: string }) {
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const [aplicados, setAplicados] = useState<Filtros>(SIN_FILTROS)
  function limpiarFiltros() {
    setFiltros(SIN_FILTROS)
    setAplicados(SIN_FILTROS)
  }
  const hayFiltros =
    aplicados.area_id !== '' || aplicados.tipo !== '' || aplicados.severidad !== ''

  // Solo alimenta el desplegable: si falla, la lista de alertas sigue funcionando.
  const {
    datos: areas,
    estado: estadoAreas,
    recargar: recargarAreas,
  } = useApi<AreasRespuesta>((signal) => obtenerAreas(campoId, signal), [campoId])

  const { estado, datos, recargar } = useApi<AlertasRespuesta>(
    (signal) =>
      obtenerAlertas(
        campoId,
        {
          estado: 'activa',
          limit: LIMITE_ALERTAS,
          area_id: aplicados.area_id || undefined,
          tipo: aplicados.tipo || undefined,
          severidad: aplicados.severidad || undefined,
        },
        signal,
      ),
    [campoId, aplicados.area_id, aplicados.tipo, aplicados.severidad],
  )

  let contenido
  if (estado === 'cargando') {
    contenido = <TablaAlertas alertas={[]} cargando />
  } else if (estado === 'error' || datos === null) {
    // Los filtros viven en este componente, así que siguen aplicados al reintentar.
    contenido = (
      <ErrorBlock mensaje="No se pudieron cargar las alertas." onReintentar={recargar} />
    )
  } else if (datos.alertas.length === 0) {
    contenido = (
      <div>
        <EmptyState
          icono="✓"
          titulo={
            hayFiltros
              ? 'No hay alertas activas con estos filtros'
              : 'No hay alertas activas'
          }
          descripcion={hayFiltros ? undefined : 'No se registran alertas activas.'}
        />
      </div>
    )
  } else {
    contenido = (
      <>
        {datos.total > datos.alertas.length && (
          <p className={styles.contador}>
            Mostrando {datos.alertas.length} de {datos.total} alertas activas. Acotá con
            los filtros para ver el resto.
          </p>
        )}
        <TablaAlertas alertas={datos.alertas} />
      </>
    )
  }

  return (
    <section className={styles.pagina}>
      <h1 className={styles.titulo}>Alertas</h1>
      {estadoAreas === 'error' && (
        <div>
          <p role="status">
            No se pudieron cargar las áreas del filtro. Podés seguir consultando las
            alertas.
          </p>
          <button type="button" className={styles.limpiar} onClick={recargarAreas}>
            Reintentar áreas
          </button>
        </div>
      )}
      <form
        className={styles.filtros}
        onSubmit={(evento) => {
          evento.preventDefault()
          setAplicados({ ...filtros })
        }}
      >
        <label className={styles.campo}>
          Área
          <select
            value={filtros.area_id}
            onChange={(evento) =>
              setFiltros({ ...filtros, area_id: evento.target.value })
            }
          >
            <option value="">Todas</option>
            {(areas?.areas ?? []).map((area) => (
              <option key={area.area_id} value={area.area_id}>
                {area.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.campo}>
          Tipo
          <select
            value={filtros.tipo}
            onChange={(evento) =>
              setFiltros({
                ...filtros,
                tipo: evento.target.value as Filtros['tipo'],
              })
            }
          >
            <option value="">Todos</option>
            <option value="tecnica">Técnica</option>
            <option value="agronomica">Agronómica</option>
          </select>
        </label>

        <label className={styles.campo}>
          Severidad
          <select
            value={filtros.severidad}
            onChange={(evento) =>
              setFiltros({
                ...filtros,
                severidad: evento.target.value as Filtros['severidad'],
              })
            }
          >
            <option value="">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </label>
        <button type="button" className={styles.limpiar} onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
        <button type="submit" className={styles.aplicar}>
          Aplicar filtros
        </button>
      </form>

      {contenido}
    </section>
  )
}
