import axios from 'axios'

export const BACKEND_ORIGIN = 'https://backend-deploy-jrip.onrender.com'
export const DEFAULT_USER_ID = 'demo-user'

export function toAbsoluteFileUrl(fileUrl) {
  if (!fileUrl) return null
  return fileUrl.startsWith('http') ? fileUrl : `${BACKEND_ORIGIN}${fileUrl}`
}

export function deriveHealthScore(analysis = {}) {
  const risk = analysis.risk_level?.toLowerCase()

  if (risk === 'high') return 30
  if (risk === 'medium') return 58
  return 86
}

export function normalizeAnalysisPayload(payload = {}) {
  const source = payload.analysis ? { ...payload, ...payload.analysis } : payload

  return {
    recordingId: source.recordingId || null,
    userId: source.userId || null,
    createdAt: source.createdAt || source.timestamp || null,
    fileUrl: source.fileUrl || null,
    pitch: source.pitch ?? null,
    tremor: source.tremor ?? null,
    breathlessness: source.breathlessness ?? null,
    speech_rate: source.speech_rate ?? null,
    risk_level: source.risk_level || 'low',
    risk_score: source.risk_score ?? source.healthScore ?? 0,
  }
}

const api = axios.create({
  baseURL: `${BACKEND_ORIGIN}`, // Ensure we point to the correct backend
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
  },
})

export async function uploadRecording(audioBlob, userId = DEFAULT_USER_ID) {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('userId', userId)

  return api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function getAnalysis(recordingId) {
  return api.get(`/api/analysis/${recordingId}`)
}

export async function getHistory(userId = DEFAULT_USER_ID) {
  return api.get(`/api/history/${userId}`)
}

export async function getAnalytics(userId = DEFAULT_USER_ID) {
  return api.get(`/api/analytics/${userId}`)
}

export async function getClinicalReport(userId = DEFAULT_USER_ID) {
  return api.get(`/api/analytics/report/${userId}`)
}

export default api
