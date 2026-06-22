import { httpsGet } from './httpsFetch';

const CACHE: Record<string, { data: any[]; time: number }> = {};
const CACHE_TTL = 10 * 60 * 1000;

function nvdToCVE(v: any) {
  const m = v.cve.metrics;
  const cvss = m?.cvssMetricV31?.[0]?.cvssData || m?.cvssMetricV30?.[0]?.cvssData || m?.cvssMetricV2?.[0]?.cvssData || {};
  let desc = 'No description available';
  if (v.cve.descriptions) {
    for (let i = 0; i < v.cve.descriptions.length; i++) {
      if (v.cve.descriptions[i].lang === 'en') { desc = v.cve.descriptions[i].value; break; }
    }
    if (desc === 'No description available' && v.cve.descriptions[0]) desc = v.cve.descriptions[0].value;
  }
  const refs: string[] = [];
  if (v.cve.references) for (let j = 0; j < v.cve.references.length; j++) { if (v.cve.references[j].url) refs.push(v.cve.references[j].url); }
  const score = cvss.baseScore || 0;
  return { id: v.cve.id, published: v.cve.published || '', description: desc, severity: cvss.baseSeverity || (score >= 9 ? 'CRITICAL' : score >= 7 ? 'HIGH' : score >= 4 ? 'MEDIUM' : 'LOW'), cvss: score, references: refs };
}

const FALLBACK_CVES = [
  { id: 'CVE-2024-3094', published: '2024-03-29', description: 'Critical backdoor in XZ Utils (liblzma) affecting SSH authentication.', severity: 'CRITICAL', cvss: 10, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-3094'] },
  { id: 'CVE-2024-21626', published: '2024-01-31', description: 'runc container breakout vulnerability allowing host filesystem access.', severity: 'CRITICAL', cvss: 8.6, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-21626'] },
  { id: 'CVE-2024-27198', published: '2024-03-04', description: 'JetBrains TeamCity authentication bypass allowing unauthenticated RCE.', severity: 'CRITICAL', cvss: 9.8, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-27198'] },
  { id: 'CVE-2024-4577', published: '2024-06-12', description: 'PHP CGI argument injection vulnerability on Windows leading to RCE.', severity: 'CRITICAL', cvss: 9.8, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-4577'] },
  { id: 'CVE-2024-6387', published: '2024-07-01', description: 'OpenSSH regreSSHion vulnerability - signal handler race condition in sshd.', severity: 'HIGH', cvss: 8.1, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-6387'] },
  { id: 'CVE-2024-38077', published: '2024-07-09', description: 'Windows Remote Desktop Licensing Service RCE vulnerability (MadLicense).', severity: 'CRITICAL', cvss: 9.8, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-38077'] },
  { id: 'CVE-2024-1086', published: '2024-01-31', description: 'Linux kernel use-after-free in netfilter nf_tables allowing privilege escalation.', severity: 'HIGH', cvss: 7.8, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-1086'] },
  { id: 'CVE-2024-27316', published: '2024-04-04', description: 'Apache HTTP Server HTTP/2 CONTINUATION flood denial of service vulnerability.', severity: 'HIGH', cvss: 7.5, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-27316'] },
  { id: 'CVE-2024-47575', published: '2024-10-08', description: 'Apache Avro SDK Java deserialization RCE vulnerability in schema parsing.', severity: 'CRITICAL', cvss: 9.8, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-47575'] },
  { id: 'CVE-2024-3400', published: '2024-04-12', description: 'Palo Alto Networks PAN-OS command injection in GlobalProtect.', severity: 'CRITICAL', cvss: 9.8, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-3400'] },
  { id: 'CVE-2024-21887', published: '2024-01-12', description: 'Ivanti Connect Secure command injection in web component.', severity: 'CRITICAL', cvss: 9.1, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-21887'] },
  { id: 'CVE-2024-24919', published: '2024-05-07', description: 'Check Point Security Gateway information disclosure on Gaia OS.', severity: 'HIGH', cvss: 8.6, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-24919'] },
  { id: 'CVE-2024-1709', published: '2024-02-21', description: 'ConnectWise ScreenConnect authentication bypass.', severity: 'CRITICAL', cvss: 9.8, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-1709'] },
  { id: 'CVE-2024-23897', published: '2024-01-18', description: 'Jenkins CLI arbitrary file read via argument parsing.', severity: 'HIGH', cvss: 7.5, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-23897'] },
  { id: 'CVE-2024-28995', published: '2024-04-25', description: 'SolarWinds Serv-U directory traversal allowing unauthenticated file access.', severity: 'HIGH', cvss: 7.5, references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-28995'] },
];

export async function searchCVE(query: string) {
  const key = 'cve_search_' + query;
  if (CACHE[key] && Date.now() - CACHE[key].time < CACHE_TTL) return CACHE[key].data;
  try {
    const data = await httpsGet('https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=' + encodeURIComponent(query) + '&resultsPerPage=20');
    const vulns = data?.vulnerabilities || [];
    if (vulns.length > 0) { const result = vulns.map(nvdToCVE); CACHE[key] = { data: result, time: Date.now() }; return result; }
  } catch {}
  const q = query.toLowerCase();
  const filtered = FALLBACK_CVES.filter(c => c.id.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  if (filtered.length > 0) { CACHE[key] = { data: filtered, time: Date.now() }; return filtered; }
  return [];
}

export async function getLatestCVE() {
  const key = 'cve_latest';
  if (CACHE[key] && Date.now() - CACHE[key].time < CACHE_TTL) return CACHE[key].data;
  try {
    const data = await httpsGet('https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=20');
    const vulns = data?.vulnerabilities || [];
    if (vulns.length > 0) { const result = vulns.map(nvdToCVE); CACHE[key] = { data: result, time: Date.now() }; return result; }
  } catch {}
  CACHE[key] = { data: FALLBACK_CVES, time: Date.now() };
  return FALLBACK_CVES;
}
