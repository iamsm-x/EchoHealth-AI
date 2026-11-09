import { useState, useRef, useEffect } from 'react'

export const BIOMARKER_INFO = {
  healthScore: {
    title: 'Health Score',
    icon: 'favorite',
    description:
      'A simple summary score derived from your current risk level and biomarker pattern, used to make daily trends easier to read.',
    abnormal:
      'A low score means today\'s recording looks noticeably different from your healthier baseline and should be monitored.',
  },
  pitch: {
    title: 'Pitch',
    icon: 'graphic_eq',
    description:
      'Measures the average frequency of your voice in Hertz. Tracking pitch over time can reveal monotone speech or unusual shifts.',
    abnormal:
      'Reduced variation or unusual drops in pitch can be associated with depression, fatigue, or neurological changes.',
  },
  speechRate: {
    title: 'Speech Rate',
    icon: 'speed',
    description:
      'Shows how quickly your voice patterns occur during speech. Changes over time can highlight slowing, strain, or agitation.',
    abnormal:
      'Unusually slow speech may suggest motor or cognitive difficulty, while unusually fast speech can reflect stress or anxiety.',
  },
  tremor: {
    title: 'Tremor',
    icon: 'vibration',
    description:
      'Detects instability or shakiness in vocal frequency that may point to reduced control in the speech system.',
    abnormal:
      'Persistent vocal tremor can be a useful marker for conditions such as Parkinson\'s disease or essential tremor.',
  },
  breathlessness: {
    title: 'Breathlessness',
    icon: 'airwave',
    description:
      'Estimates signs of shortness of breath in speech, such as reduced vocal energy or the need to pause for air.',
    abnormal:
      'Higher breathlessness may reflect respiratory strain, asthma, cardiovascular stress, or fatigue.',
  },
}

export default function BiomarkerTooltip({ biomarkerKey, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipRef = useRef(null)
  const info = BIOMARKER_INFO[biomarkerKey]

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (!info) return null

  return (
    <div className={`relative inline-flex ${className}`} ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          w-8 h-8 min-w-[32px] rounded-full
          flex items-center justify-center
          text-on-surface-variant hover:text-primary
          hover:bg-primary-fixed
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed
        "
        aria-label={`Learn about ${info.title}`}
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-lg">info</span>
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="
            absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
            w-72 sm:w-80 p-5
            bg-surface-container-lowest rounded-2xl shadow-whisper
            border border-outline-variant/15
            animate-fade-in
          "
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">
              {info.icon}
            </span>
            <span className="font-headline text-title-md text-on-surface">
              {info.title}
            </span>
          </div>

          <p className="font-body text-body-md text-on-surface leading-relaxed mb-3">
            {info.description}
          </p>

          <div className="flex items-start gap-2 p-3 bg-tertiary-fixed/30 rounded-xl">
            <span className="material-symbols-outlined text-tertiary text-lg mt-0.5 flex-shrink-0">
              warning
            </span>
            <p className="font-body text-body-sm text-on-surface leading-relaxed">
              <span className="font-semibold">When to be concerned: </span>
              {info.abnormal}
            </p>
          </div>

          <p className="mt-3 font-label text-label-sm text-on-surface-variant text-center">
            Tap anywhere to close
          </p>
        </div>
      )}
    </div>
  )
}
