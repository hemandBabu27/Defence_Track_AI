'use strict';
/**
 * Defence Track AI - Official-source updater
 *
 * Politely fetches the public home/notice pages of the official recruiting bodies,
 * extracts recruitment-related headlines + links, and stores them in data/live.json.
 * It never invents data: it only records what the official pages themselves list,
 * together with when and whether each site could be reached.
 *
 * Use it from the server (automatic, every REFRESH_HOURS) or standalone:
 *     node updater.js
 * (e.g. from cron or the GitHub Action in .github/workflows/update-live.yml)
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const DATA_DIR = path.join(__dirname, 'data');
const LIVE_FILE = path.join(DATA_DIR, 'live.json');

// Official sources only (government / PSU / official recruiting portals).
const SOURCES = [
  { id: 'upsc',      name: 'UPSC (NDA, CDS, CAPF)',         site: 'upsc.gov.in',             url: 'https://upsc.gov.in/' },
  { id: 'army',      name: 'Join Indian Army',              site: 'joinindianarmy.nic.in',   url: 'https://joinindianarmy.nic.in/' },
  { id: 'afcat',     name: 'IAF AFCAT',                     site: 'afcat.cdac.in',           url: 'https://afcat.cdac.in/' },
  { id: 'navy',      name: 'Join Indian Navy',              site: 'joinindiannavy.gov.in',   url: 'https://www.joinindiannavy.gov.in/' },
  { id: 'agniveer',  name: 'Agnipath Vayu (IAF)',           site: 'agnipathvayu.cdac.in',    url: 'https://agnipathvayu.cdac.in/' },
  { id: 'drdo',      name: 'DRDO (JRF / apprentices)',      site: 'drdo.gov.in',             url: 'https://www.drdo.gov.in/' }
];

const KEYWORDS = /(notification|recruitment|vacanc|advertis|apply|application|examination|\bexam\b|admit card|result|calendar|short notice|\bNDA\b|\bCDS\b|AFCAT|\bSSC\b|\bTGC\b|agniveer|agnipath|\bJRF\b|fellowship|apprentice|intake)/i;
const NOISE = /^(home|skip to|contact|sitemap|login|sign in|register|read more|click here|more|archive|about|faq|privacy|terms|screen reader|text size)/i;

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** Extract recruitment-looking links from an HTML page. Pure function (unit-testable). */
function extractHeadlines(html, baseUrl, limit = 12) {
  const out = [];
  const seen = new Set();
  const re = /<a\s[^>]*?href\s*=\s*["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const title = decodeEntities(m[2].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (title.length < 8 || title.length > 200) continue;
    if (NOISE.test(title) || !KEYWORDS.test(title)) continue;
    let href;
    try { href = new URL(decodeEntities(m[1]), baseUrl).href; } catch { continue; }
    if (!/^https?:\/\//i.test(href)) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ title, url: href });
    if (out.length >= limit) break;
  }
  return out;
}

function fetchText(url, { timeout = 15000, maxBytes = 2000000, redirects = 4 } = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'DefenceTrackAI-Updater/1.0 (student project; low-frequency, read-only)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if (redirects <= 0) return reject(new Error('Too many redirects'));
        const next = new URL(res.headers.location, url).href;
        if (!/^https?:\/\//i.test(next)) return reject(new Error('Bad redirect'));
        return resolve(fetchText(next, { timeout, maxBytes, redirects: redirects - 1 }));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      let size = 0;
      const chunks = [];
      res.on('data', (c) => {
        size += c.length;
        if (size > maxBytes) { req.destroy(new Error('Response too large')); return; }
        chunks.push(c);
      });
      res.on('end', () => resolve({ text: Buffer.concat(chunks).toString('utf8'), finalUrl: url }));
      res.on('error', reject);
    });
    req.setTimeout(timeout, () => req.destroy(new Error('Timeout')));
    req.on('error', reject);
  });
}

function readLive() {
  try { return JSON.parse(fs.readFileSync(LIVE_FILE, 'utf8')); } catch { return null; }
}

function writeLive(doc) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = LIVE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(doc, null, 2));
  fs.renameSync(tmp, LIVE_FILE);
}

async function refreshAll(log = console.log) {
  const previous = readLive();
  const prevById = new Map(((previous && previous.sources) || []).map((s) => [s.id, s]));

  const results = await Promise.all(SOURCES.map(async (src) => {
    const checkedAt = new Date().toISOString();
    try {
      const { text, finalUrl } = await fetchText(src.url);
      const headlines = extractHeadlines(text, finalUrl);
      log(`[updater] ${src.site}: OK, ${headlines.length} headline(s)`);
      return { id: src.id, name: src.name, site: src.site, url: src.url, ok: true, checkedAt, headlines };
    } catch (err) {
      log(`[updater] ${src.site}: FAILED (${err.message})`);
      const prev = prevById.get(src.id);
      return {
        id: src.id, name: src.name, site: src.site, url: src.url, ok: false, checkedAt,
        error: err.message,
        // keep the last good headlines so the UI isn't empty, but flag them as stale
        headlines: prev && prev.headlines ? prev.headlines : [],
        stale: Boolean(prev && prev.headlines && prev.headlines.length),
        lastSuccessAt: prev ? (prev.ok ? prev.checkedAt : prev.lastSuccessAt) : undefined
      };
    }
  }));

  const doc = { schema: 1, generatedAt: new Date().toISOString(), sources: results };
  writeLive(doc);
  return doc;
}

module.exports = { SOURCES, LIVE_FILE, extractHeadlines, fetchText, refreshAll, readLive };

if (require.main === module) {
  refreshAll().then((d) => {
    const ok = d.sources.filter((s) => s.ok).length;
    console.log(`[updater] done: ${ok}/${d.sources.length} sources reachable -> ${LIVE_FILE}`);
  }).catch((e) => { console.error(e); process.exit(1); });
}
