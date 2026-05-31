// نسخة طبق الأصل من admin/server.js
// تُرجع { categories: [{...c, count_ar, count_en}] } — هذا ما تنتظره admin.js
import { getFile, getTree } from '../lib/github.js';
import { parseYaml } from '../lib/yaml.js';
import { getAllArticles } from './articles.js';
import { json } from '../index.js';

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
