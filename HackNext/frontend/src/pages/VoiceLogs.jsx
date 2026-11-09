import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { getHistory, normalizeAnalysisPayload, toAbsoluteFileUrl } from '../utils/api'

export default function VoiceLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory()
      .then((res) => {
        const recordings = res.data?.data?.recordings || res.data?.history || res.data || []
        setLogs(recordings.map((entry) => normalizeAnalysisPayload(entry)))
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="font-display text-display-sm text-on-surface">Voice Logs</h1>
          <p className="mt-1 font-body text-body-lg text-on-surface-variant">
            Browse and replay all your recorded voice entries
          </p>
        </div>

        {loading ? (
          <div className="card-clinical flex items-center justify-center py-16">
            <span className="material-symbols-outlined text-3xl text-outline-variant animate-spin">
              progress_activity
            </span>
          </div>
        ) : logs.length === 0 ? (
          <div className="card-clinical flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
            <span className="material-symbols-outlined text-5xl text-outline-variant">mic_off</span>
            <h3 className="font-headline text-title-lg text-on-surface">No recordings yet</h3>
            <p className="font-body text-body-md text-on-surface-variant">
              Head to the <a href="/" className="text-primary underline">Dashboard</a> to record your first voice entry.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {logs.map((log, i) => {
              const audioSrc = toAbsoluteFileUrl(log.fileUrl)
              return (
                <div key={log.recordingId || i} className="card-clinical flex flex-col gap-3 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-lg">mic</span>
                      </div>
                      <div>
                        <p className="font-label text-title-sm text-on-surface">
                          {log.recordingId ? `Recording ${log.recordingId.slice(0, 6)}` : `Recording ${i + 1}`}
                        </p>
                        <p className="font-label text-label-md text-on-surface-variant">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                        </p>
                      </div>
                    </div>
                    {log.risk_level && (
                      <span className={`px-3 py-1 rounded-full font-label text-label-sm ${
                        log.risk_level.toLowerCase() === 'low'
                          ? 'bg-secondary-fixed text-secondary'
                          : log.risk_level.toLowerCase() === 'high'
                          ? 'bg-tertiary-fixed text-tertiary'
                          : 'bg-primary-fixed text-primary'
                      }`}>
                        {log.risk_level}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-on-surface-variant">
                    <span>Pitch: {log.pitch ?? 'N/A'}</span>
                    <span>Tremor: {log.tremor ?? 'N/A'}</span>
                    <span>Breathlessness: {log.breathlessness ?? 'N/A'}</span>
                    <span>Speech Rate: {log.speech_rate ?? 'N/A'}</span>
                  </div>

                  {log.fileUrl && (
                    <audio controls src={audioSrc} className="w-full h-10" preload="metadata" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
