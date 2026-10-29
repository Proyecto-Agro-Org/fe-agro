# Login — frontend #12

Formulario de usuario/email y contraseña con autocomplete. POST /api/v1/auth/login utiliza apiFetch con sinSesion: no envía tokens previos y un 401 se interpreta como credenciales inválidas. La contraseña se vacía ante 401 y se conserva el usuario. Un error de red o servidor permite Reintentar. Mientras envía se muestra el spinner y se evita doble envío. La ruta pública redirige al Dashboard al guardar el token en la sesión existente. Si la sesión expiró se muestra el aviso.

## Probar con mocks

En frontend: npm ci, copiar .env.example a .env (VITE_USE_MOCKS=true) y npm run dev. Abrir /login. Las credenciales exclusivamente de ejemplo son demo@agro.com / demo1234. Una contraseña distinta produce el mensaje genérico. Con ?mock=offline:login y recarga se muestra error de conexión; con ?mock=lento:login se puede comprobar el botón deshabilitado. Cerrar sesión en el menú vuelve al login.

Ejecutar npm test, npm run lint y npm run build. El login usa los tokens de acciones y la configuración de Vitest integrados en el PR #30.

La autenticación real y el aislamiento de datos por cliente corresponden al backend. token-demo y estas credenciales pertenecen únicamente al mock; no prueban autenticación ni autorización real. Este PR no completa el issue #12 de extremo a extremo.
