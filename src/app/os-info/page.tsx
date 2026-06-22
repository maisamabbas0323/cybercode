'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import ThreatMeter from '@/components/ThreatMeter';
import { Monitor, Cpu, HardDrive, Wifi, Clock, Server, Activity, Database, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function OSInfo() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchInfo() {
    setLoading(true);
    setError('');
    fetch('/api/os')
      .then(function(r) { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(function(d) { setData(d); setLoading(false); })
      .catch(function() { setError('Failed to fetch OS information'); setLoading(false); });
  }

  useEffect(function() { fetchInfo(); }, []);

  function formatTime(seconds: number) {
    var d = Math.floor(seconds / 86400);
    var h = Math.floor((seconds % 86400) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    return d + 'd ' + h + 'h ' + m + 'm';
  }

  function formatBytes(bytes: number) {
    if (!bytes) return '0 B';
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">OS Information</h1>
          <p className="text-muted-foreground text-sm mt-1">Detailed system information and hardware diagnostics</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInfo} disabled={loading} className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 gap-2">
          <RefreshCw className={'w-3 h-3 ' + (loading ? 'animate-spin' : '')} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-danger/50 bg-danger/5">
          <CardContent className="p-4 text-sm text-danger">{error}</CardContent>
        </Card>
      )}

      {loading && !data && (
        <Card className="glass border-border/50">
          <CardContent className="p-12 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-cyber-blue" />
            <p className="text-sm">Fetching system information...</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Hostname" value={data.hostname} icon={Server} color="#00d4ff" />
            <StatCard title="Platform" value={data.platform} icon={Monitor} color="#7c3aed" />
            <StatCard title="Architecture" value={data.architecture} icon={Cpu} color="#00ff88" />
            <StatCard title="Uptime" value={formatTime(data.uptime)} icon={Clock} color="#ffaa00" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass border-border/50">
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Monitor className="w-4 h-4" /> Operating System</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  ['OS Name', data.osName],
                  ['Platform', data.platform],
                  ['Release', data.release],
                  ['Kernel', data.kernel],
                  ['Architecture', data.architecture],
                  ['Hostname', data.hostname],
                  ['Username', data.userInfo?.username],
                  ['Home Directory', data.userInfo?.homedir],
                  ['Shell', data.userInfo?.shell],
                ].map(function(item) {
                  return (
                    <div key={item[0]} className="flex justify-between items-center p-2 rounded-lg bg-muted/30 text-xs">
                      <span className="text-muted-foreground">{item[0]}</span>
                      <span className="font-medium truncate ml-2 max-w-[200px]">{item[1] || 'N/A'}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Cpu className="w-4 h-4" /> CPU Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  ['CPU Count', data.cpus?.count],
                  ['Model', data.cpus?.model],
                  ['Speed', data.cpus?.speed ? data.cpus.speed + ' MHz' : 'N/A'],
                ].map(function(item) {
                  return (
                    <div key={item[0]} className="flex justify-between items-center p-2 rounded-lg bg-muted/30 text-xs">
                      <span className="text-muted-foreground">{item[0]}</span>
                      <span className="font-medium truncate ml-2 max-w-[250px]">{item[1] || 'N/A'}</span>
                    </div>
                  );
                })}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Load Average (1m, 5m, 15m)</span>
                    <span className="font-medium">{data.loadavg?.map(function(n: number) { return n.toFixed(2); }).join(' / ')}</span>
                  </div>
                  <Progress value={Math.min(100, (data.loadavg?.[0] || 0) / (data.cpus?.count || 1) * 100)} className="h-2 [&>div]:bg-cyber-blue" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass border-border/50">
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Database className="w-4 h-4" /> Memory Usage</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl font-bold" style={{ color: data.memory?.usagePercent > 80 ? '#ff0040' : data.memory?.usagePercent > 50 ? '#ffaa00' : '#00ff88' }}>
                    {data.memory?.usagePercent}%
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">Used</p>
                </div>
                <ThreatMeter score={data.memory?.usagePercent || 0} label="Memory Usage" size="lg" />
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="font-bold" style={{ color: '#00d4ff' }}>{formatBytes(data.memory?.total)}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="font-bold" style={{ color: '#ffaa00' }}>{formatBytes(data.memory?.used)}</div>
                    <div className="text-muted-foreground">Used</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="font-bold" style={{ color: '#00ff88' }}>{formatBytes(data.memory?.free)}</div>
                    <div className="text-muted-foreground">Free</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Wifi className="w-4 h-4" /> Network Interfaces</CardTitle></CardHeader>
              <CardContent>
                {data.network?.length > 0 ? (
                  <div className="space-y-2">
                    {data.network.map(function(n: any, i: number) {
                      return (
                        <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-safe" />
                            <span className="text-xs font-medium">{n.name}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground pl-4 space-y-0.5">
                            <div>IP: {n.address}</div>
                            <div>Netmask: {n.netmask}</div>
                            <div>MAC: {n.mac}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No network interfaces found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
