import { Link } from 'react-router-dom'

export function NoEncontrado() {
  return (
    <section>
      <h1>No encontramos lo que buscás</h1>
      <Link to="/areas">Volver a Áreas</Link>
    </section>
  )
}
