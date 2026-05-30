// نسخة طبق الأصل من admin/server.js — تُرجع مصفوفة مباشرة + يكمل الأقسام الناقصة من القرص
import { getFile, getTree } from '../lib/github.js';
import { parseYaml } from '../lib/yaml.js';
import { json } from '../index.js';

export async function getCategories(env) {
  const [catsFile, tree] = await Promise.all([
    getFile(env, '_data/categories.yml'),
    getTree(env),
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

  return json(cats);
}
