// قراءة + رفع الصور — نسخة مطابقة لـ admin/server.js (مع تحفظات الـ Worker)
import { listDir, putBinaryFile, getFile, deleteFile } from '../lib/github.js';
import { json } from '../index.js';

const MAX_SIZE = 20 * 1024 * 1024; // 20MB (متطابق مع admin/server.js)
const EXT_OK = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i;
const AUTHOR = { name: 'GT-NEWSTECH Admin (remote)', email: 'admin@gt-newstech.local' };

async function getImages(env, lang) {
  const items = await listDir(env, `assets/images/${lang}`);
  return items
    .filter(x => x.type === 'file' && EXT_OK.test(x.name))
    .map(x => ({
      name: x.name,
      size: x.size,
      lang,
      url: `https://raw.githubusercontent.com/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/${x.path}`,
    }));
}

// GET /api/images?lang=
export async function listImages(env, params) {
  if (params.lang) return json(await getImages(env, params.lang));
  const [ar, en] = await Promise.all([getImages(env, 'ar'), getImages(env, 'en')]);
  return json([...ar, ...en]);
}

// POST /api/images/:lang  (multipart/form-data بحقل "image")
export async function uploadImage(env, req, lang) {
  if (!/^(ar|en)$/.test(lang)) return json({ error: 'lang غير صحيح' }, 400);

  const ct = req.headers.get('content-type') || '';
  if (!ct.startsWith('multipart/form-data')) {
    return json({ error: 'يجب multipart/form-data بحقل image' }, 400);
  }

  let form;
  try { form = await req.formData(); }
  catch (e) { return json({ error: 'فشل قراءة multipart: ' + e.message }, 400); }

  const file = form.get('image');
  if (!file || typeof file === 'string') return json({ error: 'حقل image مفقود' }, 400);
  if (file.size > MAX_SIZE) return json({ error: `الحد الأقصى ${MAX_SIZE/1024/1024}MB` }, 413);

  // اسم نظيف — نحتفظ بالامتداد فقط
  let name = (form.get('name') || file.name || 'image').toString().trim();
  name = name.replace(/[^\w.\-]/g, '_');
  if (!EXT_OK.test(name)) return json({ error: 'صيغة غير مدعومة (jpg/png/webp/avif/gif/svg فقط)' }, 400);

  const path = `assets/images/${lang}/${name}`;

  // هل موجود؟ نحتاج sha للتحديث
  const existing = await getFile(env, path).catch(() => null);
  const bytes = new Uint8Array(await file.arrayBuffer());

  const res = await putBinaryFile(env, {
    path,
    bytes,
    sha: existing?.sha,
    message: `${existing ? 'update' : 'add'} image: ${name} [remote]`,
    author: AUTHOR,
  });

  return json({
    ok: true,
    name,
    lang,
    size: bytes.length,
    url: `https://raw.githubusercontent.com/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/${path}`,
    sha: res.sha,
  });
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
