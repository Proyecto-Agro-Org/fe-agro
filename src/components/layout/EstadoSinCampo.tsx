import { useCampo } from '../../app/campo'
import { EmptyState } from '../ui/EmptyState'
import { ErrorBlock } from '../ui/ErrorBlock'
import { Spinner } from '../ui/Spinner'

export function EstadoSinCampo({ titulo }: { titulo: string }) {
  const { estado, disponible, reintentar } = useCampo()
  return <section>
    <h1>{titulo}</h1>
    {!disponible ? <EmptyState titulo="Los campos todavía no están disponibles" />
      : estado === 'cargando' ? <Spinner etiqueta="Cargando campos…" />
      : estado === 'error' ? <ErrorBlock mensaje="No se pudieron cargar los campos." onReintentar={reintentar} />
      : <EmptyState titulo="No tenés campos disponibles" />}
  </section>
}
