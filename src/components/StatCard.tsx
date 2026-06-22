import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
}

export default function StatCard({ title, value, icon: Icon, color = '#00d4ff', subtitle, href, onClick }: StatCardProps) {
  const content = (
    <Card className={`glass border-border/50 hover:border-cyber-blue/30 transition-all duration-300 group ${href || onClick ? 'cursor-pointer hover:bg-muted/20' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors" style={{ color }}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{content}</Link>;
  if (onClick) return <div onClick={onClick}>{content}</div>;
  return content;
}
