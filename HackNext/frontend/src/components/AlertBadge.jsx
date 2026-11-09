const SEVERITY_CONFIG = {
  critical: {
    bg: 'bg-error-container',
    border: 'border-error/20',
    icon: 'emergency',
    iconColor: 'text-error',
    textColor: 'text-on-surface',
    label: 'Abnormal Pattern Detected',
    description: 'One or more biomarkers are outside the normal range. Please share this report with your clinician.',
  },
  warning: {
    bg: 'bg-tertiary-fixed/40',
    border: 'border-tertiary/20',
    icon: 'warning',
    iconColor: 'text-tertiary',
    textColor: 'text-on-surface',
    label: 'Needs Attention',
    description: 'Some indicators are trending below normal. Continue monitoring and consult your clinician if symptoms persist.',
  },
  normal: {
    bg: 'bg-secondary-fixed/40',
    border: 'border-secondary/20',
    icon: 'check_circle',
    iconColor: 'text-secondary',
    textColor: 'text-on-surface',
    label: 'Within Normal Range',
    description: 'All biomarkers appear normal. Keep recording regularly to maintain your health trend.',
  },
}

export function getSeverity(analysis) {
  if (!analysis) return null

  const riskLevel = analysis.risk_level?.toLowerCase()
  const { healthScore } = analysis

  if (riskLevel === 'high' || (healthScore != null && healthScore < 40)) {
    return 'critical'
  }

  if (riskLevel === 'medium' || (healthScore != null && healthScore < 60)) {
    return 'warning'
  }

  return 'normal'
}

export default function AlertBadge({ severity, compact = false, className = '' }) {
  const config = SEVERITY_CONFIG[severity]
  if (!config) return null

  if (compact) {
    return (
      <div
        className={`
          inline-flex items-center gap-2 px-4 py-2
          ${config.bg} ${config.border} border
          rounded-full animate-fade-in ${className}
        `}
        role="alert"
      >
        <span className={`material-symbols-outlined text-lg ${config.iconColor}`}>
          {config.icon}
        </span>
        <span className={`font-label text-label-lg ${config.textColor}`}>
          {config.label}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`
        flex items-start gap-4 p-5
        ${config.bg} ${config.border} border
        rounded-2xl animate-slide-up ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${severity === 'critical' ? 'bg-error/10' : severity === 'warning' ? 'bg-tertiary/10' : 'bg-secondary/10'}
        `}
      >
        <span className={`material-symbols-outlined text-2xl ${config.iconColor}`}>
          {config.icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-headline text-title-md ${config.textColor}`}>
          {config.label}
        </h4>
        <p className="mt-1 font-body text-body-md text-on-surface-variant leading-relaxed">
          {config.description}
        </p>
      </div>
    </div>
  )
}
