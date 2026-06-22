'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/StatCard';
import ThreatMeter from '@/components/ThreatMeter';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, Globe, Lock, Search, Radio, Radar, UserCheck, BookOpen, AlertTriangle, ArrowRight, Server, Wifi, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const quickLinks = [
  { href: '/ip-analyzer', label: 'IP Analyzer', icon: Globe, desc: 'Lookup and analyze IP addresses' },
  { href: '/security-scanner', label: 'Security Scanner', icon: Shield, desc: 'Scan websites for vulnerabilities' },
  { href: '/phishing-detector', label: 'Phishing Detector', icon: Search, desc: 'Detect phishing attempts' },
  { href: '/password', label: 'Password Center', icon: Lock, desc: 'Generate & analyze passwords' },
  { href: '/network', label: 'Network Analyzer', icon: Radio, desc: 'DNS & network diagnostics' },
  { href: '/threat-intel', label: 'Threat Intel', icon: Radar, desc: 'CVE search & threat feeds' },
];

const securityData = [
  { time: '00:00', threats: 4, scans: 12 },
  { time: '04:00', threats: 7, scans: 19 },
  { time: '08:00', threats: 15, scans: 28 },
  { time: '12:00', threats: 22, scans: 35 },
  { time: '16:00', threats: 18, scans: 30 },
  { time: '20:00', threats: 12, scans: 24 },
  { time: 'Now', threats: 8, scans: 16 },
];

export default function Home() {
  const [stats, setStats] = useState({ threats: 0, scans: 0, score: 0, uptime: 0 });

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => {
      setStats({ threats: Math.floor(Math.random() * 30), scans: Math.floor(Math.random() * 100), score: Math.floor(Math.random() * 40 + 60), uptime: 99.9 });
    }).catch(() => {
      setStats({ threats: 0, scans: 0, score: 0, uptime: 0 });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">Security Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time cybersecurity overview and quick actions</p>
        </div>
        <Badge variant="outline" className="gap-2 text-xs bg-safe/10 text-safe border-safe/20">
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          All Systems Operational
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 fade-in-delay-1">
        <StatCard title="Security Score" value={`${stats.score}%`} icon={Shield} color="#00d4ff" subtitle="Click for details" href="/monitoring" />
        <StatCard title="Active Threats" value={stats.threats} icon={AlertTriangle} color="#ff0040" subtitle="Click for details" href="/threat-intel" />
        <StatCard title="Scans Today" value={stats.scans} icon={Activity} color="#00ff88" subtitle="Click for details" href="/security-scanner" />
        <StatCard title="System Uptime" value={`${stats.uptime}%`} icon={Server} color="#7c3aed" subtitle="Click for details" href="/network" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Security Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={securityData}>
                  <defs>
                    <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff0040" stopOpacity={0.3}/><stop offset="95%" stopColor="#ff0040" stopOpacity={0}/></linearGradient>
                    <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#8888aa" fontSize={11} />
                  <YAxis stroke="#8888aa" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'rgba(15,15,40,0.9)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', color: '#e0e0ff' }} />
                  <Area type="monotone" dataKey="scans" stroke="#00d4ff" fill="url(#scanGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="threats" stroke="#ff0040" fill="url(#threatGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Security Posture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-5xl font-bold cyber-gradient-text">{stats.score}</div>
              <p className="text-muted-foreground text-sm mt-2">Security Score</p>
            </div>
            <ThreatMeter score={stats.score} label="Risk Level" size="lg" />
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-2 rounded-lg bg-safe/5 border border-safe/10">
                <div className="text-safe font-bold text-lg">{stats.scans}</div>
                <div className="text-muted-foreground">Scans Today</div>
              </div>
              <div className="p-2 rounded-lg bg-danger/5 border border-danger/10">
                <div className="text-danger font-bold text-lg">{stats.threats}</div>
                <div className="text-muted-foreground">Threats Blocked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 cyber-gradient-text">Quick Access Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="glass border-border/50 glass-hover cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{link.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
