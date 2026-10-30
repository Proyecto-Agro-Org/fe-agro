import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatFechaHora } from '../../lib/formato'
import type { HistoricoRespuesta } from '../../types/historico'
import styles from './HistoricoPage.module.css'
export default function GraficoHistorico({
  datos,
  nombre,
}: {
  datos: HistoricoRespuesta
  nombre: string
}) {
  return (
    <div
      className={styles.grafico}
      role="img"
      aria-label={`Gráfico de ${nombre}: ${datos.puntos.filter((p) => p.valor !== null).length} mediciones en ${datos.unidad}`}
    >
      <ResponsiveContainer width="100%" height={300} initialDimension={{ width: 800, height: 300 }}>
        <LineChart
          data={datos.puntos.map((p) => ({ ...p, instante: Date.parse(p.timestamp) }))}
          margin={{ top: 12, right: 24, bottom: 12, left: 0 }}
        >
          <CartesianGrid stroke="var(--color-grafico-rejilla)" vertical={false} />
          <XAxis
            dataKey="instante"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v) =>
              new Date(v).toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            stroke="var(--color-texto-suave)"
          />
          <YAxis stroke="var(--color-texto-suave)" width={50} />
          <Tooltip
            labelFormatter={(v) => formatFechaHora(new Date(Number(v)).toISOString())}
            contentStyle={{
              background: 'var(--color-superficie)',
              borderColor: 'var(--color-borde)',
              color: 'var(--color-texto)',
            }}
            labelStyle={{ color: 'var(--color-texto)' }}
          />
          <Line
            type="linear"
            dataKey="valor"
            name={`${nombre} (${datos.unidad})`}
            stroke="var(--color-acento)"
            strokeWidth={2}
            dot={datos.puntos.length === 1}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
