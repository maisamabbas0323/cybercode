import dns from 'dns';
import https from 'https';
import http from 'http';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveCname = promisify(dns.resolveCname);
const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);
const resolveTxt = promisify(dns.resolveTxt);
const resolveSoa = promisify(dns.resolveSoa);

function measureLatency(hostname: string): Promise<{ latency: number; reachable: boolean }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = https.get(`https://${hostname}`, { timeout: 5000 }, (res) => {
      resolve({ latency: Date.now() - start, reachable: true });
      res.resume();
    });
    req.on('error', () => {
      const s2 = Date.now();
      http.get(`http://${hostname}`, { timeout: 5000 }, (res) => { resolve({ latency: Date.now() - s2, reachable: true }); res.resume(); }).on('error', () => resolve({ latency: -1, reachable: false }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ latency: -1, reachable: false }); });
  });
}

export async function analyzeDNS(hostname: string) {
  const cleanHost = hostname.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  const results = await Promise.allSettled([
    resolve4(cleanHost).catch(() => [] as string[]),
    resolve6(cleanHost).catch(() => [] as string[]),
    resolveCname(cleanHost).catch(() => [] as string[]),
    resolveMx(cleanHost).catch(() => [] as dns.MxRecord[]),
    resolveNs(cleanHost).catch(() => [] as string[]),
    resolveTxt(cleanHost).catch(() => [] as string[][]),
    resolveSoa(cleanHost).catch(() => null),
    measureLatency(cleanHost)
  ]);

  return {
    hostname: cleanHost,
    a: results[0].status === 'fulfilled' ? results[0].value : [],
    aaaa: results[1].status === 'fulfilled' ? results[1].value : [],
    cname: results[2].status === 'fulfilled' ? results[2].value : [],
    mx: results[3].status === 'fulfilled' ? results[3].value : [],
    ns: results[4].status === 'fulfilled' ? results[4].value : [],
    txt: results[5].status === 'fulfilled' ? results[5].value : [],
    soa: results[6].status === 'fulfilled' ? results[6].value : null,
    latency: results[7].status === 'fulfilled' ? results[7].value : { latency: -1, reachable: false },
    timestamp: new Date().toISOString()
  };
}
