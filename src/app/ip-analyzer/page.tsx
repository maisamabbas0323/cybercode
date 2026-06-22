'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StatCard from '@/components/StatCard';
import ThreatMeter from '@/components/ThreatMeter';
import RiskBadge from '@/components/RiskBadge';
import { Search, Globe, MapPin, Building2, Network, Shield, AlertTriangle, Loader2, Activity } from 'lucide-react';
import CyberButton from '@/components/CyberButton';

export default function IPAnalyzer() {
  const [ip, setIp] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    if (!ip.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/ip/lookup/${encodeURIComponent(ip.trim())}`);
      if (!res.ok) throw new Error('Lookup failed');
      const d = await res.json();
      setData(d);
    } catch (e) {
      setError('Failed to lookup IP. Check the address and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">IP Address Analyzer</h1>
        <p className="text-muted-foreground text-sm mt-1">IPv4 and IPv6 lookup with geolocation, ISP info, and risk analysis</p>
      </div>

      <Card className="glass border-border/50 relative overflow-hidden">
        <div className="scan-line" />
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-3">
            <Input
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
              className="flex-1 cyber-input"
            />
            <CyberButton onClick={lookup} loading={loading} icon={<Search className="w-4 h-4" />}>
              Lookup
            </CyberButton>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-danger/50 bg-danger/5">
          <CardContent className="p-4 flex items-center gap-3 text-danger">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Risk Score" value={data.risk_score} icon={Shield} color={data.risk_score < 30 ? '#00ff88' : data.risk_score < 60 ? '#ffaa00' : '#ff0040'} />
            <StatCard title="Country" value={data.country || 'Unknown'} icon={Globe} color="#00d4ff" />
            <StatCard title="City" value={data.city || 'Unknown'} icon={MapPin} color="#7c3aed" />
            <StatCard title="ISP" value={data.isp || 'Unknown'} icon={Building2} color="#00ff88" />
          </div>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Network className="w-4 h-4" /> IP Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['IP Address', data.ip],
                  ['ISP', data.isp || 'N/A'],
                  ['Organization', data.org || 'N/A'],
                  ['ASN', data.asn || 'N/A'],
                  ['ASN Organization', data.asn_org || 'N/A'],
                  ['Country', data.country || 'N/A'],
                  ['City', data.city || 'N/A'],
                  ['Region', data.region || 'N/A'],
                  ['Latitude', data.latitude],
                  ['Longitude', data.longitude],
                  ['Reverse DNS', data.reverse_dns || 'N/A'],
                  ['Risk Level', <RiskBadge key="risk" level={data.risk_level} />],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ThreatMeter score={data.risk_score} label="Risk Score" size="lg" />
                <div className="space-y-2">
                  {data.risk_factors?.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-muted/30 text-xs">
                      <span className="text-muted-foreground">{f.name}</span>
                      <span style={{ color: f.weight > 0 ? '#ff0040' : '#00ff88' }}>{f.weight > 0 ? `+${f.weight}` : f.weight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Detection Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    ['VPN Detected', data.vpn, data.vpn ? 'Danger' : 'Safe'],
                    ['Proxy Detected', data.proxy, data.proxy ? 'Danger' : 'Safe'],
                    ['Hosting Provider', data.hosting, data.hosting ? 'Warning' : 'Safe'],
                    ['Mobile Network', data.mobile, data.mobile ? 'Warning' : 'Info'],
                    ['Anonymous IP', data.anonymous, data.anonymous ? 'Danger' : 'Safe'],
                  ].map(([label, detected, status]) => (
                    <div key={label as string} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-xs">{label as string}</span>
                      <Badge className={`text-xs ${
                        status === 'Danger' ? 'bg-danger/10 text-danger' :
                        status === 'Warning' ? 'bg-warning/10 text-warning' :
                        'bg-safe/10 text-safe'
                      }`}>{detected ? 'Detected' : 'Not Detected'}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
