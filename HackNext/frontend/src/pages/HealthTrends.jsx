import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import HistoryChart from '../components/HistoryChart'
import { BIOMARKER_INFO } from '../components/BiomarkerTooltip'
import { getAnalytics } from '../utils/api'

// Biomarkers to display as explainer cards
const BIOMARKER_KEYS = [
  'pitchVariation',
  'speechRate',
  'pausePatterns',
  'tremors',
  'breathlessness',
]

export default function HealthTrends() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getAnalytics().then(res => setSummary(res.data.data))
  }, [])

  const stats = summary?.stats || { avgHealthScore: 0, dominantSentiment: 'STABLE', totalEntries: 0 }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto" id="main-content">
        <div className="mb-8">
          <h1 className="font-display text-display-sm text-on-surface">Health Trends</h1>
          <p className="mt-2 font-body text-body-lg text-on-surface-variant max-w-lg">
            Track your vocal health patterns and clinical insights over time.
            Each biomarker is explained below.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* ── Chart ── */}
          <HistoryChart />

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-clinical flex flex-col items-center gap-3 py-10 animate-slide-up">
              <span className="material-symbols-outlined text-4xl text-primary">trending_up</span>
              <span className="font-headline text-headline-md text-on-surface">
                {stats.avgHealthScore}%
              </span>
              <span className="font-label text-label-lg text-on-surface-variant">Avg Health Score</span>
              <p className="font-body text-body-sm text-on-surface-variant text-center px-2">
                Composite of all vocal biomarkers over time
              </p>
            </div>
            <div className="card-clinical flex flex-col items-center gap-3 py-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="material-symbols-outlined text-4xl text-secondary">mood</span>
              <span className="font-headline text-headline-md text-on-surface">
                {stats.dominantSentiment}
              </span>
              <span className="font-label text-label-lg text-on-surface-variant">Dominant Sentiment</span>
              <p className="font-body text-body-sm text-on-surface-variant text-center px-2">
                Most common emotional tone in your recordings
              </p>
            </div>
            <div className="card-clinical flex flex-col items-center gap-3 py-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <span className="material-symbols-outlined text-4xl text-tertiary">calendar_month</span>
              <span className="font-headline text-headline-md text-on-surface">
                {stats.totalEntries}
              </span>
              <span className="font-label text-label-lg text-on-surface-variant">Total Entries</span>
              <p className="font-body text-body-sm text-on-surface-variant text-center px-2">
                Number of voice recordings analyzed
              </p>
            </div>
          </div>

          {/* ── Biomarker Explainer Panel ── */}
          <div>
            <h2 className="font-headline text-headline-sm text-on-surface mb-2">
              Understanding Your Vocal Biomarkers
            </h2>
            <p className="font-body text-body-lg text-on-surface-variant mb-6 max-w-2xl">
              These are the key health indicators extracted from your voice. Each biomarker provides
              clinical insight relevant to conditions like Parkinson's, Asthma, Depression, and
              post-stroke recovery.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BIOMARKER_KEYS.map((key, i) => {
                const info = BIOMARKER_INFO[key]
                if (!info) return null
                return (
                  <div
                    key={key}
                    className="card-clinical flex flex-col gap-4 animate-slide-up"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {/* Icon + Title */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          {info.icon}
                        </span>
                      </div>
                      <h3 className="font-headline text-title-md text-on-surface">
                        {info.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="font-body text-body-md text-on-surface-variant leading-relaxed">
                      {info.description}
                    </p>

                    {/* Abnormal indicator */}
                    <div className="flex items-start gap-2 p-3 bg-tertiary-fixed/20 rounded-xl">
                      <span className="material-symbols-outlined text-tertiary text-lg mt-0.5 flex-shrink-0">
                        warning
                      </span>
                      <p className="font-body text-body-sm text-on-surface leading-relaxed">
                        <span className="font-semibold">Concern: </span>
                        {info.abnormal}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
