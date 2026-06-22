import dns from 'dns';
import { promisify } from 'util';
import { calculatePhishingRisk } from '@/utils/riskEngine';

const resolve = promisify(dns.resolve);

const SUSPICIOUS_KEYWORDS = ['login', 'verify', 'account', 'update', 'confirm', 'secure', 'banking', 'paypal', 'amazon', 'netflix', 'google', 'apple', 'microsoft', 'facebook', 'instagram', 'whatsapp', 'password', 'credit', 'ssn', 'social security', 'reset', 'recover', 'authenticate', 'billing', 'refund', 'support', 'security', 'alert', 'unusual', 'suspended', 'limited'];
const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', '.online', '.click', '.download', '.review', '.work', '.date', '.men'];
const SHORTENER_DOMAINS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cli.gs', 'shorturl.at', 'ow.ly', 'buff.ly', 'tiny.cc', 'rebrand.ly', 'cutt.ly', 'shorte.st', 'adf.ly', 'bc.vc', 'bl.ink', 'budurl.com', 'chilp.it', 'cur.lv', 'db.tt', 'doiop.com', 'flic.kr', 'gg.gg', 'go2cut.com', 'soo.gd', 'v.gd', 'x.co', 'short.cm'];

const HOMOGRAPH_CHARS: Record<string, string> = { 'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x', 'і': 'i', 'ј': 'j', 'к': 'k', 'ӏ': 'l', 'ո': 'n', 'г': 'r', 'ѕ': 's', 'ԁ': 'd', 'ϲ': 'c', 'ο': 'o', '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g' };

function detectHomograph(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    for (const char of hostname) { if (HOMOGRAPH_CHARS[char]) return true; }
    if (/xn--/i.test(hostname)) return true;
    const latin = hostname.replace(/[a-z0-9.-]/g, '');
    if (/[аеорсух]/i.test(latin)) return true;
  } catch {}
  return false;
}

export async function analyzePhishing(url: string) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

  let domainExists = false;
  try { await resolve(new URL(url).hostname); domainExists = true; } catch {}

  const lowerUrl = url.toLowerCase();
  const hostname = url.includes('://') ? new URL(url).hostname : url.split('/')[0];
  const tld = '.' + hostname.split('.').pop();
  const suspicious_keywords = SUSPICIOUS_KEYWORDS.filter(k => lowerUrl.includes(k));
  const homograph_attack = detectHomograph(url);
  const url_shortener = SHORTENER_DOMAINS.some(d => hostname.includes(d));
  const suspicious_tld = SUSPICIOUS_TLDS.includes(tld);

  const analysis: any = { url, suspicious_keywords, homograph_attack, url_shortener, domain_exists: domainExists, suspicious_tld, tld, ssl_missing: !url.startsWith('https://'), mismatched_url: false, days_since_creation: 0, domain_registered: 'Unknown', timestamp: new Date().toISOString() };

  const risk = calculatePhishingRisk(analysis);
  analysis.risk_score = risk.score;
  analysis.risk_level = risk.probability;
  analysis.risk_factors = risk.factors;
  return analysis;
}
