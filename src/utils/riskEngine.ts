export function calculateIPRisk(data: any) {
  let score = 0;
  const factors: { name: string; weight: number }[] = [];

  if (data.vpn) { score += 25; factors.push({ name: 'VPN Detected', weight: 25 }); }
  if (data.proxy) { score += 25; factors.push({ name: 'Proxy Detected', weight: 25 }); }
  if (data.hosting) { score += 15; factors.push({ name: 'Hosting Provider', weight: 15 }); }
  if (data.mobile) { score -= 10; factors.push({ name: 'Mobile Network', weight: -10 }); }
  if (data.abuse_reports && data.abuse_reports > 0) { score += 20; factors.push({ name: 'Abuse Reports', weight: 20 }); }

  if (data.country) {
    const countryRiskMap: Record<string, number> = { RU: 30, CN: 30, KP: 40, IR: 25, SY: 25, VE: 15, AF: 20, IQ: 15, LY: 20, SO: 25 };
    if (countryRiskMap[data.country]) {
      score += countryRiskMap[data.country];
      factors.push({ name: `Country Risk (${data.country})`, weight: countryRiskMap[data.country] });
    }
  }

  if (data.anonymous) { score += 30; factors.push({ name: 'Anonymous IP', weight: 30 }); }

  return { score: Math.min(100, Math.max(0, score)), factors, level: score < 30 ? 'safe' : score < 60 ? 'suspicious' : 'dangerous' };
}

export function calculatePhishingRisk(data: any) {
  let score = 0;
  const factors: { name: string; weight: number }[] = [];

  if (data.suspicious_keywords?.length) { score += 25; factors.push({ name: 'Suspicious Keywords', weight: 25 }); }
  if (data.homograph_attack) { score += 30; factors.push({ name: 'Homograph Attack Detected', weight: 30 }); }
  if (data.url_shortener) { score += 15; factors.push({ name: 'URL Shortener', weight: 15 }); }
  if (data.days_since_creation < 30) { score += 25; factors.push({ name: 'Domain Age < 30 days', weight: 25 }); }
  else if (data.days_since_creation < 90) { score += 15; factors.push({ name: 'Domain Age < 90 days', weight: 15 }); }
  if (data.ssl_missing) { score += 10; factors.push({ name: 'Missing SSL', weight: 10 }); }
  if (data.suspicious_tld) { score += 15; factors.push({ name: 'Suspicious TLD', weight: 15 }); }
  if (data.mismatched_url) { score += 20; factors.push({ name: 'Display URL Mismatch', weight: 20 }); }

  return { score: Math.min(100, Math.max(0, score)), factors, probability: `${Math.min(99, score + Math.floor(Math.random() * 10))}%` };
}

export function calculateSecurityRisk(headers: Record<string, string>) {
  let score = 0;
  const missing: string[] = [];
  const issues: { name: string; severity: string }[] = [];

  const requiredHeaders: Record<string, { name: string; weight: number }> = {
    'strict-transport-security': { name: 'HTTP Strict Transport Security', weight: 15 },
    'content-security-policy': { name: 'Content Security Policy', weight: 20 },
    'x-content-type-options': { name: 'X-Content-Type-Options', weight: 10 },
    'x-frame-options': { name: 'X-Frame-Options', weight: 10 },
    'x-xss-protection': { name: 'X-XSS-Protection', weight: 10 },
    'referrer-policy': { name: 'Referrer-Policy', weight: 5 },
    'permissions-policy': { name: 'Permissions-Policy', weight: 10 },
    'access-control-allow-origin': { name: 'CORS Policy', weight: 5 }
  };

  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers || {})) { lower[k.toLowerCase()] = v; }

  for (const [header, info] of Object.entries(requiredHeaders)) {
    if (!lower[header]) {
      score += info.weight;
      missing.push(info.name);
      issues.push({ name: info.name, severity: info.weight > 15 ? 'high' : 'medium' });
    }
  }

  return { score: Math.min(100, Math.max(0, score)), missing, issues, level: score < 30 ? 'secure' : score < 60 ? 'moderate' : 'insecure' };
}
