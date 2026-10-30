import { guardarToken } from '../api/sesion'
import { CAMPOS } from '../mocks/data/db'

export function prepararCampoPrueba(campoId = 'campo_el_molino') {
  const campo = CAMPOS.find((campo) => campo.campo_id === campoId)!
  guardarToken(campo.cliente_id === 'cliente_horizonte_verde' ? 'token-demo' : 'token-demo-lucia', 'demo')
}
