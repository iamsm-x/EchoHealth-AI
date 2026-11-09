export default function InsightAlert({ insights, alerts }) {
  if ((!insights || insights.length === 0) && (!alerts || alerts.length === 0)) return null;

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Critical Alerts */}
      {alerts.map((alert, i) => (
        <div key={`alert-${i}`} className="glass-card border-accent/30 bg-accent/5 p-4 animate-pulse-slow">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-accent text-2xl">warning</span>
            <p className="text-body-md font-bold text-accent">{alert}</p>
          </div>
        </div>
      ))}

      {/* AI Insights */}
      {insights.map((insight, i) => (
        <div key={`insight-${i}`} className="glass-card border-secondary/30 bg-secondary/5 p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-secondary/20 rounded-xl">
              <span className="material-symbols-outlined text-secondary text-xl">auto_awesome</span>
            </div>
            <div>
              <p className="text-body-md text-text-main leading-relaxed">
                {insight}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
