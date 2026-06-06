// قراءة + رفع الصور — نسخة مطابقة لـ admin/server.js (مع تحفظات الـ Worker)
import { listDir, putBinaryFile, getFile, deleteFile } from '../lib/github.js';
import { json } from '../index.js';

const MAX_SIZE = 20 * 1024 * 1024; // 20MB (متطابق مع admin/server.js)
const EXT_OK = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i;
const AUTHOR = { name: 'GT-NEWSTECH Admin (remote)', email: 'admin@gt-newstech.local' };

// cache لـ images-index (60s)
let _imgCache = { ts: 0, val: null };
async function getImagesIndex(env) {
  const now = Date.now();
  if (now - _imgCache.ts < 60_000 && _imgCache.val) return _imgCache.val;
  const f = await getFile(env, '_data/images-index.json');
  if (!f) return null;
  try {
    const parsed = JSON.parse(f.content);
    _imgCache = { ts: now, val: parsed };
    return parsed;
  } catch { return null; }
}

// map: image_name → article_date (timestamp)
async function buildImageToArticleDate(env, lang) {
  const map = new Map();
  try {
    const f = await getFile(env, '_data/articles-index.json');
    if (!f) return map;
    const idx = JSON.parse(f.content);
    for (const a of (idx.articles || [])) {
      if (a._lang !== lang || !a.image) continue;
      const imgName = String(a.image).includes('/') ? String(a.image).split('/').pop() : a.image;
      const dt = new Date(a.date).getTime();
      if (!isFinite(dt)) continue;
      if (!map.has(imgName) || map.get(imgName) < dt) map.set(imgName, dt);
    }
  } catch (_) {}
  return map;
}

async function getImages(env, lang) {
  const imgToArticleDate = await buildImageToArticleDate(env, lang);

  // (1) listDir من GitHub Contents API = مصدر الحقيقة لأي ملفات موجودة
  // (يلتقط الصور المرفوعة حديثاً قبل تحديث index)
  const items = await listDir(env, `assets/images/${lang}`);
  const fileMap = new Map();
  for (const x of items) {
    if (x.type !== 'file' || !EXT_OK.test(x.name)) continue;
    fileMap.set(x.name, { name: x.name, size: x.size, mtime: 0, path: x.path });
  }

  // (2) الـindex يكمل بـts دقيقة من git log
  const idx = await getImagesIndex(env);
  if (idx && idx[lang]) {
    for (const im of idx[lang]) {
      if (!fileMap.has(im.name)) continue;
      fileMap.get(im.name).mtime = im.last_modified_ts * 1000;
    }
  }

  // (3) فلتر companions
  const nameSet = new Set(fileMap.keys());
  const isCompanion = name => {
    if (!name.toLowerCase().endsWith('.webp')) return false;
    const base = name.slice(0, -5);
    return nameSet.has(base + '.jpg') || nameSet.has(base + '.jpeg') ||
           nameSet.has(base + '.png') || nameSet.has(base + '.JPG') ||
           nameSet.has(base + '.JPEG') || nameSet.has(base + '.PNG');
  };

  // (4) ترتيب: تاريخ المقال > git log > 0 (للملفات الجديدة جداً)
  return Array.from(fileMap.values())
    .filter(im => !isCompanion(im.name))
    .map(im => {
      const articleDate = imgToArticleDate.get(im.name);
      return {
        name: im.name,
        size: im.size,
        lang,
        url: `https://raw.githubusercontent.com/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/${im.path}`,
        _sortTs: articleDate || im.mtime,
      };
    })
    .sort((a, b) => b._sortTs - a._sortTs)
    .map(({ _sortTs, ...rest }) => rest);
}

// GET /api/images?lang=
export async function listImages(env, params) {
  if (params.lang) return json(await getImages(env, params.lang));
  const [ar, en] = await Promise.all([getImages(env, 'ar'), getImages(env, 'en')]);
  return json([...ar, ...en]);
}

// POST /api/images/:lang  (multipart/form-data بحقل "files" — يدعم رفع متعدد)
// يطابق contract اللوحة المحلية: { ok, uploaded: [{ name, size, url, converted }] }
export async function uploadImage(env, req, lang) {
  if (!/^(ar|en)$/.test(lang)) return json({ error: 'lang غير صحيح' }, 400);

  const ct = req.headers.get('content-type') || '';
  if (!ct.startsWith('multipart/form-data')) {
    return json({ error: 'يجب multipart/form-data' }, 400);
  }

  let form;
  try { form = await req.formData(); }
  catch (e) { return json({ error: 'فشل قراءة multipart: ' + e.message }, 400); }

  // اقبل "files" (متعدد، كما يُرسل admin.js) أو "image" (مفرد، fallback)
  let files = form.getAll('files').filter(f => f && typeof f !== 'string');
  if (files.length === 0) {
    const single = form.get('image');
    if (single && typeof single !== 'string') files = [single];
  }
  if (files.length === 0) {
    return json({ error: 'لم يُرسَل أي ملف (حقل files أو image)' }, 400);
  }

  const uploaded = [];
  for (const file of files) {
    if (file.size > MAX_SIZE) {
      uploaded.push({ name: file.name, error: `حجم > ${MAX_SIZE/1024/1024}MB` });
      continue;
    }
    // اسم نظيف. نستعمل Unicode-aware regex (يُبقي الحروف العربية والإنجليزية والأرقام)
    let name = (file.name || 'image').toString().trim();
    name = name.replace(/[^\p{L}\p{N}._-]+/gu, '_').replace(/_{2,}/g, '_');
    if (!EXT_OK.test(name)) {
      uploaded.push({ name: file.name, error: 'صيغة غير مدعومة' });
      continue;
    }
    const path = `assets/images/${lang}/${name}`;
    try {
      const existing = await getFile(env, path).catch(() => null);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const res = await putBinaryFile(env, {
        path,
        bytes,
        sha: existing?.sha,
        message: `${existing ? 'update' : 'add'} image: ${name} [remote]`,
        author: AUTHOR,
      });
      uploaded.push({
        name,
        lang,
        size: bytes.length,
        url: `https://raw.githubusercontent.com/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/${path}`,
        sha: res.sha,
        converted: false,  // الـ Worker لا يحوّل (لا sharp)
      });
    } catch (e) {
      uploaded.push({ name, error: e.message });
    }
  }

  return json({ ok: true, uploaded });
}

// DELETE /api/images/:lang/:name
export async function removeImage(env, lang, name) {
  if (!/^(ar|en)$/.test(lang)) return json({ error: 'lang غير صحيح' }, 400);
  if (!EXT_OK.test(name) || /\//.test(name)) return json({ error: 'اسم صورة غير صحيح' }, 400);

  const path = `assets/images/${lang}/${name}`;
  const f = await getFile(env, path);
  if (!f) return json({ error: 'الصورة غير موجودة' }, 404);

  await deleteFile(env, {
    path,
    sha: f.sha,
    message: `delete image: ${name} [remote]`,
    author: AUTHOR,
  });
  return json({ ok: true, name, lang });
}
