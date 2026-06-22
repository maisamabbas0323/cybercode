# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# UI/Design
- Use gradient buttons with hover shine effects, glow shadows, and scale animations instead of plain shadcn defaults for primary actions. Confidence: 0.85
- Cards (StatCards) should be clickable with pointer cursor — wrap in Link components when they navigate to detail pages. Confidence: 0.80
- Apply cyber/dark theme consistently: glassmorphism cards, neon blue (#00d4ff) and cyan (#00ff88) accents, animated particle background, scan-line effects on input cards. Confidence: 0.85

# Project Architecture
- For projects deploying to Vercel: convert all API logic into Next.js API routes (serverless functions) instead of maintaining a separate Express backend. Confidence: 0.85
- No databases, no authentication, no AI models — use real public APIs and browser APIs only. Confidence: 0.80
- No mock data or placeholder content — every feature must work with real logic or gracefully handle API failures with cached fallback data. Confidence: 0.80

# APIs & Data Sources
- Prefer NVD API (services.nvd.nist.gov) over CIRCL (cve.circl.lu) for CVE data — CIRCL is unreliable and often returns GHSA-only results with missing CVSS data. Confidence: 0.85
- Always include a local fallback/cache of curated data when external APIs are rate-limited or unreachable. Confidence: 0.75

# Backend Implementation
- Node.js backend services must not use TypeScript type annotations (no `: any`, `: string`) in `.js` files — causes SyntaxError. Confidence: 0.80
- The `https` native module is more reliable than axios for external API calls in serverless contexts. Confidence: 0.70

# Quality
- Test all backend endpoints and verify all features work before considering a feature complete. User expects 100% working functionality. Confidence: 0.85

