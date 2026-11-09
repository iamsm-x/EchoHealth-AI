import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'mic', label: 'Voice Logs', to: '/voice-logs' },
  { icon: 'insights', label: 'Health Trends', to: '/health-trends' },
  { icon: 'help_center', label: 'Support', to: '/support' },
]

export default function Sidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col w-72 bg-surface-container-low min-h-screen p-6 gap-8"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-soft">
          <span className="material-symbols-outlined text-on-primary text-2xl">
            local_hospital
          </span>
        </div>
        <div>
          <h1 className="font-headline text-title-lg text-on-surface">Patient Portal</h1>
          <p className="font-label text-label-md text-on-surface-variant">Vocal Health Diary</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-1.5" aria-label="Sidebar navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            aria-label={item.label}
            className={({ isActive }) => `
              flex items-center gap-3 px-5 py-4 rounded-2xl min-h-[56px]
              font-label text-title-sm
              transition-all duration-200
              ${
                isActive
                  ? 'bg-primary-fixed text-primary shadow-soft font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface'
              }
            `}
          >
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Privacy Notice ── */}
      <div className="p-5 bg-surface-container-lowest rounded-2xl">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary text-xl mt-0.5">
            encrypted
          </span>
          <p className="font-body text-body-md text-on-surface-variant leading-relaxed">
            Your data is encrypted. Clinical analysis is performed on-device to prioritize your privacy.
          </p>
        </div>
      </div>
    </aside>
  )
}
