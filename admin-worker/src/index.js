// GT-NEWSTECH Remote Admin — Cloudflare Worker
// المرحلة 1: قراءة فقط (stats, articles, images, categories) + login.
// الواجهة الكاملة من admin/public/ تعمل كما هي — الميزات غير المتاحة تُرجع 501.

import { makeToken, requireAuth, validatePassword, sha256Hex } from './lib/auth.js';
import { getStats } from './routes/stats.js';
import { getCategories } from './routes/categories.js';
import { listArticles, getArticle, createArticle, updateArticle, removeArticle } from './routes/articles.js';
import { listImages, uploadImage, removeImage } from './routes/images.js';

export function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extra,
    },
  });
}

function notImplemented(action = 'unknown') {
  return json({
    error: 'هذه الميزة غير متاحة في الوضع البعيد (المرحلة 1 — قراءة فقط)',
    action,
    phase: 1,
    remote: true,
  }, 501);
}

function cors(req) {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token, X-Admin-Confirm, x-admin-token, x-admin-confirm',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(req) });
    }

    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(req);
    }

    try {
      const res = await route(req, env, url);
      const merged = new Headers(res.headers);
      for (const [k, v] of Object.entries(cors(req))) merged.set(k, v);
      return new Response(res.body, { status: res.status, headers: merged });
    } catch (err) {
      console.error('API error:', err);
      return json({ error: String(err && err.message || err) }, 500, cors(req));
    }
  },
};

async function route(req, env, url) {
  const p = url.pathname;
  const m = req.method;
  const params = Object.fromEntries(url.searchParams);

  // ── مفتوحة بدون مصادقة ──
  if (p === '/api/health')        return json({ ok: true, ts: Date.now(), repo: env.GITHUB_REPO, mode: 'remote', phase: 1 });
  if (p === '/api/mode')          return json({ mode: 'remote', phase: 1, readOnly: true });
  if (p === '/api/auth/status')   return json({ hasPassword: !!env.ADMIN_PASS_HASH });

  if (p === '/api/auth/login' && m === 'POST') {
    const body = await req.json().catch(() => ({}));
    if (!await validatePassword(env, body.password || '')) {
      return json({ error: 'invalid password' }, 401);
    }
    const token = await makeToken(env);
    return json({ ok: true, token });
  }

  // ── محمية ──
  if (!await requireAuth(req, env)) {
    return json({ error: 'unauthorized', sessionExpired: true }, 401);
  }

  // قراءة (المرحلة 1) ─────────────────────────────────────
  if (p === '/api/stats'      && m === 'GET') return getStats(env);
  if (p === '/api/categories' && m === 'GET') return getCategories(env);
  if (p === '/api/articles'   && m === 'GET') return listArticles(env, params);
  if (p === '/api/article'    && m === 'GET') return getArticle(env, params);
  if (p === '/api/images'     && m === 'GET') return listImages(env, params);
  if (p === '/api/config'     && m === 'GET') return json({ remote: true, phase: 2, repo: env.GITHUB_REPO });

  // كتابة (المرحلة 2) ─────────────────────────────────────
  if (p === '/api/article' && m === 'POST')   return createArticle(env, req);
  if (p === '/api/article' && m === 'PUT')    return updateArticle(env, req, params);
  if (p === '/api/article' && m === 'DELETE') return removeArticle(env, params);

  // رفع الصور: POST /api/images/:lang  |  حذف: DELETE /api/images/:lang/:name
  const imgMatch = p.match(/^\/api\/images\/(ar|en)(?:\/(.+))?$/);
  if (imgMatch) {
    const [, ilang, iname] = imgMatch;
    if (m === 'POST' && !iname) return uploadImage(env, req, ilang);
    if (m === 'DELETE' && iname) return removeImage(env, ilang, decodeURIComponent(iname));
  }

  // ─── stubs آمنة (UI يتعامل معها بدون أخطاء) ──────────
  if (p === '/api/auth/security' && m === 'GET') {
    return json({ confirmFor: {}, sessionMinutes: 1440, remote: true });
  }
  if (p === '/api/git/status' && m === 'GET') {
    return json({ clean: true, ahead: 0, behind: 0, remote: 'github-api', message: 'remote mode' });
  }
  if (p === '/api/remotes' && m === 'GET') {
    return json([{ name: 'origin', url: `https://github.com/${env.GITHUB_REPO}` }]);
  }
  if (p === '/api/trash' && m === 'GET') {
    return json([]);  // لا مهملات في الوضع البعيد (المرحلة 1)
  }
  if (p === '/api/github-token/status' && m === 'GET') {
    return json({ hasToken: false });
  }
  if (p === '/api/comments' && m === 'GET') {
    return json({ discussions: [], remote: true });
  }

  // ─── كل المسارات الأخرى (الكتابة/التعديل/الحذف…) ─────
  return notImplemented(`${m} ${p}`);
}
