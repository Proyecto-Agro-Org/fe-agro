import { useState, type FormEvent } from 'react'
import { login } from '../../api/login'
import { useAuth } from '../../app/auth'
import { ErrorBlock } from '../../components/ui/ErrorBlock'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorApi } from '../../types/comun'
import styles from './LoginPage.module.css'

type ErrorLogin = 'credenciales' | 'conexion' | null

export default function LoginPage() {
  const { iniciarSesion, sesionExpirada } = useAuth()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ErrorLogin>(null)

  async function enviar() {
    // Evita el doble envío aunque el botón ya esté deshabilitado.
    if (enviando) return
    setEnviando(true)
    setError(null)
    try {
      const respuesta = await login({ email: usuario.trim(), password })
      // La redirección al Dashboard la hace RutaSoloPublica cuando aparece el token.
      iniciarSesion(respuesta.token)
    } catch (e) {
      if (e instanceof ErrorApi && e.estado === 401) {
        setError('credenciales')
        setPassword('')
      } else {
        setError('conexion')
      }
      setEnviando(false)
    }
  }

  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    void enviar()
  }

  return (
    <main className={styles.pagina}>
      <form className={styles.tarjeta} onSubmit={alEnviar}>
        <h1 className={styles.titulo}>Agro IoT</h1>
        <p className={styles.subtitulo}>Iniciá sesión para ver tus áreas</p>

        {sesionExpirada && (
          <p className={styles.aviso} role="status">
            Tu sesión expiró. Volvé a iniciar sesión.
          </p>
        )}

        <label className={styles.campo}>
          <span>Usuario o email</span>
          <input
            type="text"
            name="usuario"
            autoComplete="username"
            required
            value={usuario}
            onChange={(evento) => setUsuario(evento.target.value)}
          />
        </label>

        <div className={styles.campo}>
          <label htmlFor="password">Contraseña</label>
          <div className={styles.password}>
            <input
              id="password"
              type={mostrarPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
            />
            <button
              type="button"
              className={styles.verPassword}
              aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-controls="password"
              onClick={() => setMostrarPassword((visible) => !visible)}
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                {!mostrarPassword && <path d="m3 3 18 18" />}
              </svg>
            </button>
          </div>
        </div>

        {error === 'credenciales' && (
          <p className={styles.error} role="alert">
            Usuario o contraseña incorrectos
          </p>
        )}
        {error === 'conexion' && (
          <ErrorBlock
            mensaje="No se pudo conectar con el servidor."
            onReintentar={() => void enviar()}
          />
        )}

        <button type="submit" className={styles.boton} disabled={enviando}>
          <span className={styles.contenidoBoton}>
            <span style={{ visibility: enviando ? 'hidden' : 'visible' }} aria-hidden={enviando}>Ingresar</span>
            {enviando && <Spinner etiqueta="Ingresando…" />}
          </span>
        </button>
      </form>
    </main>
  )
}
