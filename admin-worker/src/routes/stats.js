// نسخة طبق الأصل من admin/server.js
import { getAllArticles } from './articles.js';
import { json } from '../index.js';

export async function getStats(env) {
  const all = await getAllArticles(env);
  const byLang = { ar: 0, en: 0 };
  const byCat = {};
  for (const a of all) {
    byLang[a._lang] = (byLang[a._lang] || 0) + 1;
    byCat[a._cat] = (byCat[a._cat] || 0) + 1;
  }
  return json({
    total: all.length,
    byLang,
    byCat,
    recent: all.slice(0, 6),
  });
}
