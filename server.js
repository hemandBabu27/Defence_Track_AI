'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const updater = require('./updater');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const REFRESH_MS = Math.max(0.25, Number(process.env.REFRESH_HOURS) || 6) * 3600 * 1000;
const MANUAL_REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Server-side files must never be served as static assets.
const PRIVATE_FILES = new Set(['server.js', 'updater.js', 'package.json', 'package-lock.json']);

// ---------- Auto-update loop ----------
let refreshing = false;
let lastRefreshStarted = 0;
let nextRefreshAt = null;

async function runRefresh(reason) {
  if (refreshing) return false;
  refreshing = true;
  lastRefreshStarted = Date.now();
  console.log(`[server] Refreshing official sources (${reason})...`);
  try {
    await updater.refreshAll(console.log);
  } catch (e) {
    console.error('[server] Refresh failed:', e.message);
  } finally {
    refreshing = false;
    nextRefreshAt = new Date(Date.now() + REFRESH_MS).toISOString();
  }
  return true;
}

function startAutoUpdate() {
  const live = updater.readLive();
  const age = live ? Date.now() - new Date(live.generatedAt).getTime() : Infinity;
  setTimeout(() => runRefresh(age > REFRESH_MS ? 'startup, data stale' : 'startup'), 2000);
  nextRefreshAt = new Date(Date.now() + REFRESH_MS).toISOString();
  setInterval(() => runRefresh('scheduled'), REFRESH_MS).unref();
}

// ---------- HTTP ----------
function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

function handleApi(req, res, pathname) {
  if (pathname === '/api/live' && req.method === 'GET') {
    const live = updater.readLive() || { schema: 1, generatedAt: null, sources: [] };
    return sendJson(res, 200, Object.assign({}, live, {
      serverTime: new Date().toISOString(),
      refreshing,
      nextRefreshAt
    }));
  }
  if (pathname === '/api/refresh' && req.method === 'POST') {
    if (refreshing) return sendJson(res, 202, { status: 'already-refreshing' });
    const wait = lastRefreshStarted + MANUAL_REFRESH_COOLDOWN_MS - Date.now();
    if (wait > 0) return sendJson(res, 429, { status: 'cooldown', retryAfterSeconds: Math.ceil(wait / 1000) });
    runRefresh('manual');
    return sendJson(res, 202, { status: 'started' });
  }
  if (pathname === '/api/health') return sendJson(res, 200, { ok: true, time: new Date().toISOString() });
  return sendJson(res, 404, { error: 'Unknown API route' });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Bad request');
  }

  if (pathname.startsWith('/api/')) return handleApi(req, res, pathname);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }

  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT, pathname);

  // Directory-traversal guard (must be strictly inside ROOT), no dotfiles, no private files,
  // and only the live data file is exposed from /data.
  const rel = path.relative(ROOT, filePath);
  const inside = rel && !rel.startsWith('..') && !path.isAbsolute(rel);
  const parts = rel.split(path.sep);
  const isDot = parts.some((p) => p.startsWith('.'));
  const isDataDir = parts[0] === 'data' && rel !== path.join('data', 'live.json');
  if (!inside || isDot || isDataDir || PRIVATE_FILES.has(rel)) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<h1>403 Forbidden</h1>');
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!MIME_TYPES[ext]) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<h1>404 Not Found</h1>');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      const notFound = err.code === 'ENOENT' || err.code === 'EISDIR';
      res.writeHead(notFound ? 404 : 500, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(notFound ? '<h1>404 Not Found</h1>' : `<h1>500 Internal Server Error</h1><p>${err.code}</p>`);
    }
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext],
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log('🛡️  Defence Track AI (TKMCE Defence Focus Club) is running');
  console.log(`🔗 URL: http://localhost:${PORT}/`);
  console.log(`🔄 Auto-updating from official sites every ${REFRESH_MS / 3600000} h  (REFRESH_HOURS to change)`);
  console.log('====================================================');
  startAutoUpdate();
});
