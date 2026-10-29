import { NoEncontrado } from '../../components/ui/NoEncontrado'
import { lazy, Suspense, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { LIMITE_HISTORICO, obtenerHistorico } from '../../api/historico'
import { useApi } from '../../hooks/useApi'
import { useBreadcrumb } from '../../hooks/useBreadcrumb'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBlock } from '../../components/ui/ErrorBlock'
import { Spinner } from '../../components/ui/Spinner'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatFechaHora, formatValor } from '../../lib/formato'
import type { FiltrosHistorico } from '../../types/historico'
import type { Variable } from '../../types/comun'
import styles from './HistoricoPage.module.css'
const GraficoHistorico = lazy(() => import('./GraficoHistorico'))
const VARIABLES: { valor: Variable; nombre: string }[] = [
  { valor: 'humedad', nombre: 'Humedad' },
  { valor: 'temperatura', nombre: 'Temperatura' },
  { valor: 'conductividad', nombre: 'Conductividad eléctrica' },
  { valor: 'nitrogeno', nombre: 'Nitrógeno (N)' },
  { valor: 'fosforo', nombre: 'Fósforo (P)' },
  { valor: 'potasio', nombre: 'Potasio (K)' },
]
function fechaLocal(fecha: Date) {
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`
}
function iniciales(): FiltrosHistorico {
  const hasta = new Date()
  const desde = new Date(hasta)
  desde.setDate(desde.getDate() - 6)
  return { variable: 'humedad', desde: fechaLocal(desde), hasta: fechaLocal(hasta) }
}
function convertir(f: FiltrosHistorico): FiltrosHistorico {
  const desde = new Date(`${f.desde}T00:00:00`)
  const hasta = new Date(`${f.hasta}T23:59:59.999`)
  return { ...f, desde: desde.toISOString(), hasta: hasta.toISOString() }
}
export default function HistoricoPage() {
  const { deviceId = '' } = useParams()
  const ubicacion = useLocation()
  const previo = (
    ubicacion.state as {
      sensor?: { deviceId: string; nombre: string; area_id: string; area_nombre: string }
    } | null
  )?.sensor
  const sensorPrevio = previo?.deviceId === deviceId ? previo : undefined
  const [formulario, setFormulario] = useState(iniciales)
  const [aplicado, setAplicado] = useState(() => convertir(formulario))
  const [validacion, setValidacion] = useState('')
  const resultado = useApi(
    (signal) => obtenerHistorico(deviceId, aplicado, signal),
    [deviceId, aplicado],
  )
  const datos = resultado.datos
  const nombreSensor = datos?.nombre ?? sensorPrevio?.nombre
  const areaId = datos?.area_id ?? sensorPrevio?.area_id
  const areaNombre = datos?.area_nombre ?? sensorPrevio?.area_nombre
  const nombre = VARIABLES.find((v) => v.valor === aplicado.variable)!.nombre
  useBreadcrumb([
    { etiqueta: 'Inicio', a: '/dashboard' },
    {
      etiqueta: areaNombre,
      a: areaId ? `/areas/${encodeURIComponent(areaId)}` : undefined,
    },
    { etiqueta: nombreSensor, a: `/sensores/${encodeURIComponent(deviceId)}` },
    { etiqueta: 'Históricos' },
  ])
  function aplicar(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const desde = Date.parse(`${formulario.desde}T00:00:00`),
      hasta = Date.parse(`${formulario.hasta}T23:59:59.999`)
    if (!Number.isFinite(desde) || !Number.isFinite(hasta)) {
      setValidacion('Ingresá ambas fechas válidas')
      return
    }
    if (desde > hasta) {
      setValidacion('La fecha desde no puede ser posterior a la fecha hasta')
      return
    }
    setValidacion('')
    const siguiente = convertir(formulario)
    if (JSON.stringify(siguiente) === JSON.stringify(aplicado)) resultado.recargar()
    else setAplicado(siguiente)
  }
  if (resultado.error?.estado === 404) return <NoEncontrado />
  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1>
          Históricos ·{' '}
          {nombreSensor ?? (
            <span className={styles.nombreCargando}>
              <Skeleton ancho="8ch" alto="1.3em" />
            </span>
          )}
        </h1>
        <Link to={`/sensores/${encodeURIComponent(deviceId)}`}>Volver al sensor</Link>
      </header>
      <form className={styles.filtros} onSubmit={aplicar} noValidate>
        <label>
          Variable
          <select
            value={formulario.variable}
            onChange={(e) =>
              setFormulario({ ...formulario, variable: e.target.value as Variable })
            }
          >
            {VARIABLES.map((v) => (
              <option key={v.valor} value={v.valor}>
                {v.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Desde
          <input
            type="date"
            value={formulario.desde}
            aria-invalid={!!validacion}
            aria-describedby={validacion ? 'error-fechas' : undefined}
            onChange={(e) => setFormulario({ ...formulario, desde: e.target.value })}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            value={formulario.hasta}
            aria-invalid={!!validacion}
            aria-describedby={validacion ? 'error-fechas' : undefined}
            onChange={(e) => setFormulario({ ...formulario, hasta: e.target.value })}
          />
        </label>
        <button type="submit">Aplicar filtros</button>
      </form>
      {validacion && (
        <p id="error-fechas" role="alert" className={styles.error}>
          {validacion}
        </p>
      )}
      <section
        className={styles.panel}
        aria-labelledby="titulo-grafico"
        aria-busy={resultado.estado === 'cargando'}
      >
        <h2 id="titulo-grafico">
          {nombre}
          {datos ? ` (${datos.unidad})` : ''}
        </h2>
        <p className={styles.periodo}>
          {formatFechaHora(aplicado.desde)} — {formatFechaHora(aplicado.hasta)}
        </p>
        {resultado.estado === 'cargando' ? (
          <div className={styles.estado}>
            <Spinner etiqueta="Cargando histórico…" />
          </div>
        ) : resultado.estado === 'error' ? (
          <ErrorBlock
            mensaje={'No se pudo cargar el histórico'}
            onReintentar={resultado.recargar}
          />
        ) : datos &&
          (datos.puntos.length === 0 || datos.puntos.every((p) => p.valor === null)) ? (
          <div className={styles.estado}>
            <EmptyState titulo="No hay datos para el período seleccionado" />
          </div>
        ) : (
          datos && (
            <>
              {datos.truncado && (
                <p role="status">
                  Se muestran los primeros {LIMITE_HISTORICO} puntos. Reducí el período
                  para ver todos los datos.
                </p>
              )}
              <Suspense
                fallback={
                  <div className={styles.estado}>
                    <Spinner etiqueta="Cargando gráfico…" />
                  </div>
                }
              >
                <GraficoHistorico datos={datos} nombre={nombre} />
              </Suspense>
              {datos.puntos.some((p) => p.valor === null) && (
                <p className={styles.periodo}>
                  Los cortes del gráfico representan lecturas sin datos.
                </p>
              )}
              <details>
                <summary>Ver datos en tabla</summary>
                <div className={styles.tabla}>
                  <table>
                    <caption>
                      {nombre} ({datos.unidad})
                    </caption>
                    <thead>
                      <tr>
                        <th>Fecha y hora</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.puntos.map((p) => (
                        <tr key={p.timestamp}>
                          <td>{formatFechaHora(p.timestamp)}</td>
                          <td>{formatValor({ valor: p.valor, unidad: datos.unidad })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )
        )}
      </section>
    </section>
  )
}
