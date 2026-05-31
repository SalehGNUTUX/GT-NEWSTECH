// سلة المهملات للوحة البعيدة.
// المهملات تُحفظ في _trash/ بالمستودع + فهرس في _data/trash-index.json
// _trash/ مُستبعد من Jekyll عبر _config.yml.

import { getFile, commitFiles, deleteFile } from '../lib/github.js';
import { parseFrontMatter } from '../lib/yaml.js';
import { json } from '../index.js';

const AUTHOR = { name: 'GT-NEWSTECH Admin (remote)', email: 'admin@gt-newstech.local' };
const INDEX_PATH = '_data/trash-index.json';

// ── قراءة/كتابة الفهرس ─────────────────────────────────────
async function readIndex(env) {
  const f = await getFile(env, INDEX_PATH);
  if (!f) return { entries: [], sha: null };
  try {
    const parsed = JSON.parse(f.content);
    return { entries: parsed.entries || [], sha: f.sha };
  } catch {
    return { entries: [], sha: f.sha };
  }
}

// id قصير من الطابع الزمني + 4 حروف عشوائية
function makeId() {
  const ts = Math.floor(Date.now() / 1000).toString(36); // 7-8 حروف
  const rnd = Math.floor(Math.random() * 0xffff).toString(36).padStart(4, '0');
  return `${ts}-${rnd}`;
}

// ── العمليات ───────────────────────────────────────────────

// نقل مقال إلى السلة. يُستدعى من articles.js
// يُرجع { ok, id, trashPath } عند النجاح
export async function moveToTrash(env, { originalPath, content, sha, frontmatter }) {
  const id = makeId();
  const trashPath = `_trash/${id}.md`;
  const idx = await readIndex(env);

  const entry = {
    id,
    originalPath,
    trashPath,
    deletedAt: new Date().toISOString(),
    title: frontmatter?.title || '',
    slug: frontmatter?.slug || '',
    lang: frontmatter?.lang || originalPath.match(/^_(ar|en)\//)?.[1] || '',
    cat: originalPath.match(/^_(?:ar|en)\/([^/]+)\//)?.[1] || '',
    file: originalPath.split('/').pop(),
  };
  idx.entries.unshift(entry);

  // commit ذرّي: إنشاء نسخة في _trash/ + تحديث الفهرس + حذف الأصل
  // Git Trees API يدعم الحذف عبر `sha: null`، لكن commitFiles الحالي
  // لا يدعم الحذف. نُجزّئها لخطوتين:
  //   1) commit: ينشئ _trash/<id>.md + يحدّث الفهرس
  //   2) deleteFile للأصل
  await commitFiles(env, [
    { path: trashPath, content },
    { path: INDEX_PATH, content: JSON.stringify({ entries: idx.entries }, null, 2) + '\n' },
  ], `trash: ${entry.title || entry.file} [remote]`, AUTHOR);

  await deleteFile(env, {
    path: originalPath,
    sha,
    message: `delete (moved to trash ${id}): ${entry.title || entry.file} [remote]`,
    author: AUTHOR,
  });

  return { id, trashPath };
}

// GET /api/trash
export async function listTrash(env) {
  const idx = await readIndex(env);
  return json(idx.entries);
}

// POST /api/trash/:id/restore
export async function restoreFromTrash(env, id) {
  const idx = await readIndex(env);
  const entry = idx.entries.find(e => e.id === id);
  if (!entry) return json({ error: 'العنصر غير موجود في السلة' }, 404);

  // اقرأ محتوى السلة
  const trashFile = await getFile(env, entry.trashPath);
  if (!trashFile) return json({ error: 'الملف غير موجود في _trash/' }, 404);

  // تحقّق ألا يوجد ملف بنفس المسار الأصلي
  const existing = await getFile(env, entry.originalPath).catch(() => null);
  if (existing) {
    return json({
      error: `لا يمكن الاسترجاع: ملف بنفس الاسم يحتل المسار الأصلي ${entry.originalPath}`,
    }, 409);
  }

  // commit: ينشئ الملف في مكانه الأصلي + يحدّث الفهرس (يحذف العنصر)
  const newEntries = idx.entries.filter(e => e.id !== id);
  await commitFiles(env, [
    { path: entry.originalPath, content: trashFile.content },
    { path: INDEX_PATH, content: JSON.stringify({ entries: newEntries }, null, 2) + '\n' },
  ], `restore from trash: ${entry.title || entry.file} [remote]`, AUTHOR);

  // احذف ملف السلة
  const refreshedTrash = await getFile(env, entry.trashPath);
  if (refreshedTrash) {
    await deleteFile(env, {
      path: entry.trashPath,
      sha: refreshedTrash.sha,
      message: `cleanup trash ${id} (restored) [remote]`,
      author: AUTHOR,
    });
  }

  return json({ ok: true, restored: entry.originalPath });
}

// DELETE /api/trash/:id — حذف نهائي لعنصر واحد
export async function purgeTrashItem(env, id) {
  const idx = await readIndex(env);
  const entry = idx.entries.find(e => e.id === id);
  if (!entry) return json({ error: 'العنصر غير موجود في السلة' }, 404);

  // احذف الملف من _trash/ (مع retry للـ eventual consistency)
  for (let attempt = 1; attempt <= 3; attempt++) {
    const f = await getFile(env, entry.trashPath);
    if (!f) break; // محذوف بالفعل
    try {
      await deleteFile(env, {
        path: entry.trashPath,
        sha: f.sha,
        message: `purge trash ${id}: ${entry.title || entry.file} [remote]`,
        author: AUTHOR,
      });
      break;
    } catch (e) {
      if (e.status === 409 && attempt < 3) {
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }
      throw e;
    }
  }

  // حدّث الفهرس (احذف العنصر)
  const newEntries = idx.entries.filter(e => e.id !== id);
  const indexFile = await getFile(env, INDEX_PATH);
  await commitFiles(env, [
    { path: INDEX_PATH, content: JSON.stringify({ entries: newEntries }, null, 2) + '\n' },
  ], `update trash-index after purge ${id} [remote]`, AUTHOR);

  return json({ ok: true });
}

// DELETE /api/trash — تفريغ السلة كاملة
export async function emptyTrash(env) {
  const idx = await readIndex(env);
  if (idx.entries.length === 0) return json({ ok: true, removed: 0 });

  let removed = 0;
  for (const entry of idx.entries) {
    try {
      const f = await getFile(env, entry.trashPath);
      if (f) {
        await deleteFile(env, {
          path: entry.trashPath,
          sha: f.sha,
          message: `empty trash: ${entry.id} [remote]`,
          author: AUTHOR,
        });
        removed++;
      }
    } catch (_) { /* تجاهل وتابع */ }
  }

  // فرّغ الفهرس
  await commitFiles(env, [
    { path: INDEX_PATH, content: JSON.stringify({ entries: [] }, null, 2) + '\n' },
  ], `empty trash (${removed} items) [remote]`, AUTHOR);

  return json({ ok: true, removed });
}
