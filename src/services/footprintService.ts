import { httpsGet } from './httpsFetch';

export async function checkUsername(username: string) {
  const platforms = [
    { name: 'GitHub', url: `https://api.github.com/users/${encodeURIComponent(username)}`, check: (d: any) => !!d.login },
    { name: 'Twitter/X', url: `https://api.twitter.com/i/users/username_available.json?username=${encodeURIComponent(username)}`, check: (d: any) => !d.available },
    { name: 'Reddit', url: `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`, check: (d: any) => !d.error },
    { name: 'HackerNews', url: `https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(username)}.json`, check: (d: any) => d && d.id },
    { name: 'Keybase', url: `https://keybase.io/_/api/1.0/user/lookup.json?username=${encodeURIComponent(username)}`, check: (d: any) => d.status?.code === 0 },
  ];

  const results = await Promise.allSettled(
    platforms.map(async (p) => {
      try { const data = await httpsGet(p.url); return { platform: p.name, exists: p.check(data) }; }
      catch { return { platform: p.name, exists: false }; }
    })
  );

  const found = results.filter(r => r.status === 'fulfilled' && r.value.exists).map(r => (r as any).value.platform);
  return { username, platforms: results.map(r => r.status === 'fulfilled' ? (r as any).value : { platform: 'Unknown', exists: false }), found, total_checked: platforms.length };
}
