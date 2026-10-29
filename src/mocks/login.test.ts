import { describe, expect, it } from 'vitest'
import { apiFetch } from '../api/client'
import type { LoginRespuesta } from '../types/auth'
import { EMAIL_DEMO, PASSWORD_DEMO } from './handlers/login'

function iniciarSesion(email: string, password: string) {
  return apiFetch<LoginRespuesta>('/auth/login', {
    method: 'POST',
    body: { email, password },
    sinSesion: true,
  })
}

describe('POST /auth/login (mock)', () => {
  it('devuelve un token con las credenciales de prueba', async () => {
    const respuesta = await iniciarSesion(EMAIL_DEMO, PASSWORD_DEMO)
    expect(respuesta.token).toBeTruthy()
  })

  it('rechaza una contraseña incorrecta con 401', async () => {
    await expect(iniciarSesion(EMAIL_DEMO, 'otra-clave')).rejects.toMatchObject({ estado: 401 })
  })

  it('rechaza un email desconocido con 401', async () => {
    await expect(iniciarSesion('otro@agro.com', PASSWORD_DEMO)).rejects.toMatchObject({
      estado: 401,
    })
  })
})