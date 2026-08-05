// نسخة طبق الأصل من admin/server.js
// تُرجع { categories: [{...c, count_ar, count_en}] } — هذا ما تنتظره admin.js
import { getFile, getTree, commitFiles } from '../lib/github.js';
import { parseYaml, serializeCategories, updateCmsConfigText, patchCmsConfigText } from '../lib/yaml.js';
import { getAllArticles } from './articles.js';
import { json } from '../index.js';
import { makeUndoToken, verifyUndoToken, UNDO_WINDOW_MS } from '../lib/auth.js';

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

  return commitNewCategory(env, { id, name_ar, name_en, icon, color });
}

// POST /api/categories/undo — استرجاع قسم محذوف خلال المهلة.
// لا يحتاج تأكيد كلمة المرور: الرمز الموقَّع نفسه هو الإثبات (أصدره
// الخادم لمن نفّذ الحذف بعد تأكيد كلمة المرور، وصلاحيته 30 ثانية).
export async function undoDeleteCategory(env, req) {
  const body = await req.json().catch(() => null);
  const cat = await verifyUndoToken(env, body?.undoToken);
  if (!cat) return json({ error: 'انتهت مهلة التراجع أو الرمز غير صالح' }, 410);
  return commitNewCategory(env, cat, true);
}

// يُنشئ القسم فعلياً في commit ذرّي — مشترك بين الإنشاء والتراجع
async function commitNewCategory(env, { id, name_ar, name_en, icon, color }, isUndo = false) {
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

  // Decap CMS auto-sync: حدّث cms/config.yml (مثلما تفعل اللوحة المحلية)
  const files = [
    { path: '_data/categories.yml', content: newYaml },
    { path: `ar/category/${id}.html`, content: arPage },
    { path: `en/category/${id}.html`, content: enPage },
  ];
  let cmsSync = { skipped: 'cms/config.yml غير موجود' };
  try {
    const cmsFile = await getFile(env, 'cms/config.yml');
    if (cmsFile) {
      const newCmsText = updateCmsConfigText(cmsFile.content, id, name_ar, name_en);
      if (newCmsText) {
        files.push({ path: 'cms/config.yml', content: newCmsText });
        cmsSync = { ok: true };
      } else {
        cmsSync = { skipped: 'القسم موجود مسبقاً في cms/config.yml' };
      }
    }
  } catch (e) { cmsSync = { error: e.message }; }

  // commit ذرّي بكل الملفات (3 أو 4)
  try {
    const result = await commitFiles(env, files,
      isUndo ? `revert: استرجاع قسم ${id} (${name_ar}) [remote]`
             : `feat: قسم جديد ${id} (${name_ar}) [remote]`, AUTHOR);
    return json({ ok: true, category: newCat, commit: result.commit.sha.slice(0, 7), cmsSync });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// PUT /api/categories/:id — تعديل قسم موجود
// body: { name_ar, name_en, icon?, color? }
// الـid غير قابل للتعديل عمداً — انظر التعليق في admin/server.js:
// هو اسم مجلد المقالات والرابط الدائم وقيمة category داخل كل مقال.
// commit ذرّي: _data/categories.yml + cms/config.yml
export async function updateCategory(env, req, id) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'invalid JSON' }, 400);
  const { name_ar, name_en, icon, color } = body;

  if (!name_ar || !name_en) {
    return json({ error: 'name_ar, name_en مطلوبة' }, 400);
  }

  const catsFile = await getFile(env, '_data/categories.yml');
  const cats = catsFile ? (parseYaml(catsFile.content) || []) : [];
  const idx = cats.findIndex(c => c.id === id);
  if (idx < 0) return json({ error: `القسم "${id}" غير موجود` }, 404);

  const updated = {
    ...cats[idx],
    name_ar,
    name_en,
    icon:  icon  || cats[idx].icon  || 'fa-solid fa-folder',
    color: color || cats[idx].color || '#888888',
  };
  cats[idx] = updated;

  const files = [{ path: '_data/categories.yml', content: serializeCategories(cats) }];

  let cmsSync = { skipped: 'cms/config.yml غير موجود' };
  try {
    const cmsFile = await getFile(env, 'cms/config.yml');
    if (cmsFile) {
      const { text, hits } = patchCmsConfigText(cmsFile.content, id, { name_ar, name_en });
      if (hits) {
        files.push({ path: 'cms/config.yml', content: text });
        cmsSync = { ok: true, updated: hits };
      } else {
        cmsSync = { skipped: `القسم "${id}" غير موجود في cms/config.yml` };
      }
    }
  } catch (e) { cmsSync = { error: e.message }; }

  try {
    const result = await commitFiles(env, files,
      `chore: تعديل قسم ${id} (${name_ar}) [remote]`, AUTHOR);
    return json({ ok: true, category: updated, commit: result.commit.sha.slice(0, 7), cmsSync });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// DELETE /api/categories/:id — حذف قسم
// يُرفض ما دام القسم مستعملاً (رئيسي أو ضمن also_in) حتى لا تبقى
// مقالات تشير إلى قسم غير موجود. نفس شرط admin/server.js.
// commit ذرّي: categories.yml + cms/config.yml + حذف صفحتَي القسم.
export async function deleteCategory(env, id) {
  const [catsFile, all] = await Promise.all([
    getFile(env, '_data/categories.yml'),
    getAllArticles(env),
  ]);
  const cats = catsFile ? (parseYaml(catsFile.content) || []) : [];
  const idx = cats.findIndex(c => c.id === id);
  if (idx < 0) return json({ error: `القسم "${id}" غير موجود` }, 404);

  const primary   = all.filter(a => a._cat === id).length;
  const secondary = all.filter(a => Array.isArray(a.also_in) && a.also_in.includes(id)).length;
  if (primary || secondary) {
    return json({
      error: `القسم "${id}" ما زال مستعملاً: ${primary} مقال رئيسي و${secondary} ضمن also_in. انقلها إلى قسم آخر أولاً.`,
      inUse: { primary, also_in: secondary },
    }, 409);
  }

  const removed = cats[idx];
  cats.splice(idx, 1);
  const files = [{ path: '_data/categories.yml', content: serializeCategories(cats) }];

  // صفحتا القسم — تُحذفان فقط إن كانتا موجودتَين فعلاً
  const tree = await getTree(env);
  const paths = new Set(tree.tree.map(t => t.path));
  for (const lang of ['ar', 'en']) {
    const page = `${lang}/category/${id}.html`;
    if (paths.has(page)) files.push({ path: page, delete: true });
  }

  let cmsSync = { skipped: 'cms/config.yml غير موجود' };
  try {
    const cmsFile = await getFile(env, 'cms/config.yml');
    if (cmsFile) {
      const { text, hits } = patchCmsConfigText(cmsFile.content, id, null);
      if (hits) {
        files.push({ path: 'cms/config.yml', content: text });
        cmsSync = { ok: true, updated: hits };
      } else {
        cmsSync = { skipped: `القسم "${id}" غير موجود في cms/config.yml` };
      }
    }
  } catch (e) { cmsSync = { error: e.message }; }

  try {
    const result = await commitFiles(env, files,
      `chore: حذف قسم ${id} [remote]`, AUTHOR);
    // رمز التراجع يحمل بيانات القسم موقَّعة — صالح 30 ثانية
    const { token, expiresAt } = await makeUndoToken(env, removed);
    return json({
      ok: true, id, commit: result.commit.sha.slice(0, 7), cmsSync,
      undoToken: token, undoExpiresAt: expiresAt, undoWindowMs: UNDO_WINDOW_MS,
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
