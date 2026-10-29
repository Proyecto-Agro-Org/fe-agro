import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { divIcon, latLngBounds } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatFechaHora, formatValor } from '../../lib/formato'
import type { SensorMapa } from '../../types/mapa'
import styles from './MapaPage.module.css'
const ICONOS = {
  conectado: divIcon({
    className: styles.pinConectado,
    html: '<span aria-hidden="true">●</span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  }),
  desconectado: divIcon({
    className: styles.pinDesconectado,
    html: '<span aria-hidden="true">×</span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  }),
}
function AjustarVista({ sensores }: { sensores: SensorMapa[] }) {
  const mapa = useMap()
  const coordenadas = JSON.stringify(sensores.map((s) => [s.ubicacion!.lat, s.ubicacion!.lon]))
  useEffect(() => {
    const puntos = JSON.parse(coordenadas) as [number, number][]
    if (puntos.length)
      mapa.fitBounds(latLngBounds(puntos), { padding: [35, 35], maxZoom: 18, animate: false })
  }, [mapa, coordenadas])
  return null
}
export default function MapaSensores({ sensores }: { sensores: SensorMapa[] }) {
  const [tilesFallidos, setTilesFallidos] = useState(false)
  return (
    <>
      <MapContainer
        className={styles.mapa}
        center={[-34.6, -58.42]}
        zoom={11}
        scrollWheelZoom={false}
        aria-label="Mapa de sensores"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTilesFallidos(true) }}
        />
        <AjustarVista sensores={sensores} />
        {sensores.map((sensor) => (
          <Marker
            key={sensor.device_id}
            position={[sensor.ubicacion!.lat, sensor.ubicacion!.lon]}
            icon={ICONOS[sensor.estado]}
            title={`${sensor.nombre} · ${sensor.estado}`}
            alt={sensor.nombre}
          >
            <Popup>
              <div className={styles.resumen}>
                <strong>{sensor.nombre}</strong>
                <span>{sensor.area_nombre}</span>
                <StatusBadge estado={sensor.estado} />
                <span>
                  Última comunicación:{' '}
                  {sensor.ultima_comunicacion
                    ? formatFechaHora(sensor.ultima_comunicacion)
                    : 'Sin comunicación registrada'}
                </span>
                {sensor.ultima_medicion ? (
                  <>
                    <span>Humedad: {formatValor(sensor.ultima_medicion.humedad)}</span>
                    <span>Temperatura: {formatValor(sensor.ultima_medicion.temperatura)}</span>
                    <span>Medición: {formatFechaHora(sensor.ultima_medicion.timestamp)}</span>
                  </>
                ) : (
                  <span>Sin mediciones</span>
                )}
                <Link to={`/sensores/${encodeURIComponent(sensor.device_id)}`}>
                  Ver detalle del sensor
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {tilesFallidos && (
        <p role="status" className={styles.avisoTiles}>
          No se pudo cargar parte del mapa base. Podés consultar los sensores en el listado
          inferior.
        </p>
      )}
    </>
  )
}
