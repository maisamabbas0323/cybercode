import https from 'https';
import http from 'http';
import dns from 'dns';
import { promisify } from 'util';
import { calculateSecurityRisk } from '@/utils/riskEngine';

const resolveDns = promisify(dns.resolve4);
const resolveCname = promisify(dns.resolveCname);
const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);

function checkSSL(hostname: string): Promise<any> {
  return new Promise((resolve) => {
    const req = https.get(`https://${hostname}`, { rejectUnauthorized: false, timeout: 10000 }, (res) => {
      const cert: any = (res.socket as any).getPeerCertificate();
      const issuer = cert?.issuer || {};
      const subject = cert?.subject || {};
      const valid = cert && Object.keys(cert).length > 0 && !cert.error;
      const validTo = cert?.valid_to ? new Date(cert.valid_to) : null;
      const daysLeft = validTo ? Math.floor((validTo.getTime() - Date.now()) / 86400000) : 0;
      res.resume();
      resolve({ valid, issuedTo: subject.CN || hostname, issuedBy: issuer.O || issuer.CN || 'Unknown', validFrom: cert?.valid_from, validTo: cert?.valid_to, daysLeft, expired: daysLeft < 0, selfSigned: (issuer.O || '') === (subject.CN || '') || !issuer.O, protocol: (res.socket as any).getProtocol() || 'TLSv1.3' });
    });
    req.on('error', () => resolve({ valid: false, expired: false, selfSigned: false, daysLeft: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ valid: false, error: 'timeout' }); });
  });
}

function fetchHeaders(hostname: string): Promise<any> {
  return new Promise((resolve) => {
    const req = https.get(`https://${hostname}`, { timeout: 10000 }, (res) => {
      resolve(res.headers);
      res.resume();
    });
    req.on('error', () => {
      http.get(`http://${hostname}`, { timeout: 10000 }, (res) => { resolve(res.headers); res.resume(); }).on('error', () => resolve({}));
    });
    req.on('timeout', () => { req.destroy(); resolve({}); });
  });
}

export async function scanWebsite(hostname: string) {
  const cleanHost = hostname.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  const [sslInfo, headers, dnsRecords, cnameRecords, mxRecords, txtRecords] = await Promise.all([
    checkSSL(cleanHost),
    fetchHeaders(cleanHost),
    resolveDns(cleanHost).catch(() => []),
    resolveCname(cleanHost).catch(() => []),
    resolveMx(cleanHost).catch(() => []),
    resolveTxt(cleanHost).catch(() => [])
  ]);

  const httpsValid = sslInfo.valid && !sslInfo.expired;
  const riskAnalysis = calculateSecurityRisk(headers as Record<string, string>);

  return {
    hostname: cleanHost,
    ssl: sslInfo,
    https: { valid: httpsValid, redirect: false, enforced: httpsValid },
    security_headers: { headers, missing: riskAnalysis.missing, issues: riskAnalysis.issues },
    dns: { a: dnsRecords, cname: cnameRecords, mx: mxRecords, txt: txtRecords },
    risk_score: riskAnalysis.score,
    risk_level: riskAnalysis.level,
    timestamp: new Date().toISOString()
  };
}
