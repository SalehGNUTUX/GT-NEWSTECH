// GT-NEWSTECH Remote Admin — Cloudflare Worker
// المرحلة 1: قراءة فقط (stats, articles, images, categories) + login.
// الواجهة الكاملة من admin/public/ تعمل كما هي — الميزات غير المتاحة تُرجع 501.

import { makeToken, requireAuth, validatePassword, sha256Hex, makeConfirmToken, requireConfirm } from './lib/auth.js';
import { getStats } from './routes/stats.js';
import { getCategories, createCategory } from './routes/categories.js';
import { listArticles, getArticle, createArticle, updateArticle, removeArticle } from './routes/articles.js';
import { listImages, uploadImage, removeImage } from './routes/images.js';
import { listTrash, restoreFromTrash, purgeTrashItem, emptyTrash } from './routes/trash.js';
import { listComments, replyToDiscussion, hideComment, unhideComment, deleteComment, lockDiscussion, unlockDiscussion } from './routes/comments.js';

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
  if (p === '/api/health')        return json({ ok: true, ts: Date.now(), repo: env.GITHUB_REPO, mode: 'remote', phase: 2 });
  if (p === '/api/mode')          return json({ mode: 'remote', phase: 2, readOnly: false });
  if (p === '/api/auth/status')   return json({ hasPassword: !!env.ADMIN_PASS_HASH });

  if (p === '/api/auth/login' && m === 'POST') {
    const body = await req.json().catch(() => ({}));
    if (!await validatePassword(env, body.password || '')) {
      return json({ error: 'invalid password' }, 401);
    }
    const token = await makeToken(env);
    return json({ ok: true, token });
  }

  // تأكيد كلمة المرور للعمليات الحساسة (يُسلِّم confirmToken صالح 30 ثانية)
  if (p === '/api/auth/confirm' && m === 'POST') {
    // يحتاج جلسة سليمة أولاً
    if (!await requireAuth(req, env)) {
      return json({ error: 'unauthorized', sessionExpired: true }, 401);
    }
    const body = await req.json().catch(() => ({}));
    if (!await validatePassword(env, body.password || '')) {
      return json({ error: 'كلمة مرور خاطئة' }, 401);
    }
    const confirmToken = await makeConfirmToken(env);
    return json({ ok: true, confirmToken });
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
  if (p === '/api/categories' && m === 'POST') return createCategory(env, req);

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
  // المهملات (المرحلة 2.5) ─────────────────────────────────
  if (p === '/api/trash' && m === 'GET')    return listTrash(env);
  if (p === '/api/trash' && m === 'DELETE') return emptyTrash(env);
  const tMatch = p.match(/^\/api\/trash\/([^/]+)(?:\/(restore))?$/);
  if (tMatch) {
    const [, tid, action] = tMatch;
    if (action === 'restore' && m === 'POST') return restoreFromTrash(env, tid);
    if (!action && m === 'DELETE') return purgeTrashItem(env, tid);
  }
  if (p === '/api/github-token/status' && m === 'GET') {
    // في الـ Worker، التوكن مُدمج (GITHUB_TOKEN واحد لكل العمليات)
    return json({ hasToken: !!env.GITHUB_TOKEN, source: 'worker-secret' });
  }

  // DELETE /api/github-token — يحتاج تأكيد كلمة المرور
  if (p === '/api/github-token' && m === 'DELETE') {
    if (!await requireConfirm(req, env)) {
      return json({ needsConfirm: true, action: 'manage_security' }, 401);
    }
    // الـ Worker لا يستطيع حذف Cloudflare secret من داخله — توضيح للمستخدم
    return json({
      ok: false,
      error: 'لإزالة التوكن فعلياً، شغّل من جهازك: npx wrangler secret delete GITHUB_TOKEN ' +
             '(الـ Worker لا يحذف secrets الـ Cloudflare من داخله لأسباب أمنية)',
      needsCli: true,
    }, 501);
  }
  // POST /api/github-token — أيضاً غير متاح من الواجهة البعيدة
  if (p === '/api/github-token' && m === 'POST') {
    if (!await requireConfirm(req, env)) {
      return json({ needsConfirm: true, action: 'manage_security' }, 401);
    }
    return json({
      ok: false,
      error: 'لإضافة/تغيير التوكن، شغّل من جهازك: cat token.txt | npx wrangler secret put GITHUB_TOKEN',
      needsCli: true,
    }, 501);
  }

  // التعليقات (GitHub Discussions GraphQL) ─────────────────
  if (p === '/api/comments' && m === 'GET') return listComments(env);
  if (p === '/api/comments/reply' && m === 'POST') return replyToDiscussion(env, req);
  const cMatch = p.match(/^\/api\/comments\/([^/]+)(?:\/(hide|unhide))?$/);
  if (cMatch) {
    const [, cid, action] = cMatch;
    if (action === 'hide' && m === 'POST') return hideComment(env, req, cid);
    if (action === 'unhide' && m === 'POST') return unhideComment(env, cid);
    if (!action && m === 'DELETE') return deleteComment(env, cid);
  }
  const dMatch = p.match(/^\/api\/comments\/discussion\/([^/]+)\/(lock|unlock)$/);
  if (dMatch && m === 'POST') {
    const [, did, action] = dMatch;
    if (action === 'lock') return lockDiscussion(env, did);
    if (action === 'unlock') return unlockDiscussion(env, did);
  }

  // ─── كل المسارات الأخرى (الكتابة/التعديل/الحذف…) ─────
  return notImplemented(`${m} ${p}`);
}
