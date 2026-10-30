import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './app/AuthContext'
import { router } from './app/router'
import { Analytics } from "@vercel/analytics/next"

export default function App() {
  return (
    <AuthProvider>
      <Analytics />
      <RouterProvider router={router} />
    </AuthProvider>
  )
}