import { toAbsoluteFileUrl } from '../utils/api'
import BiomarkerTooltip from './BiomarkerTooltip'
import AlertBadge, { getSeverity } from './AlertBadge'

function HealthGauge({ score }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const percent = Math.min(Math.max(score || 0, 0), 100) / 100
  const offset = circumference - percent * circumference

  let strokeColor = '#006c4b'
  let bgLabel = 'Normal'
  if (score < 40) {
    strokeColor = '#ba1a1a'
    bgLabel = 'Low'
  } else if (score < 60) {
    strokeColor = '#882800'
    bgLabel = 'Caution'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} stroke="#e1e3e4" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-animate"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline text-headline-md text-on-surface leading-none">
            {score}
          </span>
          <span className="font-label text-label-sm text-on-surface-variant">/100</span>
        </div>
      </div>
      <span
        className={`
          px-3 py-1 rounded-full font-label text-label-md
          ${score < 40 ? 'bg-error-container text-error' : score < 60 ? 'bg-tertiary-fixed text-tertiary' : 'bg-secondary-fixed text-secondary'}
        `}
      >
        {bgLabel}
      </span>
    </div>
  )
}

export default function CurrentAnalysisCard({ analysis }) {
  if (!analysis) {
    return (
      <div className="card-clinical flex flex-col items-center justify-center py-16 gap-5 animate-fade-in">
        <span className="material-symbols-outlined text-6xl text-outline-variant">
          query_stats
        </span>
        <div className="text-center">
          <h3 className="font-headline text-headline-sm text-on-surface">
            Latest Analysis
          </h3>
          <p className="mt-2 font-body text-body-lg text-on-surface-variant max-w-sm">
            Record a voice entry to see your clinical analysis and biomarker results here.
          </p>
        </div>
      </div>
    )
  }

  const {
    fileUrl,
    healthScore,
    pitch,
    tremor,
    breathlessness,
    speech_rate,
    risk_level,
    createdAt,
  } = analysis

  const audioSrc = toAbsoluteFileUrl(fileUrl)
  const severity = getSeverity(analysis)
  const riskLevelColors = {
    low: 'bg-secondary-fixed text-secondary',
    medium: 'bg-tertiary-fixed text-tertiary',
    high: 'bg-error-container text-error',
  }
  const riskBadge = riskLevelColors[risk_level?.toLowerCase()] || riskLevelColors.low

  const biomarkerCards = [
    { key: 'pitch', label: 'Pitch', value: pitch, suffix: 'Hz' },
    { key: 'tremor', label: 'Tremor', value: tremor },
    { key: 'breathlessness', label: 'Breathlessness', value: breathlessness },
    { key: 'speechRate', label: 'Speech Rate', value: speech_rate, suffix: '/s' },
  ]

  return (
    <div className="card-clinical flex flex-col gap-6 animate-slide-up">
      {severity && severity !== 'normal' && <AlertBadge severity={severity} />}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-headline text-headline-sm text-on-surface">
          Latest Analysis
        </h3>
        {createdAt && (
          <span className="font-label text-label-lg text-on-surface-variant">
            {new Date(createdAt).toLocaleString()}
          </span>
        )}
      </div>

      {fileUrl && (
        <div className="p-4 bg-surface-container-low rounded-xl">
          <audio
            id="analysis-audio-player"
            controls
            src={audioSrc}
            className="w-full h-12"
            preload="metadata"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {healthScore != null && (
          <div className="flex flex-col items-center gap-2 p-5 bg-surface-container-low rounded-2xl">
            <div className="flex items-center gap-1 self-start">
              <span className="font-label text-label-lg text-on-surface-variant">Health Score</span>
              <BiomarkerTooltip biomarkerKey="healthScore" />
            </div>
            <HealthGauge score={healthScore} />
          </div>
        )}

        {risk_level && (
          <div className="flex flex-col items-start gap-3 p-5 bg-surface-container-low rounded-2xl">
            <div className="flex items-center gap-1">
              <span className="font-label text-label-lg text-on-surface-variant">Risk Level</span>
            </div>
            <span className={`px-4 py-2 rounded-full font-label text-title-sm uppercase ${riskBadge}`}>
              {risk_level}
            </span>
          </div>
        )}

        {biomarkerCards.map((metric) => (
          <div key={metric.key} className="flex flex-col items-start gap-3 p-5 bg-surface-container-low rounded-2xl">
            <div className="flex items-center gap-1">
              <span className="font-label text-label-lg text-on-surface-variant">{metric.label}</span>
              <BiomarkerTooltip biomarkerKey={metric.key} />
            </div>
            <span className="font-headline text-headline-sm text-on-surface">
              {metric.value != null ? `${metric.value}${metric.suffix ? ` ${metric.suffix}` : ''}` : 'N/A'}
            </span>
          </div>
        ))}
      </div>

      {severity === 'normal' && <AlertBadge severity="normal" compact />}
    </div>
  )
}
