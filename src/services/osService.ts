import os from 'os';

export async function getOSInfo() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const nets = os.networkInterfaces();
  const network: { name: string; address: string; netmask: string; mac: string }[] = [];

  for (const name in nets) {
    if (nets[name]) for (const n of nets[name]!) {
      if (n.family === 'IPv4') network.push({ name, address: n.address, netmask: n.netmask, mac: n.mac });
    }
  }

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    kernel: os.version(),
    architecture: os.arch(),
    uptime: os.uptime(),
    loadavg: os.loadavg(),
    osName: os.type(),
    cpus: { count: cpus.length, model: cpus[0]?.model || 'Unknown', speed: cpus[0]?.speed || 0 },
    memory: { total: totalMem, free: freeMem, used: usedMem, usagePercent: totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0 },
    network,
    userInfo: { username: os.userInfo().username, homedir: os.userInfo().homedir, shell: os.userInfo().shell }
  };
}
