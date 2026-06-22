'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import ThreatMeter from '@/components/ThreatMeter';
import { Shield, Eye, Cookie, Database, Lock, Smartphone, Monitor, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function PrivacyDashboard() {
  const [fingerprint, setFingerprint] = useState<any>(null);
  const [cookies, setCookies] = useState<any[]>([]);
  const [storage, setStorage] = useState({ local: 0, session: 0 });
  const [permissions, setPermissions] = useState<any[]>([]);
  const [privacyScore, setPrivacyScore] = useState(0);
  const [exposure, setExposure] = useState<string[]>([]);

  useEffect(() => {
    // Browser fingerprint analysis
    const fp = {
      userAgent: navigator.userAgent,
      platform: (navigator as any).platform || 'Unknown',
      language: navigator.language,
      languages: navigator.languages,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: (navigator as any).doNotTrack || 'Not set',
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
      deviceMemory: (navigator as any).deviceMemory || 'Unknown',
      screen: { width: screen.width, height: screen.height, colorDepth: screen.colorDepth, pixelDepth: screen.pixelDepth },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      touchPoints: navigator.maxTouchPoints,
      webdriver: (navigator as any).webdriver || false,
    };
    setFingerprint(fp);

    // Cookie analysis
    const cookieItems = document.cookie.split(';').filter(c => c.trim()).map(c => {
      const [name, ...rest] = c.trim().split('=');
      return { name: name || '', value: rest.join('=') || '', session: !c.includes('expires=') };
    });
    setCookies(cookieItems);

    // Storage analysis
    let localSize = 0, sessionSize = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) localSize += (k.length + (localStorage.getItem(k)?.length || 0)) * 2;
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k) sessionSize += (k.length + (sessionStorage.getItem(k)?.length || 0)) * 2;
      }
    } catch {}
    setStorage({ local: localSize, session: sessionSize });

    // Permission inspection
    const permNames = ['geolocation', 'notifications', 'camera', 'microphone', 'clipboard-read', 'clipboard-write'];
    Promise.all(permNames.map(async (name) => {
      try {
        const status = await navigator.permissions.query({ name: name as PermissionName });
        return { name, state: status.state };
      } catch { return { name, state: 'unknown' }; }
    })).then(setPermissions);

    // Calculate privacy score
    let score = 100;
    const exposures: string[] = [];
    if (fp.cookiesEnabled) { score -= 10; exposures.push('Cookies enabled'); }
    if (fp.doNotTrack !== '1') { score -= 5; exposures.push('Do Not Track disabled'); }
    if (cookieItems.length > 5) { score -= 10; exposures.push('Multiple cookies (' + cookieItems.length + ')'); }
    if (localSize > 10000) { score -= 10; exposures.push('Large localStorage (' + (localSize / 1024).toFixed(1) + 'KB)'); }
    if (Number(fp.hardwareConcurrency) > 4) { score -= 5; exposures.push('CPU cores exposed: ' + fp.hardwareConcurrency); }
    if (fp.deviceMemory !== 'Unknown' && Number(fp.deviceMemory) > 4) { score -= 5; exposures.push('Device memory exposed: ' + fp.deviceMemory + 'GB'); }
    permissions.forEach(p => { if (p.state === 'granted') { score -= 5; exposures.push(`Permission granted: ${p.name}`); } });
    setPrivacyScore(Math.max(0, score));
    setExposure(exposures);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">Privacy Awareness Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Understand what data your browser exposes and improve your privacy</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Privacy Score" value={`${privacyScore}%`} icon={Shield} color={privacyScore > 70 ? '#00ff88' : privacyScore > 40 ? '#ffaa00' : '#ff0040'} />
        <StatCard title="Cookies" value={cookies.length} icon={Cookie} color={cookies.length > 5 ? '#ffaa00' : '#00ff88'} />
        <StatCard title="localStorage" value={`${(storage.local / 1024).toFixed(1)}KB`} icon={Database} color={storage.local > 10000 ? '#ffaa00' : '#00d4ff'} />
        <StatCard title="Exposures" value={exposure.length} icon={Eye} color={exposure.length > 5 ? '#ff0040' : exposure.length > 2 ? '#ffaa00' : '#00ff88'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Monitor className="w-4 h-4" /> Browser Fingerprint</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              ['User Agent', fingerprint?.userAgent?.substring(0, 60) + '...'],
              ['Platform', fingerprint?.platform],
              ['Language', fingerprint?.language],
              ['Timezone', fingerprint?.timezone],
              ['Screen', `${fingerprint?.screen?.width}x${fingerprint?.screen?.height} @ ${fingerprint?.screen?.colorDepth}-bit`],
              ['CPU Cores', fingerprint?.hardwareConcurrency],
              ['Memory', fingerprint?.deviceMemory + 'GB' || 'Unknown'],
              ['Touch Points', fingerprint?.touchPoints],
              ['Cookies Enabled', fingerprint?.cookiesEnabled ? 'Yes' : 'No'],
              ['Do Not Track', fingerprint?.doNotTrack],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between items-center p-2 rounded-lg bg-muted/30 text-xs">
                <span className="text-muted-foreground">{label as string}</span>
                <span className="font-medium truncate ml-2 max-w-[200px]">{value as string}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Lock className="w-4 h-4" /> Permissions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {permissions.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-xs">{p.name}</span>
                  <Badge className={`text-xs ${
                    p.state === 'granted' ? 'bg-danger/10 text-danger' :
                    p.state === 'denied' ? 'bg-warning/10 text-warning' :
                    'bg-safe/10 text-safe'
                  }`}>{p.state}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Cookie className="w-4 h-4" /> Cookie Analysis</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{cookies.length} cookies detected</p>
              {cookies.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {cookies.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/20">
                      <span className="text-muted-foreground shrink-0">{c.session ? <Clock2 /> : <Database className="w-3 h-3" />}</span>
                      <span className="font-mono">{c.name}</span>
                      <Badge className="text-[10px] ml-auto" variant="outline">{c.session ? 'Session' : 'Persistent'}</Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-muted-foreground">No cookies found</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Privacy Exposures</CardTitle></CardHeader>
        <CardContent>
          <ThreatMeter score={100 - privacyScore} label="Exposure Level" size="lg" />
          {exposure.length > 0 ? (
            <div className="space-y-2 mt-4">
              {exposure.map((e, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-danger/5 text-xs">
                  <XCircle className="w-3 h-3 text-danger shrink-0" />
                  <span className="text-danger">{e}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-safe/5 text-xs mt-4">
              <CheckCircle className="w-3 h-3 text-safe" />
              <span className="text-safe">Good privacy posture</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Clock2() { return <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
