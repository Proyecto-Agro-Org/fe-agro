import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../app/auth'
import { CampoProvider } from '../../app/CampoProvider'
import { useAlertasActivas } from '../../hooks/useAlertasActivas'
import { Breadcrumb } from './Breadcrumb'
import { BreadcrumbProvider } from './BreadcrumbProvider'
import { SelectorCampo } from './SelectorCampo'
import estilos from './AppLayout.module.css'

interface EnlaceMenu {
  a: string
  texto: string
  icono: string
  // Rutas en las que el ítem se resalta. Áreas también cubre sensores e históricos.
  activoEn: string[]
}

const ENLACES: EnlaceMenu[] = [
  { a: '/dashboard', texto: 'Dashboard', icono: 'dashboard', activoEn: ['/dashboard'] },
  { a: '/areas', texto: 'Áreas', icono: 'areas', activoEn: ['/areas', '/sensores'] },
  { a: '/mapa', texto: 'Mapa', icono: 'mapa', activoEn: ['/mapa'] },
  { a: '/alertas', texto: 'Alertas', icono: 'alertas', activoEn: ['/alertas'] },
]

function estaActivo(pathname: string, prefijos: string[]): boolean {
  return prefijos.some((prefijo) => pathname === prefijo || pathname.startsWith(`${prefijo}/`))
}

export default function AppLayout() {
  return <CampoProvider><ContenidoLayout /></CampoProvider>
}

function ContenidoLayout() {
  const { cerrarSesion, usuario, cliente } = useAuth()
  const { pathname } = useLocation()
  const alertasActivas = useAlertasActivas()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <BreadcrumbProvider>
      <div className={estilos.app}>
        <header className={estilos.barra}>
          <p className={estilos.marca}>Monitoreo del suelo</p>
          <p className={estilos.marcaMovil}>Agro IoT</p>
          {usuario && cliente && (
            <div className={estilos.identidad} aria-label="Usuario y cliente de la sesión">
              <span className={estilos.usuario}>{usuario.nombre}</span>
              <span>{cliente.nombre}</span>
            </div>
          )}
          <SelectorCampo />
          <button
            type="button"
            className={estilos.botonMenu}
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            Menú
          </button>
        </header>

        <div className={`${estilos.cuerpo} ${menuAbierto ? estilos.cuerpoMenuAbierto : ''}`}>
          <nav
            id="menu-principal"
            className={`${estilos.menu} ${menuAbierto ? estilos.menuAbierto : ''}`}
            aria-label="Navegación principal"
          >
            <h2 className={estilos.tituloMovil}>Navegación</h2>
            <ul className={estilos.lista}>
              {ENLACES.map((enlace) => (
                <li key={enlace.a}>
                  <Link
                    to={enlace.a}
                    className={estilos.enlace}
                    aria-current={estaActivo(pathname, enlace.activoEn) ? 'page' : undefined}
                    onClick={cerrarMenu}
                  >
                    <img
                      className={estilos.icono}
                      src={`/icons/navigation/${enlace.icono}.svg`}
                      alt=""
                      aria-hidden="true"
                    />
                    <span>{enlace.texto}</span>
                    {enlace.a === '/alertas' && alertasActivas > 0 && (
                      <span className={estilos.insignia} aria-label={`${alertasActivas} activas`}>
                        {alertasActivas}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
              <li>
                <span className={estilos.deshabilitado} aria-disabled="true">
                  <img
                    className={estilos.icono}
                    src="/icons/navigation/analisis.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <span>Análisis/IA</span>
                  <small className={estilos.proximamente}>Próximamente</small>
                </span>
              </li>
            </ul>

            <button type="button" className={estilos.cerrarSesion} onClick={cerrarSesion}>
              <img
                className={estilos.icono}
                src="/icons/navigation/salir.svg"
                alt=""
                aria-hidden="true"
              />
              <span>Cerrar sesión</span>
            </button>
          </nav>

          <main className={estilos.contenido}>
            <Breadcrumb />
            <Outlet />
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  )
}
