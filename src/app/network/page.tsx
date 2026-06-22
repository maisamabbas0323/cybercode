'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import { Search, Radio, Wifi, Globe, Server, Activity, Loader2, Clock, ArrowRight } from 'lucide-react';
import CyberButton from '@/components/CyberButton';

export default function NetworkAnalyzer() {
  const [hostname, setHostname] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!hostname.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/network/dns?hostname=${encodeURIComponent(hostname.trim())}`);
      if (!res.ok) throw new Error('Analysis failed');
      const d = await res.json();
      setData(d);
    } catch {
      setError('Failed to analyze hostname. Check the address and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">Network Analyzer</h1>
        <p className="text-muted-foreground text-sm mt-1">DNS analysis, latency testing, and connection diagnostics</p>
      </div>

      <Card className="glass border-border/50 relative overflow-hidden">
        <div className="scan-line" />
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-3">
            <Input placeholder="Enter hostname (e.g., example.com)" value={hostname} onChange={(e) => setHostname(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && analyze()} className="flex-1 cyber-input" />
            <CyberButton onClick={analyze} loading={loading} icon={<Search className="w-4 h-4" />}>
              Analyze
            </CyberButton>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-danger/50 bg-danger/5">
          <CardContent className="p-4 flex items-center gap-3 text-danger"><Activity className="w-5 h-5" />{error}</CardContent>
        </Card>
      )}

      {data && (
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Latency" value={data.latency?.latency > 0 ? `${data.latency.latency}ms` : 'Timeout'} icon={Clock} color={data.latency?.latency < 100 ? '#00ff88' : data.latency?.latency < 300 ? '#ffaa00' : '#ff0040'} />
            <StatCard title="Reachable" value={data.latency?.reachable ? 'Yes' : 'No'} icon={Wifi} color={data.latency?.reachable ? '#00ff88' : '#ff0040'} />
            <StatCard title="A Records" value={data.a?.length || 0} icon={Globe} color="#00d4ff" />
            <StatCard title="Nameservers" value={data.ns?.length || 0} icon={Server} color="#7c3aed" />
          </div>

          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">DNS Records</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['A Records', data.a],
                  ['AAAA Records', data.aaaa],
                  ['CNAME', data.cname],
                  ['MX Records', data.mx?.map((m: any) => `${m.exchange} (priority ${m.priority})`)],
                  ['Nameservers', data.ns],
                  ['TXT Records', data.txt?.map((t: any) => Array.isArray(t) ? t.join(' ').substring(0, 80) : t)],
                ].map(([label, records]) => (
                  <div key={label as string} className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-2">{label as string}</p>
                    {records && (records as any[]).length > 0 ? (records as any[]).slice(0, 3).map((r: any, i: number) => (
                      <p key={i} className="text-xs font-mono truncate mb-1">{r?.toString() || 'N/A'}</p>
                    )) : <p className="text-xs text-muted-foreground">No records found</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {data.soa && (
            <Card className="glass border-border/50">
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">SOA Record</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ['MNAME', data.soa.nsname],
                    ['RNAME', data.soa.hostmaster],
                    ['Serial', data.soa.serial],
                    ['Refresh', `${data.soa.refresh}s`],
                    ['Retry', `${data.soa.retry}s`],
                    ['Expire', `${data.soa.expire}s`],
                    ['Minimum TTL', `${data.soa.minttl}s`],
                  ].map(([label, value]) => (
                    <div key={label as string} className="p-2 rounded-lg bg-muted/30">
                      <p className="text-[10px] text-muted-foreground">{label as string}</p>
                      <p className="text-xs font-mono mt-1">{value?.toString() || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
