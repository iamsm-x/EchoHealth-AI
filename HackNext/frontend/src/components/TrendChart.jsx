import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 h-[300px] flex items-center justify-center">
        <p className="text-text-muted">No trend data available. Start recording to see insights.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-title-md font-headline mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">monitoring</span>
        Health Trends (Last 7 Days)
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: 'var(--text-muted)', fontSize: 12}}
              dy={10}
            />
            <YAxis 
              hide 
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="var(--primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey={(d) => (d.sentiment ? d.sentiment * 100 : 0)} 
              name="Mood Sentiment"
              stroke="#f43f5e" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#f43f5e' }}
            />
            <Line 
              type="monotone" 
              dataKey="breathlessness" 
              stroke="var(--secondary)" 
              strokeWidth={2} 
              dot={false}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex gap-6 text-label-md text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          Risk Score
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f43f5e]"></div>
          Mood Sentiment
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary"></div>
          Breathlessness
        </div>
      </div>
    </div>
  );
}
