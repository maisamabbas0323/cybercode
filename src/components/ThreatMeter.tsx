interface ThreatMeterProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThreatMeter({ score, label, size = 'md' }: ThreatMeterProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const color = clamped < 30 ? '#00ff88' : clamped < 60 ? '#ffaa00' : '#ff0040';
  const bgColor = clamped < 30 ? 'rgba(0,255,136,0.1)' : clamped < 60 ? 'rgba(255,170,0,0.1)' : 'rgba(255,0,64,0.1)';
  const dims = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="space-y-1">
      {label && <div className="flex justify-between text-xs"><span>{label}</span><span style={{ color }}>{clamped}/100</span></div>}
      <div className={`w-full rounded-full ${dims}`} style={{ background: bgColor }}>
        <div
          className={`rounded-full transition-all duration-500 ${dims}`}
          style={{ width: `${clamped}%`, background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
    </div>
  );
}
