'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import ThreatMeter from '@/components/ThreatMeter';
import { UserCheck, Search, Globe, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import CyberButton from '@/components/CyberButton';

export default function Footprint() {
  const [username, setUsername] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const check = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/footprint/username?username=${encodeURIComponent(username.trim())}`);
      if (!res.ok) throw new Error('Check failed');
      const d = await res.json();
      setData(d);
    } catch {
      setError('Failed to check username. Try again.');
    }
    setLoading(false);
  };

  const exposureScore = data ? Math.round((data.found?.length / data.total_checked) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">Digital Footprint Analyzer</h1>
        <p className="text-muted-foreground text-sm mt-1">Check username availability and discover your online presence</p>
      </div>

      <Card className="glass border-border/50 relative overflow-hidden">
        <div className="scan-line" />
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-3">
            <Input placeholder="Enter username to search..." value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()} className="flex-1 cyber-input" />
            <CyberButton onClick={check} loading={loading} icon={<Search className="w-4 h-4" />}>
              Search
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
            <StatCard title="Exposure Score" value={`${exposureScore}%`} icon={UserCheck} color={exposureScore > 60 ? '#ff0040' : exposureScore > 30 ? '#ffaa00' : '#00ff88'} />
            <StatCard title="Accounts Found" value={data.found?.length || 0} icon={Globe} color="#00d4ff" />
            <StatCard title="Platforms Checked" value={data.total_checked} icon={Search} color="#7c3aed" />
            <StatCard title="Username" value={data.username} icon={UserCheck} color="#00ff88" />
          </div>

          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Platform Results</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <ThreatMeter score={exposureScore} label="Exposure Level" size="lg" />
              <div className="space-y-2 mt-4">
                {data.platforms?.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm">{p.platform}</span>
                    {p.exists ? (
                      <Badge className="bg-danger/10 text-danger flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Found
                      </Badge>
                    ) : (
                      <Badge className="bg-safe/10 text-safe flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Not Found
                      </Badge>
                    )}
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
