import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { getHistory, normalizeAnalysisPayload } from '../utils/api'

const METRICS = [
  { key: 'pitch', label: 'Pitch', color: '#003fb1', gradient: 'primary' },
  { key: 'speech_rate', label: 'Speech Rate', color: '#006c4b', gradient: 'secondary' },
  { key: 'tremor', label: 'Tremor', color: '#882800', gradient: 'tertiary' },
]

function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="glass-bar px-5 py-4 border border-outline-variant/15">
      <p className="font-label text-label-lg text-on-surface-variant mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 font-body text-body-md mb-1">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-on-surface-variant">{entry.name}:</span>
          <span className="text-on-surface font-semibold">
            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function HistoryChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeMetrics, setActiveMetrics] = useState(
    METRICS.reduce((acc, metric) => ({ ...acc, [metric.key]: true }), {})
  )

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    setLoading(true)
    setError(null)
    try {
      const res = await getHistory()
      const recordings = res.data?.data?.recordings || res.data?.history || res.data || []
      const history = recordings.map((entry) => {
        const flat = normalizeAnalysisPayload(entry)
        return {
          ...flat,
          date: formatDate(flat.createdAt || Date.now()),
        }
      })
      setData(history)
    } catch (err) {
      setError('Unable to load history.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleMetric = (key) => {
    setActiveMetrics((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) {
    return (
      <div className="card-clinical flex items-center justify-center py-20 animate-fade-in">
        <span className="material-symbols-outlined text-4xl text-outline-variant animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-clinical flex flex-col items-center justify-center py-16 gap-5">
        <span className="material-symbols-outlined text-5xl text-error">cloud_off</span>
        <p className="font-body text-body-lg text-on-surface-variant">{error}</p>
        <button onClick={fetchHistory} className="btn-outline touch-target">
          <span className="material-symbols-outlined text-xl">refresh</span>
          Retry
        </button>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="card-clinical flex flex-col items-center justify-center py-16 gap-5 animate-fade-in">
        <span className="material-symbols-outlined text-6xl text-outline-variant">
          show_chart
        </span>
        <div className="text-center">
          <h3 className="font-headline text-headline-sm text-on-surface">Health Trends</h3>
          <p className="mt-2 font-body text-body-lg text-on-surface-variant max-w-sm">
            Your health trends will appear here after multiple recordings. Keep recording daily!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-clinical flex flex-col gap-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-headline text-headline-sm text-on-surface">Health Trends</h3>

        <div className="flex items-center gap-2 flex-wrap">
          {METRICS.map((metric) => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full font-label text-label-lg
                transition-all duration-200 min-h-[44px]
                ${
                  activeMetrics[metric.key]
                    ? 'bg-primary-fixed text-primary shadow-soft'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }
              `}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeMetrics[metric.key] ? metric.color : '#c3c5d7' }}
              />
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-80 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-primary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#003fb1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#003fb1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-secondary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006c4b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#006c4b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-tertiary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#882800" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#882800" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 14, fill: '#434654', fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={{ stroke: '#e1e3e4' }}
            />
            <YAxis
              tick={{ fontSize: 14, fill: '#434654', fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: 14, fontFamily: 'Inter', paddingTop: '12px' }}
            />

            {activeMetrics.pitch && (
              <Area
                type="monotone"
                dataKey="pitch"
                name="Pitch"
                stroke="#003fb1"
                strokeWidth={3}
                fill="url(#grad-primary)"
                dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 7, strokeWidth: 2 }}
              />
            )}
            {activeMetrics.speech_rate && (
              <Area
                type="monotone"
                dataKey="speech_rate"
                name="Speech Rate"
                stroke="#006c4b"
                strokeWidth={3}
                fill="url(#grad-secondary)"
                dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 7, strokeWidth: 2 }}
              />
            )}
            {activeMetrics.tremor && (
              <Area
                type="monotone"
                dataKey="tremor"
                name="Tremor"
                stroke="#882800"
                strokeWidth={3}
                fill="url(#grad-tertiary)"
                dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 7, strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
