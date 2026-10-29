import { useParams } from 'react-router-dom'

interface Props {
  nombre: string
  issue: string
}

// Pantalla de relleno: cada Issue la reemplaza por la pantalla real.
export default function PaginaProvisoria({ nombre, issue }: Props) {
  const parametros = useParams()
  const hayParametros = Object.keys(parametros).length > 0

  return (
    <section>
      <h1>{nombre}</h1>
      <p>Pantalla provisoria del Issue {issue}. Se reemplaza al implementarlo.</p>
      {hayParametros && (
        <p>
          Parámetros: <code>{JSON.stringify(parametros)}</code>
        </p>
      )}
    </section>
  )
}