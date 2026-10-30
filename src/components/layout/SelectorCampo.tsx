import { useId } from 'react'
import { useCampo } from '../../app/campo'
import estilos from './SelectorCampo.module.css'

export function SelectorCampo() {
  const id = useId()
  const { campos, campoSeleccionado, estado, disponible, seleccionarCampo, reintentar } = useCampo()
  const cargando = disponible && estado === 'cargando'
  const error = disponible && estado === 'error'
  const mensaje = !disponible ? 'No disponible' : cargando ? 'Cargando campos…'
    : error ? 'No se pudieron cargar los campos' : 'Sin campos disponibles'

  return <div className={estilos.selector}>
    <label htmlFor={id}>Campo</label>
    <select
      id={id}
      value={campoSeleccionado?.campo_id ?? ''}
      disabled={!disponible || estado !== 'exito' || campos.length === 0}
      aria-busy={cargando}
      aria-describedby={error || cargando ? `${id}-estado` : undefined}
      onChange={(evento) => seleccionarCampo(evento.target.value)}
    >
      {campoSeleccionado
        ? campos.map((campo) => <option key={campo.campo_id} value={campo.campo_id}>{campo.nombre}</option>)
        : <option value="">{mensaje}</option>}
    </select>
    {cargando && <span id={`${id}-estado`} className={estilos.estado} role="status">Cargando campos…</span>}
    {error && <div id={`${id}-estado`} className={estilos.estado} role="alert">
      No se pudieron cargar los campos.{' '}
      <button type="button" onClick={reintentar}>Reintentar campos</button>
    </div>}
  </div>
}
