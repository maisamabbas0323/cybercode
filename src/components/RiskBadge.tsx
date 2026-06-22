import { Badge } from './ui/badge';

interface RiskBadgeProps {
  level: string;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    safe: { color: '#00ff88', bg: 'rgba(0,255,136,0.1)', label: 'Safe' },
    secure: { color: '#00ff88', bg: 'rgba(0,255,136,0.1)', label: 'Secure' },
    low: { color: '#00ff88', bg: 'rgba(0,255,136,0.1)', label: 'Low Risk' },
    suspicious: { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)', label: 'Suspicious' },
    moderate: { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)', label: 'Moderate' },
    medium: { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)', label: 'Medium Risk' },
    dangerous: { color: '#ff0040', bg: 'rgba(255,0,64,0.1)', label: 'Dangerous' },
    insecure: { color: '#ff0040', bg: 'rgba(255,0,64,0.1)', label: 'Insecure' },
    high: { color: '#ff0040', bg: 'rgba(255,0,64,0.1)', label: 'High Risk' },
    critical: { color: '#ff0040', bg: 'rgba(255,0,64,0.1)', label: 'Critical' },
  };

  const c = config[level?.toLowerCase()] || { color: '#8888aa', bg: 'rgba(136,136,170,0.1)', label: level || 'Unknown' };

  return (
    <Badge
      className="font-medium border-0"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </Badge>
  );
}
