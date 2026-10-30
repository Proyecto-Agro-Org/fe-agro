import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerMapa } from '../../api/mapa'
import { useApi } from '../../hooks/useApi'
import { useBreadcrumb } from '../../hooks/useBreadcrumb'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBlock } from '../../components/ui/ErrorBlock'
import { Spinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { tieneUbicacion } from '../../types/mapa'
import styles from './MapaPage.module.css'
import { useCampo } from '../../app/campo'
import { EstadoSinCampo } from '../../components/layout/EstadoSinCampo'
const MapaSensores = lazy(() => import('./MapaSensores'))
export default function MapaPage() {
  const { campoSeleccionado } = useCampo()
  useBreadcrumb([{ etiqueta: 'Inicio', a: '/dashboard' }, { etiqueta: 'Mapa' }])
  return campoSeleccionado
    ? <MapaDelCampo key={campoSeleccionado.campo_id} campoId={campoSeleccionado.campo_id} />
    : <EstadoSinCampo titulo="Mapa de sensores" />
}

function MapaDelCampo({ campoId }: { campoId: string }) {
  const resultado = useApi((signal) => obtenerMapa(campoId, signal), [campoId])
  const [area, setArea] = useState('')
  const [estado, setEstado] = useState('')
  const sensores = resultado.estado === 'exito' ? (resultado.datos?.sensores ?? []) : []
  const areas = [
    ...new Map(sensores.map((s) => [s.area_id, s.area_nombre])).entries(),
  ]
  const areaValida = areas.some(([id]) => id === area) ? area : ''
  const filtrados = sensores.filter(
    (s) => (!areaValida || s.area_id === areaValida) && (!estado || s.estado === estado),
  )
  const ubicados = filtrados.filter(tieneUbicacion)
  const sinUbicacion = filtrados.filter((s) => !tieneUbicacion(s))
  return (
    <section className={styles.pagina}>
      <h1>Mapa de sensores</h1>
      <div className={styles.filtros}>
        <label>
          Área
          <select value={areaValida} onChange={(e) => setArea(e.target.value)}>
            <option value="">Todas las áreas</option>
            {areas.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="conectado">Conectados</option>
            <option value="desconectado">Desconectados</option>
          </select>
        </label>
        <div className={styles.leyenda}>
          <StatusBadge estado="conectado" />
          <StatusBadge estado="desconectado" />
        </div>
      </div>
      <div className={styles.contenedorMapa} aria-busy={resultado.estado === 'cargando'}>
        <Suspense
          fallback={
            <div className={styles.cargaBase}>
              <Spinner etiqueta="Cargando mapa…" />
            </div>
          }
        >
          <MapaSensores sensores={ubicados} />
        </Suspense>
        {resultado.estado === 'cargando' && (
          <div className={styles.superpuesto}>
            <Spinner etiqueta="Cargando sensores…" />
          </div>
        )}
        {resultado.estado === 'error' && (
          <div className={styles.superpuesto}>
            <ErrorBlock
              mensaje="No se pudieron cargar los sensores del mapa"
              onReintentar={resultado.recargar}
            />
          </div>
        )}
        {resultado.estado === 'exito' && ubicados.length === 0 && (
          <div className={styles.superpuesto}>
            <EmptyState
              titulo="No hay sensores geolocalizados para mostrar"
              descripcion={areaValida || estado ? 'Probá con otros filtros.' : undefined}
            />
          </div>
        )}
      </div>
      {resultado.estado === 'exito' && (
        <>
          <div>
            {sinUbicacion.length > 0 && (
              <section aria-labelledby="sin-ubicacion">
                <h2 id="sin-ubicacion">Sensores sin ubicación</h2>
                <ul className={styles.lista}>
                  {sinUbicacion.map((s) => (
                    <li key={s.device_id}>
                      <Link to={`/sensores/${encodeURIComponent(s.device_id)}`}>
                        {s.nombre} · {s.area_nombre}
                      </Link>
                      <StatusBadge estado={s.estado} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {ubicados.length > 0 && (
              <details>
                <summary>Ver sensores en listado</summary>
                <ul className={styles.lista}>
                  {ubicados.map((s) => (
                    <li key={s.device_id}>
                      <Link to={`/sensores/${encodeURIComponent(s.device_id)}`}>
                        {s.nombre} · {s.area_nombre}
                      </Link>
                      <StatusBadge estado={s.estado} />
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </>
      )}
    </section>
  )
}
