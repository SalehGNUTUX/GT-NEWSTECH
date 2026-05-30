// نسخة طبق الأصل من admin/server.js — تُرجع نفس الشكل (مصفوفة مسطّحة، لا غلاف)
import { getTree, getBlob, getFile } from '../lib/github.js';
import { parseFrontMatter } from '../lib/yaml.js';
import { json } from '../index.js';

// ─── cache صغير في الذاكرة لشجرة المستودع (60 ثانية) ─────
let _treeCache = { ts: 0, val: null };
async function getCachedTree(env) {
  const now = Date.now();
  if (now - _treeCache.ts < 60_000 && _treeCache.val) return _treeCache.val;
  const t = await getTree(env);
  _treeCache = { ts: now, val: t };
  return t;
}

// قراءة كل المقالات (مع cache) — تُرجع مصفوفة بشكل { ...frontmatter, content, _file, _lang, _cat, _sha }
async function getAllArticles(env) {
  const t = await getCachedTree(env);
  const files = t.tree.filter(x =>
    x.type === 'blob' &&
    /^_(ar|en)\/[^/]+\/[^/]+\.md$/.test(x.path)
  );

  const list = [];
  const chunkSize = 8;
  for (let i = 0; i < files.length; i += chunkSize) {
    const slice = files.slice(i, i + chunkSize);
    const results = await Promise.all(slice.map(async f => {
      try {
        const blob = await getBlob(env, f.sha);
        const { data, body } = parseFrontMatter(blob.content);
        const parts = f.path.split('/');
        return {
          ...data,
          content: (body || '').trim(),
          _file: parts[parts.length - 1],
          _lang: parts[0].slice(1),  // _ar → ar
          _cat: parts[1],
          _sha: f.sha,
        };
      } catch {
        return null;
      }
    }));
    for (const r of results) if (r) list.push(r);
  }

  // ترتيب بالتاريخ تنازلياً
  return list.sort((a, b) => {
    const da = new Date(a.date || 0).getTime();
    const db = new Date(b.date || 0).getTime();
    return db - da;
  });
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
  return json(list);  // مصفوفة مباشرة، كما في server.js
}

// GET /api/article?lang=&cat=&file=
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

// نُصدِّر getAllArticles لاستعمالها في stats
export { getAllArticles };
