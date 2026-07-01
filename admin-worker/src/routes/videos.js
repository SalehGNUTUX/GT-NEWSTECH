// إدارة الفيديوهات — مطابقة عقد admin/server.js
// (لا ضغط، حجم ~ حتى 100MB، الرفع عبر Contents API)
import { listDir, putBinaryFile, getFile, deleteFile } from '../lib/github.js';
import { json } from '../index.js';

const MAX_SIZE = 100 * 1024 * 1024; // 100MB
const EXT_OK = /\.(mp4|webm|ogv|mov|m4v)$/i;
const AUTHOR = { name: 'GT-NEWSTECH Admin (remote)', email: 'admin@gt-newstech.local' };

async function getVideos(env, lang) {
  const items = await listDir(env, `assets/videos/${lang}`);
  return items
    .filter(x => x.type === 'file' && EXT_OK.test(x.name))
    .map(x => ({
      name: x.name,
      size: x.size,
      lang,
      url: `https://raw.githubusercontent.com/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/${x.path}`,
    }));
}

// GET /api/videos?lang=
export async function listVideos(env, params) {
  if (params.lang) return json(await getVideos(env, params.lang));
  const [ar, en] = await Promise.all([getVideos(env, 'ar'), getVideos(env, 'en')]);
  return json([...ar, ...en]);
}

// POST /api/videos/:lang  (multipart، حقل files، يدعم multi)
export async function uploadVideo(env, req, lang) {
  if (!/^(ar|en)$/.test(lang)) return json({ error: 'lang غير صحيح' }, 400);

  const ct = req.headers.get('content-type') || '';
  if (!ct.startsWith('multipart/form-data')) {
    return json({ error: 'يجب multipart/form-data' }, 400);
  }

  let form;
  try { form = await req.formData(); }
  catch (e) { return json({ error: 'فشل قراءة multipart: ' + e.message }, 400); }

  let files = form.getAll('files').filter(f => f && typeof f !== 'string');
  if (files.length === 0) {
    const single = form.get('video');
    if (single && typeof single !== 'string') files = [single];
  }
  if (files.length === 0) return json({ error: 'لم يُرسَل أي ملف' }, 400);

  const uploaded = [];
  for (const file of files) {
    if (file.size > MAX_SIZE) {
      uploaded.push({ name: file.name, error: `حجم > ${MAX_SIZE/1048576}MB` });
      continue;
    }
    let name = (file.name || 'video').toString().trim();
    name = name.replace(/[^\p{L}\p{N}._-]+/gu, '_').replace(/_{2,}/g, '_');
    if (!EXT_OK.test(name)) {
      uploaded.push({ name: file.name, error: 'صيغة غير مدعومة (mp4/webm/ogv/mov/m4v)' });
      continue;
    }
    const path = `assets/videos/${lang}/${name}`;
    try {
      const existing = await getFile(env, path).catch(() => null);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const res = await putBinaryFile(env, {
        path,
        bytes,
        sha: existing?.sha,
        message: `${existing ? 'update' : 'add'} video: ${name} [remote]`,
        author: AUTHOR,
      });
      uploaded.push({
        name, lang,
        size: bytes.length,
        url: `https://raw.githubusercontent.com/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/${path}`,
        sha: res.sha,
      });
    } catch (e) {
      uploaded.push({ name, error: e.message });
    }
  }

  return json({ ok: true, uploaded });
}

// DELETE /api/videos/:lang/:name
export async function removeVideo(env, lang, name) {
  if (!/^(ar|en)$/.test(lang)) return json({ error: 'lang غير صحيح' }, 400);
  if (!EXT_OK.test(name) || /\//.test(name)) return json({ error: 'اسم غير صحيح' }, 400);

  const path = `assets/videos/${lang}/${name}`;
  const f = await getFile(env, path);
  if (!f) return json({ error: 'غير موجود' }, 404);

  await deleteFile(env, {
    path,
    sha: f.sha,
    message: `delete video: ${name} [remote]`,
    author: AUTHOR,
  });
  return json({ ok: true, name, lang });
}
