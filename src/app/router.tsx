import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import AlertasPage from '../pages/AlertasPage/AlertasPage'
import AreaDetallePage from '../pages/AreaDetallePage/AreaDetallePage'
import AreasPage from '../pages/AreasPage/AreasPage'
import DashboardPage from '../pages/DashboardPage/DashboardPage'
import HistoricoPage from '../pages/HistoricoPage/HistoricoPage'
import LoginPage from '../pages/LoginPage/LoginPage'
import MapaPage from '../pages/MapaPage/MapaPage'
import NoEncontradaPage from '../pages/NoEncontradaPage/NoEncontradaPage'
import SensorDetallePage from '../pages/SensorDetallePage/SensorDetallePage'
import { RutaProtegida, RutaSoloPublica } from './RutasProtegidas'

export const router = createBrowserRouter([
  {
    element: <RutaSoloPublica />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <RutaProtegida />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/areas', element: <AreasPage /> },
          { path: '/areas/:areaId', element: <AreaDetallePage /> },
          { path: '/sensores/:deviceId', element: <SensorDetallePage /> },
          { path: '/sensores/:deviceId/historico', element: <HistoricoPage /> },
          { path: '/mapa', element: <MapaPage /> },
          { path: '/alertas', element: <AlertasPage /> },
          { path: '*', element: <NoEncontradaPage /> },
        ],
      },
    ],
  },
])