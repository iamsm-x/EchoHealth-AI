import Sidebar from '../components/Sidebar'

const FAQ = [
  {
    q: 'How does voice analysis work?',
    a: 'Our AI model processes your 15-second voice recording to extract vocal biomarkers including pitch variation, vocal tremors, breathlessness, speech rate, and pause patterns. These are compared against clinical baselines to assess your vocal health.',
  },
  {
    q: 'What is Pitch Variation?',
    a: 'Pitch variation measures the range and stability of your vocal pitch. Healthy speech has natural ups and downs. Reduced variation (monotone speech) is a common early indicator of Parkinson\'s disease or depression.',
  },
  {
    q: 'What are Pause Patterns?',
    a: 'The AI analyzes pauses between words and sentences. Long or irregular pauses can indicate word-finding difficulty, which is associated with cognitive decline, stroke recovery, or early dementia.',
  },
  {
    q: 'What does "Voice Tremors" mean?',
    a: 'Voice tremors are involuntary oscillations detected in the voice. They are a key biomarker for essential tremor and Parkinson\'s disease, and can help clinicians monitor disease progression.',
  },
  {
    q: 'How is Breathlessness detected?',
    a: 'The system identifies signs of shortness of breath such as frequent gasps, shortened phrases, or inability to complete sentences. This is especially relevant for asthma, COPD, and cardiovascular monitoring.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All recordings are encrypted in transit and at rest. Analysis is performed on-device whenever possible to protect your privacy. Your health data is never shared with third parties without your explicit consent.',
  },
  {
    q: 'How often should I record?',
    a: 'We recommend recording at least once daily — ideally in the morning — to build a reliable trend line of your vocal health. Consistent daily recordings produce the most accurate health trends.',
  },
  {
    q: 'What does the Health Score mean?',
    a: 'The Health Score (0–100) is a composite metric derived from all vocal biomarkers, including clarity, pitch stability, tremors, breathlessness, and speech rate. A score above 70 is considered within normal range.',
  },
  {
    q: 'When should I contact my doctor?',
    a: 'If your app shows an "Abnormal Pattern Detected" alert, or your Health Score consistently falls below 40, please share your results with your clinician. This tool supplements — not replaces — professional medical advice.',
  },
]

export default function Support() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto" id="main-content">
        <div className="mb-8">
          <h1 className="font-display text-display-sm text-on-surface">Support</h1>
          <p className="mt-2 font-body text-body-lg text-on-surface-variant">
            Frequently asked questions about your vocal health analysis
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-3xl">
          {FAQ.map((item, i) => (
            <details
              key={i}
              className="card-clinical group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <summary className="flex items-center justify-between gap-3 font-headline text-title-md text-on-surface list-none min-h-[56px] py-1">
                <span className="leading-snug">{item.q}</span>
                <span className="material-symbols-outlined text-outline text-2xl transition-transform duration-200 group-open:rotate-180 flex-shrink-0">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 font-body text-body-lg text-on-surface-variant leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}

          {/* ── Emergency Notice ── */}
          <div
            className="flex items-start gap-4 p-6 bg-error-container rounded-2xl border border-error/15 mt-4 animate-slide-up"
            role="alert"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-error text-3xl">
                emergency
              </span>
            </div>
            <div>
              <h3 className="font-headline text-title-lg text-on-surface">
                Medical Emergency?
              </h3>
              <p className="mt-1 font-body text-body-lg text-on-surface-variant leading-relaxed">
                This app is a <strong>health monitoring tool</strong> and does not replace emergency
                medical care. If you experience sudden difficulty breathing, chest pain, or stroke
                symptoms, <strong>call emergency services immediately</strong>.
              </p>
            </div>
          </div>

          {/* ── Contact Card ── */}
          <div className="card-clinical flex items-start gap-4 mt-2 animate-slide-up" style={{ animationDelay: '0.65s' }}>
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-3xl">mail</span>
            </div>
            <div>
              <h3 className="font-headline text-title-lg text-on-surface">Still need help?</h3>
              <p className="mt-1 font-body text-body-lg text-on-surface-variant">
                Reach out to our clinical support team at{' '}
                <a
                  href="mailto:support@vocalhealth.app"
                  className="text-primary underline font-semibold"
                >
                  support@vocalhealth.app
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
