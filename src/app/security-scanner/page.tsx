'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import ThreatMeter from '@/components/ThreatMeter';
import RiskBadge from '@/components/RiskBadge';
import { Search, Shield, Globe, AlertTriangle, Lock, Server, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import CyberButton from '@/components/CyberButton';

export default function SecurityScanner() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/security/scan?url=${encodeURIComponent(url.trim())}`);
      if (!res.ok) throw new Error('Scan failed');
      const d = await res.json();
      setData(d);
    } catch {
      setError('Failed to scan website. Check the URL and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">Website Security Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">SSL inspection, security headers analysis, and DNS lookup</p>
      </div>

      <Card className="glass border-border/50 relative overflow-hidden">
        <div className="scan-line" />
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-3">
            <Input placeholder="Enter website URL (e.g., example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scan()} className="flex-1 cyber-input" />
            <CyberButton onClick={scan} loading={loading} icon={<Search className="w-4 h-4" />}>
              Scan
            </CyberButton>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-danger/50 bg-danger/5">
          <CardContent className="p-4 flex items-center gap-3 text-danger"><AlertTriangle className="w-5 h-5" />{error}</CardContent>
        </Card>
      )}

      {data && (
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Risk Score" value={data.risk_score} icon={Shield} color={data.risk_score < 30 ? '#00ff88' : data.risk_score < 60 ? '#ffaa00' : '#ff0040'} />
            <StatCard title="SSL Status" value={data.ssl?.valid ? 'Valid' : 'Invalid'} icon={Lock} color={data.ssl?.valid ? '#00ff88' : '#ff0040'} />
            <StatCard title="Days Left" value={data.ssl?.daysLeft || 0} icon={Globe} color={data.ssl?.daysLeft > 30 ? '#00ff88' : data.ssl?.daysLeft > 7 ? '#ffaa00' : '#ff0040'} />
            <StatCard title="HTTPS" value={data.https?.valid ? 'Enabled' : 'Disabled'} icon={Server} color={data.https?.valid ? '#00ff88' : '#ff0040'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass border-border/50">
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">SSL Certificate</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  ['Status', data.ssl?.valid ? <Badge className="bg-safe/10 text-safe">Valid</Badge> : <Badge className="bg-danger/10 text-danger">Invalid</Badge>],
                  ['Hostname', data.ssl?.issuedTo || 'N/A'],
                  ['Issuer', data.ssl?.issuedBy || 'N/A'],
                  ['Protocol', data.ssl?.protocol || 'N/A'],
                  ['Days Until Expiry', `${data.ssl?.daysLeft || 0} days`],
                  ['Self-Signed', data.ssl?.selfSigned ? <Badge className="bg-danger/10 text-danger">Yes</Badge> : <Badge className="bg-safe/10 text-safe">No</Badge>],
                  ['Expired', data.ssl?.expired ? <Badge className="bg-danger/10 text-danger">Yes</Badge> : <Badge className="bg-safe/10 text-safe">No</Badge>],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between items-center p-2 rounded-lg bg-muted/30 text-xs">
                    <span className="text-muted-foreground">{label as string}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Security Headers</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <ThreatMeter score={data.risk_score} label="Header Risk" size="lg" />
                <div className="space-y-2 mt-3">
                  {data.security_headers?.missing?.map((h: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-danger/5 text-xs">
                      <XCircle className="w-3 h-3 text-danger shrink-0" />
                      <span className="text-danger">{h} — Missing</span>
                    </div>
                  ))}
                  {(!data.security_headers?.missing || data.security_headers.missing.length === 0) && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-safe/5 text-xs">
                      <CheckCircle className="w-3 h-3 text-safe shrink-0" />
                      <span className="text-safe">All security headers present</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">DNS Records</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  ['A Records', data.dns?.a],
                  ['CNAME', data.dns?.cname],
                  ['MX Records', data.dns?.mx?.map((m: any) => `${m.exchange} (priority ${m.priority})`)],
                  ['TXT Records', data.dns?.txt?.map((t: any) => Array.isArray(t) ? t.join(' ') : t)],
                ].map(([label, records]) => (
                  <div key={label as string} className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">{label as string}</p>
                    {records && (records as any[]).length > 0 ? (records as any[]).slice(0, 3).map((r: any, i: number) => (
                      <p key={i} className="text-xs font-mono truncate">{r?.toString() || 'N/A'}</p>
                    )) : <p className="text-xs text-muted-foreground">No records found</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
