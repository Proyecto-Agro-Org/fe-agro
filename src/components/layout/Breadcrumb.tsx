import { Link } from 'react-router-dom'
import { Skeleton } from '../ui/Skeleton'
import { useMigas } from './migas'
import styles from './Breadcrumb.module.css'

export function Breadcrumb() {
  const { items } = useMigas()
  if (items.length === 0) return null

  return (
    <nav aria-label="Migas de pan" className={styles.migas}>
      <ol className={styles.lista}>
        {items.map((item, indice) => {
          const esUltimo = indice === items.length - 1
          return (
            <li key={indice} className={styles.item}>
              {item.etiqueta === undefined ? (
                <span className={styles.cargando} role="status">
                  <Skeleton />
                </span>
              ) : item.a && !esUltimo ? (
                <Link to={item.a}>{item.etiqueta}</Link>
              ) : (
                <span aria-current={esUltimo ? 'page' : undefined}>
                  {item.etiqueta}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}