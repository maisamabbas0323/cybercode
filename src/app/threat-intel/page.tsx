'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/StatCard';
import { Search, Radar, Shield, AlertTriangle, Bug, Loader2, ExternalLink, Calendar, Copy } from 'lucide-react';
import CyberButton from '@/components/CyberButton';

const mitreTechniques = [
  { id: 'T1566', name: 'Phishing', tactic: 'Initial Access', desc: 'Adversaries may send phishing messages to gain access to victim systems.' },
  { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'Execution', desc: 'Adversaries may abuse command and script interpreters to execute commands.' },
  { id: 'T1046', name: 'Network Service Scanning', tactic: 'Discovery', desc: 'Adversaries may scan networks for available services.' },
  { id: 'T1071', name: 'Application Layer Protocol', tactic: 'Command and Control', desc: 'Adversaries may use application layer protocols for C2 communications.' },
  { id: 'T1485', name: 'Data Destruction', tactic: 'Impact', desc: 'Adversaries may destroy data on target systems.' },
  { id: 'T1556', name: 'Modify Authentication Process', tactic: 'Credential Access', desc: 'Adversaries may modify authentication mechanisms.' },
  { id: 'T1021', name: 'Remote Services', tactic: 'Lateral Movement', desc: 'Adversaries may use remote services to move laterally.' },
  { id: 'T1018', name: 'Remote System Discovery', tactic: 'Discovery', desc: 'Adversaries may discover remote systems.' },
];

export default function ThreatIntel() {
  const [cveQuery, setCveQuery] = useState('');
  const [cveResults, setCveResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchCVE = async () => {
    if (!cveQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/threat/cve/search?q=${encodeURIComponent(cveQuery.trim())}`);
      if (!res.ok) throw new Error('Search failed');
      const d = await res.json();
      setCveResults(d);
    } catch {
      setError('Failed to search CVEs. Try again.');
    }
    setLoading(false);
  };

  const loadLatest = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/threat/cve/latest');
      if (!res.ok) throw new Error('Failed to load');
      const d = await res.json();
      setCveResults(d);
    } catch {
      setError('Failed to load latest CVEs.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">Threat Intelligence Hub</h1>
        <p className="text-muted-foreground text-sm mt-1">CVE search, vulnerability explorer, and MITRE ATT&CK framework</p>
      </div>

      <Tabs defaultValue="cve" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border/50">
          <TabsTrigger value="cve" className="data-[state=active]:bg-cyber-blue/10 data-[state=active]:text-cyber-blue">CVE Search</TabsTrigger>
          <TabsTrigger value="mitre" className="data-[state=active]:bg-cyber-blue/10 data-[state=active]:text-cyber-blue">MITRE ATT&CK</TabsTrigger>
        </TabsList>

        <TabsContent value="cve" className="space-y-4">
          <Card className="glass border-border/50 relative overflow-hidden">
            <div className="scan-line" />
            <CardContent className="p-4 md:p-6">
              <div className="flex gap-3">
                <Input placeholder="Search CVEs (e.g., apache, linux, openssl)" value={cveQuery} onChange={(e) => setCveQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchCVE()} className="flex-1 cyber-input" />
                <CyberButton onClick={searchCVE} loading={loading} icon={<Search className="w-4 h-4" />}>
                  Search
                </CyberButton>
                <CyberButton onClick={loadLatest} loading={loading} className="!bg-transparent !shadow-none border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 hover:text-cyan-300">
                  Latest
                </CyberButton>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-danger/50 bg-danger/5">
              <CardContent className="p-4 flex items-center gap-3 text-danger"><AlertTriangle className="w-5 h-5" />{error}</CardContent>
            </Card>
          )}

          {cveResults.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Total Results" value={cveResults.length} icon={Radar} color="#00d4ff" />
                <StatCard title="High/Critical" value={cveResults.filter((c: any) => c.severity === 'HIGH' || c.severity === 'CRITICAL' || (c.cvss && parseFloat(c.cvss) >= 7)).length} icon={AlertTriangle} color="#ff0040" />
                <StatCard title="Medium" value={cveResults.filter((c: any) => c.severity === 'MEDIUM' || (c.cvss && parseFloat(c.cvss) >= 4 && parseFloat(c.cvss) < 7)).length} icon={Bug} color="#ffaa00" />
                <StatCard title="Low" value={cveResults.filter((c: any) => c.severity === 'LOW' || (c.cvss && parseFloat(c.cvss) < 4)).length} icon={Shield} color="#00ff88" />
              </div>

              <div className="space-y-3">
                {cveResults.map((cve: any, i: number) => {
                  const sev = (cve.severity || (cve.cvss > 7 ? 'HIGH' : cve.cvss > 4 ? 'MEDIUM' : 'LOW')).toLowerCase();
                  const severityLabel = cve.severity || (cve.cvss ? `CVSS ${cve.cvss}` : 'N/A');
                  return (
                    <Card key={i} className="glass border-border/50 glass-hover cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-cyber-blue">{cve.id}</span>
                            <Badge className={`text-xs ${
                              sev === 'critical' || sev === 'high' ? 'bg-danger/10 text-danger' :
                              sev === 'medium' ? 'bg-warning/10 text-warning' :
                              'bg-safe/10 text-safe'
                            }`}>{severityLabel}</Badge>
                          </div>
                          {cve.published && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />{new Date(cve.published).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{cve.description || 'No description available'}</p>
                        {cve.references && cve.references.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {cve.references.slice(0, 3).map((ref: string, j: number) => (
                              <a key={j} href={ref} target="_blank" rel="noopener noreferrer" className="text-xs text-cyber-blue hover:underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Reference {j + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {cveResults.length === 0 && !loading && !error && (
            <Card className="glass border-border/50">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Search for CVEs or load the latest vulnerabilities</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mitre" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Radar className="w-4 h-4" /> MITRE ATT&CK Techniques</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mitreTechniques.map((t, i) => (
                  <Card key={i} className="bg-muted/20 border-border/30">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-[10px] bg-cyber-blue/10 text-cyber-blue">{t.id}</Badge>
                        <Badge className="text-[10px] bg-muted text-muted-foreground">{t.tactic}</Badge>
                      </div>
                      <p className="text-xs font-medium mb-1">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
