import dns from 'dns';
import { promisify } from 'util';
import { httpsGet } from './httpsFetch';
import { calculateIPRisk } from '@/utils/riskEngine';

const resolveDns = promisify(dns.reverse);

export async function lookupIP(ip: string) {
  const result: any = { ip, isp: '', org: '', asn: '', asn_org: '', country: '', city: '', region: '', latitude: 0, longitude: 0, vpn: false, proxy: false, hosting: false, mobile: false, anonymous: false, error: null };

  const sources = [
    async () => {
      const data = await httpsGet(`https://ipapi.co/${ip}/json/`);
      result.isp = data.org || data.isp || '';
      result.org = data.org || '';
      result.country = data.country || '';
      result.city = data.city || '';
      result.region = data.region || '';
      result.latitude = data.latitude || 0;
      result.longitude = data.longitude || 0;
      result.asn = data.asn || '';
      if (data.org) result.asn_org = data.org;
    },
    async () => {
      const data = await httpsGet(`https://ipwho.is/${ip}`);
      if (!result.country && data.success) {
        result.country = data.country || '';
        result.city = data.city || '';
        result.region = data.region || '';
        result.latitude = data.latitude || result.latitude;
        result.longitude = data.longitude || result.longitude;
        result.isp = data.connection?.isp || result.isp;
        result.asn = data.connection?.asn || result.asn;
        result.asn_org = data.connection?.org || result.asn_org;
      }
    },
    async () => {
      const data = await httpsGet(`https://ipinfo.io/${ip}/json`);
      if (!result.country && data.country) {
        result.country = data.country || result.country;
        result.city = data.city || result.city;
        result.region = data.region || result.region;
        result.org = data.org || result.org;
        result.isp = data.org || result.isp;
        const loc = (data.loc || '').split(',');
        result.latitude = parseFloat(loc[0]) || result.latitude;
        result.longitude = parseFloat(loc[1]) || result.longitude;
      }
    }
  ];

  for (const source of sources) {
    try { await source(); } catch { /* try next */ }
  }

  result.vpn = /(vpn|proxy|cloud|hosting|aws|gcp|azure|digitalocean|linode|vultr|ovh|hetzner)/i.test(result.org || result.isp);
  result.proxy = /(proxy|squid|vpn)/i.test(result.org || result.isp);
  result.hosting = /(cloud|hosting|aws|gcp|azure|digitalocean|linode|vultr|ovh|hetzner|server)/i.test(result.org || result.isp);
  result.mobile = /(mobile|cell|telstra|verizon|at&t|t-mobile|vodafone)/i.test(result.isp || '');

  try {
    const hostnames = await resolveDns(ip);
    result.reverse_dns = hostnames[0] || null;
  } catch { result.reverse_dns = null; }

  const risk = calculateIPRisk(result);
  result.risk_score = risk.score;
  result.risk_level = risk.level;
  result.risk_factors = risk.factors;

  return result;
}
