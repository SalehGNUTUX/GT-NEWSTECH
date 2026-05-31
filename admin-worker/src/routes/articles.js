// نسخة مُحسَّنة: تستعمل _data/articles-index.json (طلب واحد فقط) بدل 68 blob
// يُنتَج هذا الـ index تلقائياً عبر .github/workflows/build-articles-index.yml
import { getFile } from '../lib/github.js';
import { parseFrontMatter } from '../lib/yaml.js';
import { json } from '../index.js';

// cache صغير لـ index في ذاكرة الـ Worker (60s) — يُحدَّث عند تغيّر الـ tree_sha
let _indexCache = { ts: 0, val: null };

async function getIndex(env) {
  const now = Date.now();
  if (now - _indexCache.ts < 60_000 && _indexCache.val) return _indexCache.val;
  const f = await getFile(env, '_data/articles-index.json');
  if (!f) throw new Error('articles-index.json not found — شغّل scripts/build-articles-index.js محلياً أو انتظر اكتمال workflow');
  const parsed = JSON.parse(f.content);
  _indexCache = { ts: now, val: parsed };
  return parsed;
}

// تُصدَّر للاستعمال من stats
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
// هنا فقط نجلب محتوى الـ markdown (للتحرير) — طلب واحد بصورة كسولة
export async function getArticle(env, params) {
  const { lang, cat, file } = params;
  if (!lang || !cat || !file) return json({ error: 'Missing params' }, 400);
  if (!/^(ar|en)$/.test(lang)) return json({ error: 'invalid lang' }, 400);
  if (!/^[\w-]+$/.test(cat)) return json({ error: 'invalid cat' }, 400);
  if (!/^[\w.-]+\.md$/.test(file)) return json({ error: 'invalid file' }, 400);

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
