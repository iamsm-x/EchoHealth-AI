import { useState, useRef, useCallback, useEffect } from 'react'
import { uploadRecording } from '../utils/api'
import WaveformVisualizer from './WaveformVisualizer'

const MAX_DURATION = 15 // strict 15-second limit

// Three-step guided UX labels
const STEPS = [
  { num: 1, label: 'Press to Start' },
  { num: 2, label: 'Speak for 15 seconds' },
  { num: 3, label: 'See Your Results' },
]

export default function VoiceRecorder({ onAnalysisComplete }) {
  const [isRecording, setIsRecording] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(MAX_DURATION)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [didAutoStop, setDidAutoStop] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  // Count-down timer
  useEffect(() => {
    if (!isRecording) return
    setSecondsLeft(MAX_DURATION)

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopRecording(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording])

  const startRecording = useCallback(async () => {
    setError(null)
    setDidAutoStop(false)
    chunksRef.current = []
    setCurrentStep(2)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        // Stop all tracks so the mic indicator goes away
        stream.getTracks().forEach((t) => t.stop())

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await handleUpload(blob)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(250) // collect in 250ms chunks
      setIsRecording(true)

      // Hard stop after MAX_DURATION as a safety net
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop()
          setIsRecording(false)
          setDidAutoStop(true)
        }
      }, MAX_DURATION * 1000)
    } catch (err) {
      setError('Microphone access denied. Please allow mic permissions in your browser settings.')
      setCurrentStep(1)
      console.error('Mic error:', err)
    }
  }, [])

  const stopRecording = useCallback((autoStopped = false) => {
    clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    if (autoStopped) setDidAutoStop(true)
  }, [])

  const handleUpload = async (blob) => {
    setIsUploading(true)
    setCurrentStep(3)
    setError(null)
    try {
      const res = await uploadRecording(blob)
      onAnalysisComplete?.(res.data)
      setTimeout(() => setCurrentStep(1), 3000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Upload failed. Please try again.')
      setCurrentStep(1)
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  // Progress values
  const elapsed = MAX_DURATION - secondsLeft
  const progress = (elapsed / MAX_DURATION) * 100
  const circumference = 2 * Math.PI * 70 // larger ring radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div
      className={`
        glass-card flex flex-col items-center gap-8 py-10 px-6
        ${didAutoStop ? 'flash-stop' : ''}
      `}
      role="region"
      aria-label="Voice recording module"
    >
      {/* ── Guided Steps ── */}
      <div className="flex items-center gap-3 w-full max-w-md">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2 flex-1">
            <div
              className={`step-indicator flex-shrink-0 ${
                currentStep > step.num
                  ? 'step-done'
                  : currentStep === step.num
                  ? 'step-active'
                  : 'step-pending'
              }`}
            >
              {currentStep > step.num ? (
                <span className="material-symbols-outlined text-sm">check</span>
              ) : (
                step.num
              )}
            </div>
            <span
              className={`font-label text-label-md whitespace-nowrap ${
                currentStep === step.num
                  ? 'text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Title ── */}
      <div className="text-center">
        <h2 className="text-display-xs font-headline text-[var(--text-main)]">
          Clinical Sample Intake
        </h2>
        <p className="mt-2 font-body text-body-lg text-[var(--text-muted)] max-w-md">
          Speak clearly for <strong className="text-[var(--text-main)]">{MAX_DURATION} seconds</strong> for biomarker extraction.
        </p>
      </div>

      {/* ── Waveform Visualizer ── */}
      <div className="w-full h-24 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
        <WaveformVisualizer isRecording={isRecording} />
      </div>

      {/* ── Massive Pulse Button with Progress Ring ── */}
      <div className="relative flex items-center justify-center">
        <svg className="absolute w-44 h-44 -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
          {isRecording && (
            <circle
              cx="80" cy="80" r="70"
              stroke="var(--primary)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear shadow-glow-primary"
            />
          )}
        </svg>

        <button
          onClick={isRecording ? () => stopRecording(false) : startRecording}
          disabled={isUploading}
          className={`
            relative z-10 w-36 h-36 rounded-full
            flex flex-col items-center justify-center gap-1
            bg-[var(--primary)] text-white shadow-xl
            transition-all duration-300
            hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isRecording ? 'recording-pulse' : ''}
          `}
        >
          <span className="material-symbols-outlined text-5xl">
            {isUploading ? 'hourglass_top' : isRecording ? 'stop' : 'mic'}
          </span>
          {isRecording && (
            <span className="font-headline text-xl font-bold">{secondsLeft}s</span>
          )}
        </button>
      </div>

      {/* ── Status ── */}
      <div className="flex flex-col items-center gap-2 min-h-[40px]">
        {isRecording && (
          <span className="text-label-lg text-[var(--text-main)] animate-fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Analyzing audio stream...
          </span>
        )}
        {isUploading && (
          <span className="text-label-lg text-[var(--primary)] animate-pulse flex items-center gap-2">
            <span className="material-symbols-outlined animate-spin">sync</span>
            Extracting biomarkers...
          </span>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-accent text-body-sm w-full max-w-md">
          {error}
        </div>
      )}
    </div>
  )
}
