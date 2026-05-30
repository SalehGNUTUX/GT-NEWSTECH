// نسخة طبق الأصل من admin/server.js — تُرجع مصفوفة مسطّحة
import { listDir } from '../lib/github.js';
import { json } from '../index.js';

async function getImages(env, lang) {
  const items = await listDir(env, `assets/images/${lang}`);
  return items
    .filter(x => x.type === 'file' && /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(x.name))
    .map(x => ({
      name: x.name,
      size: x.size,
      lang,
      // الرابط يستعمل raw.githubusercontent — مجاني، يخدمه CDN
      url: `https://raw.githubusercontent.com/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/${x.path}`,
    }));
}

// GET /api/images?lang=ar  |  GET /api/images (الكل)
export async function listImages(env, params) {
  if (params.lang) return json(await getImages(env, params.lang));
  const [ar, en] = await Promise.all([getImages(env, 'ar'), getImages(env, 'en')]);
  return json([...ar, ...en]);
}
