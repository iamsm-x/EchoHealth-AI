export default function StatsGrid({ summary }) {
  const { streak, baselineCompare, latest, prediction, stats: aggregatedStats } = summary;

  const stats = [
    {
      label: 'Avg Health Score',
      value: `${aggregatedStats?.avgHealthScore || 0}%`,
      subtitle: 'OVERALL WELLNESS',
      icon: 'trending_up',
      color: 'var(--primary)',
      isProgress: true,
      progress: aggregatedStats?.avgHealthScore || 0
    },
    {
      label: 'Dominant Sentiment',
      value: aggregatedStats?.dominantSentiment || 'STABLE',
      subtitle: 'MOST COMMON TONE',
      icon: 'mood',
      color: '#10b981'
    },
    {
      label: 'Total Entries',
      value: aggregatedStats?.totalEntries || 0,
      subtitle: 'SESSIONS ANALYZED',
      icon: 'calendar_today',
      color: '#a855f7'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-muted text-label-md uppercase tracking-wider">{stat.label}</p>
              <h2 className="text-display-sm font-headline" style={{ color: stat.color }}>{stat.value}</h2>
              <p className="text-text-muted text-label-lg font-bold mt-1">{stat.subtitle}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="material-symbols-outlined text-3xl" style={{ color: stat.color }}>
                {stat.icon}
              </span>
            </div>
          </div>
          
          {stat.isProgress && (
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${stat.progress}%`, 
                  backgroundColor: stat.progress > 70 ? 'var(--risk-high)' : stat.progress > 40 ? 'var(--risk-medium)' : 'var(--risk-low)' 
                }}
              />
            </div>
          )}
        </div>
      ))}
      
      {/* Predictive Message Box */}
      <div className="md:col-span-3 glass-card p-5 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <span className="material-symbols-outlined text-white text-xl">psychology</span>
          </div>
          <div>
            <p className="text-label-md font-bold text-primary">PREDICTIVE AI INSIGHT</p>
            <p className="text-body-md text-text-main opacity-90">{prediction}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
