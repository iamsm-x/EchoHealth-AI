import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import VoiceRecorder from '../components/VoiceRecorder'
import TrendChart from '../components/TrendChart'
import StatsGrid from '../components/StatsGrid'
import InsightAlert from '../components/InsightAlert'
import { getAnalytics, getClinicalReport } from '../utils/api'
import { generateClinicalPDF } from '../utils/pdfGenerator'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [doctorMode, setDoctorMode] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getAnalytics()
      setSummary(res.data.data)
    } catch (err) {
      console.error("Dashboard data load failed", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleAnalysisComplete = useCallback(() => {
    // Refresh all analytics when a new recording is finished
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await getClinicalReport()
      const reportData = res.data.data;
      
      if (!reportData) throw new Error("No data received");

      // Generate and trigger download of the PDF
      generateClinicalPDF(reportData);
      
    } catch (err) {
      console.error("PDF Export failed:", err);
      const errorDetail = err.response?.data?.message || err.message || "Unknown Error";
      alert(`⚠️ PDF Generation Failed: ${errorDetail}. \n\nCheck if you have recordings and the backend is reachable.`);
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={`flex min-h-screen text-[var(--text-main)] ${doctorMode ? 'doctor-theme' : ''}`}>
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto relative">
        {/* ── Dashboard Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-display-sm font-headline tracking-tight">
              Vocal Health <span className="text-[var(--primary)]">Intelligence</span>
            </h1>
            <p className="text-text-muted mt-1 font-body text-body-lg">
              {doctorMode ? 'Doctor Mode: Monitoring Patient A-102' : 'Patient Portal: Continuous Bio-Monitoring'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Doctor Mode Toggle */}
            <button 
              onClick={() => setDoctorMode(!doctorMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                doctorMode 
                ? 'bg-primary/20 border-primary text-primary' 
                : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {doctorMode ? 'visibility' : 'visibility_off'}
              </span>
              <span className="font-label text-label-md font-bold">Doctor Mode</span>
            </button>

            {/* Export Button */}
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
            >
              <span className="material-symbols-outlined">description</span>
              {isExporting ? 'Generating...' : 'Export Report'}
            </button>
          </div>
        </div>

        {summary && (
          <div className="animate-fade-in flex flex-col gap-8">
            {/* ── Quick Diagnostic (Primary Interaction) ── */}
            <div className="glass-card p-8 border-primary/30 bg-primary/5 shadow-glow-primary">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-display-xs font-headline tracking-tight">Quick Diagnostic</h3>
                  <p className="text-text-muted text-body-md mt-1">Record a new sample to update your metrics instantly.</p>
                </div>
                <span className="text-label-sm px-3 py-1 bg-primary/20 text-primary rounded-lg font-bold uppercase tracking-wider">Ready for Intake</span>
              </div>
              <VoiceRecorder onAnalysisComplete={handleAnalysisComplete} />
            </div>

            {/* ── Key Metrics Grid ── */}
            <StatsGrid summary={summary} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left Column: Analytics & Interactions */}
              <div className="xl:col-span-8 flex flex-col gap-8">
                <InsightAlert insights={summary.insights} alerts={summary.alerts} />
                <TrendChart data={summary.trends} />
              </div>

              {/* Right Column: Comparison & Details */}
              <div className="xl:col-span-4 flex flex-col gap-8">
                {/* Gamification Card */}
                <div className="glass-card p-6 bg-gradient-to-br from-secondary/20 to-transparent">
                  <h3 className="text-title-md font-headline mb-4">Achievements</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-glow-primary">
                      <span className="material-symbols-outlined text-secondary text-3xl">verified</span>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 opacity-50">
                      <span className="material-symbols-outlined text-text-muted text-3xl">military_tech</span>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 opacity-50">
                      <span className="material-symbols-outlined text-text-muted text-3xl">workspace_premium</span>
                    </div>
                  </div>
                  <p className="text-label-sm text-text-muted mt-4">Maintain a 7-day streak to unlock the <span className="text-secondary font-bold">Health Hero</span> badge.</p>
                </div>

                {/* Patient Log / History (Minimal) */}
                <div className="glass-card p-6">
                  <h3 className="text-title-md font-headline mb-4 tracking-tight">Recent Sessions</h3>
                  <div className="flex flex-col gap-4">
                    {summary.trends.slice().reverse().map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${item.score > 70 ? 'bg-risk-high' : item.score > 40 ? 'bg-risk-medium' : 'bg-risk-low'}`} />
                          <span className="text-body-md font-bold">{item.date}</span>
                        </div>
                        <span className="text-label-md opacity-60">{item.score}% Risk</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && !summary && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-deep/50 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-6xl text-primary animate-spin">data_saver_off</span>
              <p className="text-body-lg font-headline animate-pulse">Synchronizing Health Data...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
