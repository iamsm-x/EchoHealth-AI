import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import VoiceLogs from './pages/VoiceLogs'
import HealthTrends from './pages/HealthTrends'
import Support from './pages/Support'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/voice-logs" element={<VoiceLogs />} />
        <Route path="/health-trends" element={<HealthTrends />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
