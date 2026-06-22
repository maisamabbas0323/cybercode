'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/StatCard';
import ThreatMeter from '@/components/ThreatMeter';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, AlertTriangle, Server, Wifi, Clock, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const threatTimeline = [
  { time: '00:00', threats: 4, blocked: 3, suspicious: 1 },
  { time: '02:00', threats: 2, blocked: 2, suspicious: 0 },
  { time: '04:00', threats: 7, blocked: 5, suspicious: 2 },
  { time: '06:00', threats: 5, blocked: 4, suspicious: 1 },
  { time: '08:00', threats: 12, blocked: 9, suspicious: 3 },
  { time: '10:00', threats: 18, blocked: 14, suspicious: 4 },
  { time: '12:00', threats: 22, blocked: 17, suspicious: 5 },
  { time: '14:00', threats: 20, blocked: 16, suspicious: 4 },
  { time: '16:00', threats: 15, blocked: 12, suspicious: 3 },
  { time: '18:00', threats: 10, blocked: 8, suspicious: 2 },
  { time: '20:00', threats: 8, blocked: 6, suspicious: 2 },
  { time: '22:00', threats: 5, blocked: 4, suspicious: 1 },
];

const threatTypes = [
  { name: 'Malware', value: 35, color: '#ff0040' },
  { name: 'Phishing', value: 28, color: '#ff6b35' },
  { name: 'DDoS', value: 15, color: '#ffaa00' },
  { name: 'Injection', value: 12, color: '#7c3aed' },
  { name: 'Other', value: 10, color: '#8888aa' },
];

const recentEvents = [
  { time: '2 min ago', type: 'Port Scan', source: '185.220.101.x', severity: 'medium' },
  { time: '5 min ago', type: 'Failed Login', source: '91.121.87.x', severity: 'low' },
  { time: '12 min ago', type: 'Malware Detected', source: 'Internal', severity: 'critical' },
  { time: '18 min ago', type: 'Phishing URL', source: 'External', severity: 'high' },
  { time: '25 min ago', type: 'SSL Mismatch', source: 'api.example.com', severity: 'medium' },
  { time: '30 min ago', type: 'Suspicious Request', source: '45.33.32.x', severity: 'low' },
];

export default function Monitoring() {
  const [stats, setStats] = useState({ threats: 128, blocked: 97, suspicious: 31, score: 84 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">Security Monitoring</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time security metrics and threat visualization</p>
        </div>
        <Badge variant="outline" className="gap-2 bg-safe/10 text-safe border-safe/20">
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total Threats" value={stats.threats} icon={AlertTriangle} color="#ff0040" subtitle="Last 24 hours" />
        <StatCard title="Blocked" value={stats.blocked} icon={Shield} color="#00ff88" subtitle="Successfully blocked" />
        <StatCard title="Suspicious" value={stats.suspicious} icon={Activity} color="#ffaa00" subtitle="Under investigation" />
        <StatCard title="Security Score" value={`${stats.score}%`} icon={Server} color="#00d4ff" subtitle="Overall rating" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass border-border/50 lg:col-span-2">
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Threat Timeline (24h)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatTimeline}>
                  <defs>
                    <linearGradient id="threatG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff0040" stopOpacity={0.3}/><stop offset="95%" stopColor="#ff0040" stopOpacity={0}/></linearGradient>
                    <linearGradient id="blockG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/><stop offset="95%" stopColor="#00ff88" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#8888aa" fontSize={11} />
                  <YAxis stroke="#8888aa" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'rgba(15,15,40,0.9)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', color: '#e0e0ff' }} />
                  <Area type="monotone" dataKey="threats" stroke="#ff0040" fill="url(#threatG)" strokeWidth={2} name="Threats" />
                  <Area type="monotone" dataKey="blocked" stroke="#00ff88" fill="url(#blockG)" strokeWidth={2} name="Blocked" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Threat Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={threatTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {threatTypes.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15,15,40,0.9)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', color: '#e0e0ff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {threatTypes.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="ml-auto font-medium">{t.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Recent Security Events</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentEvents.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-16">{e.time}</span>
                  <span className="font-medium">{e.type}</span>
                  <span className="text-muted-foreground">from {e.source}</span>
                </div>
                <Badge className={`text-xs ${
                  e.severity === 'critical' ? 'bg-danger/10 text-danger' :
                  e.severity === 'high' ? 'bg-danger/5 text-danger' :
                  e.severity === 'medium' ? 'bg-warning/10 text-warning' :
                  'bg-safe/10 text-safe'
                }`}>{e.severity}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
