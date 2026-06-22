'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import ThreatMeter from '@/components/ThreatMeter';
import { Search, AlertTriangle, Link2, Shield, Loader2, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import CyberButton from '@/components/CyberButton';

export default function PhishingDetector() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/phishing/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      if (!res.ok) throw new Error('Analysis failed');
      const d = await res.json();
      setData(d);
    } catch {
      setError('Failed to analyze URL. Check the address and try again.');
    }
    setLoading(false);
  };

  const color = data ? (data.risk_score < 30 ? '#00ff88' : data.risk_score < 60 ? '#ffaa00' : '#ff0040') : '#8888aa';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">Phishing Detector</h1>
        <p className="text-muted-foreground text-sm mt-1">Analyze URLs for phishing attempts using rule-based detection</p>
      </div>

      <Card className="glass border-border/50 relative overflow-hidden">
        <div className="scan-line" />
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-3">
            <Input placeholder="Enter URL to analyze (e.g., https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && analyze()} className="flex-1 cyber-input" />
            <CyberButton onClick={analyze} loading={loading} icon={<Search className="w-4 h-4" />}>
              Analyze
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
            <StatCard title="Risk Score" value={data.risk_score} icon={Shield} color={color} />
            <StatCard title="Phishing Probability" value={data.risk_level} icon={AlertTriangle} color={color} />
            <StatCard title="Suspicious Keywords" value={data.suspicious_keywords?.length || 0} icon={Search} color={data.suspicious_keywords?.length > 0 ? '#ffaa00' : '#00ff88'} />
            <StatCard title="Domain Exists" value={data.domain_exists ? 'Yes' : 'No'} icon={Link2} color={data.domain_exists ? '#00d4ff' : '#ffaa00'} />
          </div>

          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Detection Results</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ThreatMeter score={data.risk_score} label="Phishing Risk" size="lg" />
              
              <div className="space-y-2">
                {data.risk_factors?.map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" style={{ color: f.weight > 15 ? '#ff0040' : '#ffaa00' }} />
                      <span>{f.name}</span>
                    </div>
                    <span style={{ color: f.weight > 0 ? '#ff0040' : '#00ff88' }}>+{f.weight}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Homograph Attack', data.homograph_attack],
                  ['URL Shortener', data.url_shortener],
                  ['Suspicious TLD', data.suspicious_tld],
                  ['SSL Missing', data.ssl_missing],
                ].map(([label, detected]) => (
                  <div key={label as string} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground">{label as string}</span>
                    {detected ? <XCircle className="w-4 h-4 text-danger" /> : <CheckCircle className="w-4 h-4 text-safe" />}
                  </div>
                ))}
              </div>

              {data.suspicious_keywords?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Suspicious Keywords Found:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.suspicious_keywords.map((k: string, i: number) => (
                      <Badge key={i} className="bg-danger/10 text-danger text-xs">{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
