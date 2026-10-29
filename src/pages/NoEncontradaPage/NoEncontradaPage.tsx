import { Link } from 'react-router-dom'

export default function NoEncontradaPage() {
  return (
    <section>
      <h1>No encontramos esa página</h1>
      <p>
        <Link to="/dashboard">Volver al Dashboard</Link>
      </p>
    </section>
  )
}