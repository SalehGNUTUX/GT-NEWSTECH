// نسخة طبق الأصل من admin/server.js
// تُرجع { categories: [{...c, count_ar, count_en}] } — هذا ما تنتظره admin.js
import { getFile, getTree, commitFiles } from '../lib/github.js';
import { parseYaml, serializeCategories } from '../lib/yaml.js';
import { getAllArticles } from './articles.js';
import { json } from '../index.js';

const AUTHOR = { name: 'GT-NEWSTECH Admin (remote)', email: 'admin@gt-newstech.local' };

export async function getCategories(env) {
  const [catsFile, tree, all] = await Promise.all([
    getFile(env, '_data/categories.yml'),
    getTree(env),
    getAllArticles(env),
  ]);
  const cats = catsFile ? (parseYaml(catsFile.content) || []) : [];

  // اكتشف الأقسام الموجودة على القرص (من شجرة git)
  const catIdsOnDisk = new Set();
  for (const entry of tree.tree) {
    const m = entry.path.match(/^_(?:ar|en)\/([^/]+)\//);
    if (m) catIdsOnDisk.add(m[1]);
  }

  // أضف أقساماً موجودة لكن غير مسجلة في YAML
  for (const id of catIdsOnDisk) {
    if (!cats.find(c => c.id === id)) {
      cats.push({ id, name_ar: id, name_en: id, icon: 'fa-solid fa-folder', color: '#888888' });
    }
  }

  // إحصاءات لكل قسم (من index)
  const result = cats.map(c => ({
    ...c,
    count_ar: all.filter(a => a._lang === 'ar' && a._cat === c.id).length,
    count_en: all.filter(a => a._lang === 'en' && a._cat === c.id).length,
  }));

  return json({ categories: result });
}

// POST /api/categories — إنشاء قسم جديد
// body: { id, name_ar, name_en, icon?, color? }
// commit ذرّي يُضيف 3 ملفات في عملية واحدة:
//   1. _data/categories.yml (مُحدَّث)
//   2. ar/category/<id>.html
//   3. en/category/<id>.html
export async function createCategory(env, req) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'invalid JSON' }, 400);
  const { id, name_ar, name_en, icon, color } = body;

  if (!id || !name_ar || !name_en) {
    return json({ error: 'id, name_ar, name_en مطلوبة' }, 400);
  }
  if (!/^[a-z0-9-]+$/.test(id)) {
    return json({ error: 'id: أحرف لاتينية صغيرة وأرقام وشرطات فقط' }, 400);
  }

  // اقرأ القائمة الحالية
  const catsFile = await getFile(env, '_data/categories.yml');
  const cats = catsFile ? (parseYaml(catsFile.content) || []) : [];
  if (cats.find(c => c.id === id)) {
    return json({ error: `القسم "${id}" موجود مسبقاً` }, 409);
  }

  const newCat = {
    id,
    name_ar,
    name_en,
    icon: icon || 'fa-solid fa-folder',
    color: color || '#888888',
  };
  cats.push(newCat);
  const newYaml = serializeCategories(cats);

  // ملفات صفحات القسم (نفس قالب admin/server.js)
  const arPage = `---\nlayout: category\nlang: ar\ncategory: ${id}\npermalink: /ar/category/${id}/\n---\n`;
  const enPage = `---\nlayout: category\nlang: en\ncategory: ${id}\npermalink: /en/category/${id}/\n---\n`;

  // commit ذرّي بالـ3 ملفات
  try {
    const result = await commitFiles(env, [
      { path: '_data/categories.yml', content: newYaml },
      { path: `ar/category/${id}.html`, content: arPage },
      { path: `en/category/${id}.html`, content: enPage },
    ], `feat: قسم جديد ${id} (${name_ar}) [remote]`, AUTHOR);
    return json({ ok: true, category: newCat, commit: result.commit.sha.slice(0, 7) });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
