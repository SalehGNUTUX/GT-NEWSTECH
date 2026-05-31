// CRUD للمقالات. القراءة تستعمل _data/articles-index.json (طلب واحد).
// الكتابة عبر GitHub Contents API (commit واحد لكل عملية).

import { getFile, putFile, deleteFile } from '../lib/github.js';
import { parseFrontMatter, buildMarkdown } from '../lib/yaml.js';
import { moveToTrash } from './trash.js';
import { json } from '../index.js';

// ── cache صغير لـ index (60s) ──────────────────────────────
let _indexCache = { ts: 0, val: null };

function invalidateIndexCache() { _indexCache = { ts: 0, val: null }; }

async function getIndex(env) {
  const now = Date.now();
  if (now - _indexCache.ts < 60_000 && _indexCache.val) return _indexCache.val;
  const f = await getFile(env, '_data/articles-index.json');
  if (!f) throw new Error('articles-index.json غير موجود — شغّل scripts/build-articles-index.js');
  const parsed = JSON.parse(f.content);
  _indexCache = { ts: now, val: parsed };
  return parsed;
}

export async function getAllArticles(env) {
  const idx = await getIndex(env);
  return idx.articles || [];
}

// GET /api/articles?lang=&cat=&q=
export async function listArticles(env, params) {
  let list = await getAllArticles(env);
  if (params.lang) list = list.filter(a => a._lang === params.lang);
  if (params.cat) list = list.filter(a => a._cat === params.cat);
  if (params.q) {
    const q = params.q.toLowerCase();
    list = list.filter(a => (a.title || '').toLowerCase().includes(q));
  }
  return json(list);
}

// GET /api/article?lang=&cat=&file=
export async function getArticle(env, params) {
  const { lang, cat, file } = params;
  const err = validateRefStrict(lang, cat, file);
  if (err) return json({ error: err }, 400);
  const path = `_${lang}/${cat}/${file}`;
  const f = await getFile(env, path);
  if (!f) return json({ error: 'Not found' }, 404);
  const { data, body } = parseFrontMatter(f.content);
  return json({
    ...data,
    content: (body || '').trim(),
    _file: file,
    _lang: lang,
    _cat: cat,
    _sha: f.sha,
  });
}

// ── الكتابة ───────────────────────────────────────────────

const AUTHOR = {
  name: 'GT-NEWSTECH Admin (remote)',
  email: 'admin@gt-newstech.local',
};

// تحويل "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DD HH:MM:SS +0000" (يُكتب في YAML غير مقتبس)
// إذا كان النص ISO بالفعل، نتركه كما هو.
function normalizeDate(d) {
  if (!d) return d;
  if (d instanceof Date) return d.toISOString().replace(/\.\d+Z$/, 'Z');
  let s = String(d).trim();
  // ISO مع Z — نُبقيها كما هي (نقطع المللي فقط):
  // "2026-05-31T13:00:00.000Z" → "2026-05-31T13:00:00Z"
  // parseDatetime في admin.js يكتشف ISO Z ويحوّلها لـ local عند التحرير
  if (/Z$/.test(s)) return s.replace(/\.\d+Z$/, 'Z');
  if (/[+-]\d{2}:?\d{2}$/.test(s)) return s; // ISO مع offset
  // fallback: نص "YYYY-MM-DD HH:MM:SS" بدون منطقة → نحوّله إلى ISO Z (يُعامَل كـ UTC)
  const m = s.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2})(?::(\d{2}))?)?$/);
  if (!m) return s;
  const datePart = m[1];
  const timePart = m[2] || '00:00';
  const secPart = m[3] || '00';
  return `${datePart}T${timePart}:${secPart}Z`;
}

// POST /api/article  body: { lang, cat, slug, content, ...frontmatter }
export async function createArticle(env, req) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'invalid JSON' }, 400);
  const { lang, cat, slug, content = '', ...fm } = body;

  if (!lang || !cat || !slug) return json({ error: 'lang, cat, slug مطلوبة' }, 400);
  if (!/^(ar|en)$/.test(lang)) return json({ error: 'lang غير صحيح' }, 400);
  if (!/^[\w-]+$/.test(cat)) return json({ error: 'cat غير صحيح' }, 400);
  if (!/^[a-z0-9][\w-]*$/i.test(slug)) return json({ error: 'slug يجب أن يكون لاتيني (أحرف، أرقام، -، _)' }, 400);

  // تاريخ
  const dateForFilename = dateToYMD(fm.date);
  const file = `${dateForFilename}-${slug}.md`;
  const path = `_${lang}/${cat}/${file}`;

  // تحقّق أن الملف لا يوجد
  const existing = await getFile(env, path);
  if (existing) return json({ error: 'مقال بنفس الـ slug والتاريخ موجود' }, 409);

  // بناء front matter
  const cleanFm = {
    layout: fm.layout || 'post',
    title: fm.title || '',
    date: normalizeDate(fm.date),
    category: cat,
    lang,
    slug,
    author: fm.author || 'GNUTUX',
    ...(fm.tags ? { tags: fm.tags } : {}),
    ...(fm.excerpt ? { excerpt: fm.excerpt } : {}),
    ...(fm.image ? { image: fm.image } : {}),
    ...(fm.also_in ? { also_in: fm.also_in } : {}),
    ...(fm.affiliate !== undefined ? { affiliate: fm.affiliate } : {}),
  };
  const md = buildMarkdown(cleanFm, '\n' + content.trim() + '\n');

  await putFile(env, {
    path,
    content: md,
    message: `feat: ${fm.title || slug} (${lang}/${cat}) [remote]`,
    author: AUTHOR,
  });

  invalidateIndexCache();
  return json({ ok: true, path, file, message: 'تم الإنشاء — الـ index سيُحدّث خلال ~30 ثانية' });
}

// PUT /api/article?lang=&cat=&file=  body: { ...frontmatter, content }
export async function updateArticle(env, req, params) {
  const { lang, cat, file } = params;
  const err = validateRefStrict(lang, cat, file);
  if (err) return json({ error: err }, 400);

  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'invalid JSON' }, 400);
  const { content = '', ...fm } = body;

  const path = `_${lang}/${cat}/${file}`;
  const existing = await getFile(env, path);
  if (!existing) return json({ error: 'المقال غير موجود' }, 404);

  // إعادة بناء front matter — نحافظ على الحقول المُرسَلة فقط
  const cleanFm = {
    layout: fm.layout || 'post',
    title: fm.title || '',
    date: normalizeDate(fm.date),
    category: cat,
    lang,
    slug: fm.slug || file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, ''),
    author: fm.author || 'GNUTUX',
    ...(fm.tags ? { tags: fm.tags } : {}),
    ...(fm.excerpt ? { excerpt: fm.excerpt } : {}),
    ...(fm.image ? { image: fm.image } : {}),
    ...(fm.also_in ? { also_in: fm.also_in } : {}),
    ...(fm.affiliate !== undefined ? { affiliate: fm.affiliate } : {}),
  };
  const md = buildMarkdown(cleanFm, '\n' + content.trim() + '\n');

  try {
    await putFile(env, {
      path,
      content: md,
      sha: existing.sha,
      message: `update: ${fm.title || file} [remote]`,
      author: AUTHOR,
    });
  } catch (e) {
    if (e.status === 409) {
      return json({ error: 'تم تعديل المقال من جهاز آخر. أعد التحميل وحاول مجدداً.' }, 409);
    }
    throw e;
  }

  invalidateIndexCache();
  return json({ ok: true, path, message: 'تم التعديل' });
}

// DELETE /api/article?lang=&cat=&file=
// ينقل إلى _trash/ بدل الحذف الصلب — قابل للاسترجاع من تبويب المهملات
export async function removeArticle(env, params) {
  const { lang, cat, file } = params;
  const err = validateRefStrict(lang, cat, file);
  if (err) return json({ error: err }, 400);

  const path = `_${lang}/${cat}/${file}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const existing = await getFile(env, path);
    if (!existing) return json({ error: 'المقال غير موجود' }, 404);

    try {
      const { data } = parseFrontMatter(existing.content);
      const result = await moveToTrash(env, {
        originalPath: path,
        content: existing.content,
        sha: existing.sha,
        frontmatter: data,
      });
      invalidateIndexCache();
      return json({
        ok: true,
        path,
        trashId: result.id,
        message: 'نُقل إلى السلة — يمكنك استرجاعه من تبويب المهملات',
      });
    } catch (e) {
      if (e.status === 409 && attempt < 3) {
        await new Promise(r => setTimeout(r, 600 * attempt));
        continue;
      }
      throw e;
    }
  }
}

// ── أدوات داخلية ──────────────────────────────────────────

function validateRefStrict(lang, cat, file) {
  if (!lang || !cat || !file) return 'Missing params';
  if (!/^(ar|en)$/.test(lang)) return 'invalid lang';
  if (!/^[\w-]+$/.test(cat)) return 'invalid cat';
  if (!/^\d{4}-\d{2}-\d{2}-[\w.-]+\.md$/.test(file)) return 'invalid file';
  return null;
}

// تسمية الملف: نستخدم تاريخ UTC من ISO (متطابق مع _data/articles-index.json)
// مهم: إذا أرسل المتصفح تاريخاً محلياً عبر ISO (بعد تحويل mode-detect)،
// قد يختلف اليوم عن اليوم المحلي قرب منتصف الليل — لكن الأهم هو
// التطابق مع date في front matter (UTC)
function dateToYMD(d) {
  if (!d) {
    const n = new Date();
    return `${n.getUTCFullYear()}-${pad(n.getUTCMonth()+1)}-${pad(n.getUTCDate())}`;
  }
  if (d instanceof Date) {
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
  }
  const s = String(d).trim();
  // إذا ISO Z، استخرج التاريخ بعد التحويل لـ UTC date
  if (/Z$/.test(s)) {
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth()+1)}-${pad(dt.getUTCDate())}`;
    }
  }
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '1970-01-01';
}

function pad(n) { return String(n).padStart(2, '0'); }
