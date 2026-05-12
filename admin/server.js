'use strict';

const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const matter   = require('gray-matter');
const multer   = require('multer');
const sharp    = require('sharp');
const yaml     = require('js-yaml');
const crypto   = require('crypto');

const app  = express();
const PORT = 4001;

// ── Paths ──────────────────────────────────────────────────────
const ROOT          = path.join(__dirname, '..');
const PASSWORD_FILE = path.join(__dirname, '.admin-password');  // gitignored
const TRASH_DIR     = path.join(__dirname, '.trash');           // gitignored
const LANGS      = ['ar', 'en'];
const CATS_FILE  = path.join(ROOT, '_data', 'categories.yml');
const IMG_EXTS   = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i;

// ── Categories helpers ─────────────────────────────────────────
function readCatsData() {
  if (!fs.existsSync(CATS_FILE)) return [];
  try { return yaml.load(fs.readFileSync(CATS_FILE, 'utf8')) || []; }
  catch (_) { return []; }
}

function writeCatsData(cats) {
  fs.mkdirSync(path.dirname(CATS_FILE), { recursive: true });
  fs.writeFileSync(CATS_FILE, yaml.dump(cats, { allowUnicode: true, lineWidth: -1 }));
}

function getCatIds() {
  const fromData = readCatsData().map(c => c.id);
  // scan _ar/ for any folder not yet in data
  const arDir = path.join(ROOT, '_ar');
  if (fs.existsSync(arDir)) {
    fs.readdirSync(arDir).forEach(d => {
      if (fs.statSync(path.join(arDir, d)).isDirectory() && !fromData.includes(d))
        fromData.push(d);
    });
  }
  return fromData;
}

// ── Password helpers ───────────────────────────────────────────
function getPassHash()  { return fs.existsSync(PASSWORD_FILE) ? fs.readFileSync(PASSWORD_FILE,'utf8').trim() : null; }
function hashPwd(p)     { return crypto.createHash('sha256').update(p).digest('hex'); }
function makeToken(h)   { return crypto.createHmac('sha256', h).update('gnt-admin-v1').digest('hex'); }

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── Auth middleware — بعد JSON parser ──────────────────────────
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) return next();
  const skip = ['/api/auth/login', '/api/auth/status'];
  if (skip.some(s => req.path === s)) return next();
  const hash = getPassHash();
  if (!hash) return next();                               // no password → open
  const tok = req.headers['x-admin-token'] || req.query._t;
  if (tok === makeToken(hash)) return next();
  res.status(401).json({ error: 'Unauthorized' });
});
app.use(express.static(path.join(__dirname, 'public')));

// Serve Jekyll project images/icons for preview
app.use('/site-images', express.static(path.join(ROOT, 'assets', 'images')));
app.use('/site-icons',  express.static(path.join(ROOT, 'assets', 'icons')));

// ── Image format sets ──────────────────────────────────────────
// صيغ مدعومة مباشرة في المتصفحات الحديثة — تُحفظ كما هي
const WEB_FORMATS = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i;
// صيغ تحتاج تحويل إلى JPEG (غير مدعومة في المتصفحات)
const CONV_FORMATS = /\.(heic|heif|tiff?|bmp|ico|jfif|pjpeg|pjp)$/i;
// كل الصيغ المقبولة
const ALL_FORMATS  = /\.(jpg|jpeg|png|webp|avif|gif|svg|heic|heif|tiff?|bmp|ico|jfif)$/i;

// ── Multer — memory storage ─────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALL_FORMATS.test(file.originalname)) return cb(null, true);
    cb(new Error('صيغة غير مدعومة: ' + path.extname(file.originalname)));
  }
});

function handleUpload(req, res, next) {
  upload.array('files', 20)(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}

// ── Image helpers ──────────────────────────────────────────────

/** تعقيم اسم الملف مع الاحتفاظ بامتداده الأصلي */
function sanitizeFilename(original) {
  const ext  = path.extname(original).toLowerCase();
  const base = path.basename(original, ext)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'image';
  return { base, ext };
}

/**
 * يحفظ الصورة:
 * - صيغة ويب → تحفظ مباشرة بامتدادها
 * - صيغة غير مدعومة → تُحوَّل إلى JPEG
 * القيمة المُعادة: { filename, converted }
 */
async function saveImage(buffer, originalName, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const { base, ext } = sanitizeFilename(originalName);

  if (WEB_FORMATS.test(originalName)) {
    // صيغة ويب — حفظ مباشر
    const filename = base + ext;
    fs.writeFileSync(path.join(destDir, filename), buffer);
    return { filename, converted: false };
  }

  // صيغة غير مدعومة — تحويل إلى JPEG
  const filename = base + '.jpg';
  await sharp(buffer).jpeg({ quality: 88 }).toFile(path.join(destDir, filename));
  return { filename, converted: true };
}

/**
 * يحفظ صورة من مسار محلي
 */
async function saveImageFromPath(sourcePath, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const { base, ext } = sanitizeFilename(path.basename(sourcePath));

  if (WEB_FORMATS.test(sourcePath)) {
    const filename = base + ext;
    fs.copyFileSync(sourcePath, path.join(destDir, filename));
    return { filename, converted: false };
  }

  const filename = base + '.jpg';
  await sharp(sourcePath).jpeg({ quality: 88 }).toFile(path.join(destDir, filename));
  return { filename, converted: true };
}

// ── Helpers ────────────────────────────────────────────────────
function readArticle(lang, cat, file) {
  const fp      = path.join(ROOT, `_${lang}`, cat, file);
  const raw     = fs.readFileSync(fp, 'utf8');
  const parsed  = matter(raw);
  return { ...parsed.data, content: parsed.content.trim(), _file: file, _lang: lang, _cat: cat };
}

function getAllArticles() {
  const list = [];
  for (const lang of LANGS) {
    for (const cat of getCatIds()) {
      const dir = path.join(ROOT, `_${lang}`, cat);
      if (!fs.existsSync(dir)) continue;
      for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
        try {
          const a = readArticle(lang, cat, file);
          list.push(a);
        } catch (_) {}
      }
    }
  }
  return list.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function saveArticle(lang, cat, file, fm, content) {
  const dir = path.join(ROOT, `_${lang}`, cat);
  fs.mkdirSync(dir, { recursive: true });

  /* تحويل date إلى Date object قبل الحفظ
   * → js-yaml يكتبها كـ YAML timestamp غير مقتبس
   * → Jekyll يقرأها كـ Ruby DateTime قابل للمقارنة مع Date
   *
   * مهم: نُفسّر إدخال المستخدم كـ LOCAL time ثم نخزّنها UTC.
   * إذا فسّرناه UTC مباشرة، المستخدم في UTC+1 يدخل "14:00"
   * فيُحفظ "14:00 UTC" بينما الواقع "15:00 UTC" (ساعة في المستقبل)
   * → Jekyll يتخطّاه (مقال مستقبلي) → 404
   *
   * new Date(y,m,d,h,min,s) يستخدم timezone النظام المحلي،
   * ثم gray-matter يكتبه كـ ISO UTC تلقائياً = الزمن الفعلي
   * بصرف النظر عن منطقة المستخدم (الجزائر، الصين، أي مكان). */
  if (fm.date && typeof fm.date === 'string') {
    const m = fm.date.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) {
      fm.date = new Date(+m[1], +m[2]-1, +m[3], +(m[4]||0), +(m[5]||0), +(m[6]||0));
    }
  }

  const str = matter.stringify('\n' + content.trim() + '\n', fm);
  fs.writeFileSync(path.join(dir, file), str, 'utf8');
}

function getImages(lang) {
  const dir = path.join(ROOT, 'assets', 'images', lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => IMG_EXTS.test(f))
    .map(f => {
      const stat = fs.statSync(path.join(dir, f));
      return { name: f, lang, url: `/site-images/${lang}/${f}`, size: stat.size };
    });
}

function buildFilename(date, slug) {
  const d = (date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  return `${d}-${slug}.md`;
}

// ── API ────────────────────────────────────────────────────────

/* Stats */
app.get('/api/stats', (_req, res) => {
  const all    = getAllArticles();
  const byLang = { ar: 0, en: 0 };
  const byCat  = {};
  all.forEach(a => {
    byLang[a._lang] = (byLang[a._lang] || 0) + 1;
    byCat[a._cat]   = (byCat[a._cat]   || 0) + 1;
  });
  res.json({ total: all.length, byLang, byCat, recent: all.slice(0, 6) });
});

/* Categories — list */
app.get('/api/categories', (_req, res) => {
  const cats    = readCatsData();
  const catIds  = getCatIds();
  const all     = getAllArticles();

  // أضف أقساماً موجودة على الدسك لكن غير مسجلة في data
  catIds.forEach(id => {
    if (!cats.find(c => c.id === id))
      cats.push({ id, name_ar: id, name_en: id, icon: 'fa-solid fa-folder', color: '#888888' });
  });

  // إحصاءات لكل قسم
  const result = cats.map(c => ({
    ...c,
    count_ar: all.filter(a => a._lang === 'ar' && a._cat === c.id).length,
    count_en: all.filter(a => a._lang === 'en' && a._cat === c.id).length,
  }));

  res.json({ categories: result });
});

/* Categories — create */
app.post('/api/categories', (req, res) => {
  const { id, name_ar, name_en, icon, color } = req.body;

  if (!id || !name_ar || !name_en)
    return res.status(400).json({ error: 'id, name_ar, name_en مطلوبة' });
  if (!/^[a-z0-9-]+$/.test(id))
    return res.status(400).json({ error: 'id: أحرف لاتينية صغيرة وأرقام وشرطات فقط' });

  const cats = readCatsData();
  if (cats.find(c => c.id === id))
    return res.status(409).json({ error: `القسم "${id}" موجود مسبقاً` });

  // إنشاء مجلدات المقالات
  fs.mkdirSync(path.join(ROOT, '_ar', id), { recursive: true });
  fs.mkdirSync(path.join(ROOT, '_en', id), { recursive: true });

  // إنشاء صفحات القسم
  const arPage = `---\nlayout: category\nlang: ar\ncategory: ${id}\npermalink: /ar/category/${id}/\n---\n`;
  const enPage = `---\nlayout: category\nlang: en\ncategory: ${id}\npermalink: /en/category/${id}/\n---\n`;
  fs.mkdirSync(path.join(ROOT, 'ar', 'category'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'en', 'category'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'ar', 'category', `${id}.html`), arPage);
  fs.writeFileSync(path.join(ROOT, 'en', 'category', `${id}.html`), enPage);

  // الإضافة إلى _data/categories.yml
  const newCat = { id, name_ar, name_en, icon: icon || 'fa-solid fa-folder', color: color || '#888888' };
  cats.push(newCat);
  writeCatsData(cats);

  res.json({ ok: true, category: newCat });
});

/* List articles */
app.get('/api/articles', (req, res) => {
  let list = getAllArticles();
  if (req.query.lang) list = list.filter(a => a._lang === req.query.lang);
  if (req.query.cat)  list = list.filter(a => a._cat  === req.query.cat);
  if (req.query.q) {
    const q = req.query.q.toLowerCase();
    list = list.filter(a => (a.title || '').toLowerCase().includes(q));
  }
  res.json(list);
});

/* Single article */
app.get('/api/article', (req, res) => {
  const { lang, cat, file } = req.query;
  if (!lang || !cat || !file) return res.status(400).json({ error: 'Missing params' });
  try { res.json(readArticle(lang, cat, file)); }
  catch (e) { res.status(404).json({ error: 'Not found' }); }
});

/* Create article */
app.post('/api/article', (req, res) => {
  const { lang, cat, slug, date, content, ...fm } = req.body;
  if (!lang || !cat || !slug) return res.status(400).json({ error: 'lang, cat, slug required' });
  fm.date = date || new Date().toISOString().slice(0, 10);
  fm.lang = lang;
  fm.category = cat;
  fm.slug = slug;
  const file = buildFilename(fm.date, slug);
  const fp   = path.join(ROOT, `_${lang}`, cat, file);
  if (fs.existsSync(fp)) return res.status(409).json({ error: 'Article already exists', file });
  saveArticle(lang, cat, file, fm, content || '');
  res.json({ ok: true, file });
});

/* Update article */
app.put('/api/article', (req, res) => {
  const { lang, cat, file } = req.query;
  if (!lang || !cat || !file) return res.status(400).json({ error: 'Missing params' });
  const fp = path.join(ROOT, `_${lang}`, cat, file);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  const { content, ...fm } = req.body;
  saveArticle(lang, cat, file, fm, content || '');
  res.json({ ok: true });
});

/* Delete article → ينقل إلى المهملات */
app.delete('/api/article', (req, res) => {
  const { lang, cat, file } = req.query;
  if (!lang || !cat || !file) return res.status(400).json({ error: 'Missing params' });
  const fp = path.join(ROOT, `_${lang}`, cat, file);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });

  fs.mkdirSync(TRASH_DIR, { recursive: true });
  const id        = `${Date.now()}_${lang}_${cat}_${file}`;
  const trashPath = path.join(TRASH_DIR, `${id}.json`);
  const content   = fs.readFileSync(fp, 'utf8');
  const parsed    = matter(content);

  fs.writeFileSync(trashPath, JSON.stringify({
    id, lang, cat, file,
    title:      parsed.data.title || file,
    deleted_at: new Date().toISOString(),
    content
  }, null, 2));

  fs.unlinkSync(fp);
  res.json({ ok: true, trashId: id });
});

/* ── Trash API ────────────────────────────────────────────────── */

/* قائمة المهملات */
app.get('/api/trash', (_req, res) => {
  if (!fs.existsSync(TRASH_DIR)) return res.json({ items: [] });
  const items = fs.readdirSync(TRASH_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(TRASH_DIR, f), 'utf8')); }
      catch (_) { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at));
  res.json({ items });
});

/* استرجاع من المهملات */
app.post('/api/trash/:id/restore', (req, res) => {
  const trashPath = path.join(TRASH_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(trashPath)) return res.status(404).json({ error: 'Not found' });

  const data    = JSON.parse(fs.readFileSync(trashPath, 'utf8'));
  const destDir = path.join(ROOT, `_${data.lang}`, data.cat);
  const destFp  = path.join(destDir, data.file);

  /* إذا الملف موجود أضف timestamp للاسم */
  const finalFp = fs.existsSync(destFp)
    ? path.join(destDir, `restored_${Date.now()}_${data.file}`)
    : destFp;

  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(finalFp, data.content);
  fs.unlinkSync(trashPath);
  res.json({ ok: true, file: path.basename(finalFp) });
});

/* حذف نهائي من المهملات */
app.delete('/api/trash/:id', (req, res) => {
  const trashPath = path.join(TRASH_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(trashPath)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(trashPath);
  res.json({ ok: true });
});

/* تفريغ المهملات */
app.delete('/api/trash', (_req, res) => {
  if (fs.existsSync(TRASH_DIR)) {
    fs.readdirSync(TRASH_DIR)
      .filter(f => f.endsWith('.json'))
      .forEach(f => fs.unlinkSync(path.join(TRASH_DIR, f)));
  }
  res.json({ ok: true });
});

/* Images list */
app.get('/api/images', (req, res) => {
  const lang = req.query.lang;
  if (lang) return res.json(getImages(lang));
  res.json([...getImages('ar'), ...getImages('en')]);
});

/* Upload images — صيغ الويب تُحفظ كما هي، غيرها يُحوَّل */
app.post('/api/images/:lang', handleUpload, async (req, res) => {
  const lang     = req.params.lang;
  const destDir  = path.join(ROOT, 'assets', 'images', lang);
  const uploaded = [];

  for (const file of req.files || []) {
    try {
      const { filename, converted } = await saveImage(file.buffer, file.originalname, destDir);
      uploaded.push({
        name: filename, lang,
        url:  `/site-images/${lang}/${filename}`,
        size: fs.statSync(path.join(destDir, filename)).size,
        converted
      });
    } catch (err) {
      console.error('[Upload Error]', file.originalname, err.message);
      return res.status(500).json({ error: `فشل "${file.originalname}": ${err.message}` });
    }
  }
  res.json({ ok: true, uploaded });
});

/* Delete image */
app.delete('/api/images/:lang/:name', (req, res) => {
  const fp = path.join(ROOT, 'assets', 'images', req.params.lang, req.params.name);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(fp);
  res.json({ ok: true });
});

/* Import image from filesystem path */
app.post('/api/images/import', async (req, res) => {
  const { sourcePath, langs } = req.body;
  if (!sourcePath || !langs) return res.status(400).json({ error: 'sourcePath and langs required' });
  if (!fs.existsSync(sourcePath)) return res.status(404).json({ error: 'الملف غير موجود: ' + sourcePath });
  if (!ALL_FORMATS.test(sourcePath)) return res.status(400).json({ error: 'صيغة غير مدعومة' });

  const targets = langs === 'both' ? ['ar', 'en'] : [langs];
  const copied  = [];
  let converted = false;

  try {
    for (const lang of targets) {
      const destDir = path.join(ROOT, 'assets', 'images', lang);
      const result  = await saveImageFromPath(sourcePath, destDir);
      converted = result.converted;
      copied.push({ lang, filename: result.filename, url: `/site-images/${lang}/${result.filename}` });
    }
  } catch (err) {
    return res.status(500).json({ error: 'فشل الاستيراد: ' + err.message });
  }

  res.json({ ok: true, filename: copied[0]?.filename, copied, converted });
});

/* Config */
app.get('/api/config', (_req, res) => {
  const fp = path.join(ROOT, '_config.yml');
  res.json({ content: fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : '' });
});

/* Git status — يشمل الفارق مع الـ remote */
app.get('/api/git/status', (_req, res) => {
  const { execSync } = require('child_process');
  try {
    execSync('git fetch origin main --quiet', { cwd: ROOT });
    const status  = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' });
    const log     = execSync('git log --oneline -5', { cwd: ROOT, encoding: 'utf8' });
    const ahead   = parseInt(execSync('git rev-list --count HEAD ^origin/main', { cwd: ROOT, encoding: 'utf8' }).trim(), 10) || 0;
    const behind  = parseInt(execSync('git rev-list --count origin/main ^HEAD', { cwd: ROOT, encoding: 'utf8' }).trim(), 10) || 0;
    res.json({ status, log, ahead, behind });
  } catch (e) { res.json({ status: '', log: '', ahead: 0, behind: 0 }); }
});

/* ── مساعد: حالة rebase/merge الحالية ────────────────────────── */
function getMergeStatus() {
  return {
    inRebase: fs.existsSync(path.join(ROOT, '.git', 'rebase-merge')) ||
              fs.existsSync(path.join(ROOT, '.git', 'rebase-apply')),
    inMerge:  fs.existsSync(path.join(ROOT, '.git', 'MERGE_HEAD'))
  };
}

/* ── مساعد: قائمة الملفات المتعارضة ──────────────────────────── */
function getConflictedFiles() {
  const { execSync } = require('child_process');
  try {
    const out = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });
    return out.split('\n')
      .filter(l => /^(UU|AA|DU|UD|AU|UA) /.test(l))
      .map(l => l.slice(3).trim())
      .filter(Boolean);
  } catch (_) { return []; }
}

/* Git pull — مزامنة ذكية مع كشف التعارضات */
app.post('/api/git/pull', (_req, res) => {
  const { execSync } = require('child_process');
  try {
    /* 1) جرّب ff-only (الحالة الأنظف) */
    const out = execSync('git pull --ff-only origin main', { cwd: ROOT, encoding: 'utf8' });
    res.json({ ok: true, message: out.trim() || 'Already up to date.', mode: 'fast-forward' });
  } catch (e) {
    /* 2) فشل ff-only → استخدم rebase */
    try {
      const out = execSync('git pull --rebase --autostash origin main', { cwd: ROOT, encoding: 'utf8' });
      res.json({ ok: true, message: 'تمت إعادة الترتيب', mode: 'rebase', detail: out.trim() });
    } catch (e2) {
      /* 3) فشل rebase → تحقق من وجود تعارضات للحل */
      const status   = getMergeStatus();
      const conflicts = getConflictedFiles();
      if ((status.inRebase || status.inMerge) && conflicts.length > 0) {
        return res.status(409).json({
          needsResolution: true,
          conflicts,
          message: `تعارض في ${conflicts.length} ملف`,
          ...status
        });
      }
      /* لا تعارضات قابلة للحل → ألغِ وأبلغ */
      try { execSync('git rebase --abort', { cwd: ROOT }); } catch (_) {}
      res.status(500).json({ error: e2.message.split('\n').slice(0, 2).join(' | ') });
    }
  }
});

/* قائمة التعارضات مع معاينة لكل نسخة */
app.get('/api/git/conflicts', (_req, res) => {
  const { execSync } = require('child_process');
  const files = getConflictedFiles();
  const conflicts = files.map(file => {
    let ours = '', theirs = '';
    try { ours   = execSync(`git show :2:"${file}"`,  { cwd: ROOT, encoding: 'utf8' }); } catch (_) {}
    try { theirs = execSync(`git show :3:"${file}"`,  { cwd: ROOT, encoding: 'utf8' }); } catch (_) {}
    return {
      file,
      oursPreview:   ours.slice(0, 600),
      theirsPreview: theirs.slice(0, 600),
      oursSize:      ours.length,
      theirsSize:    theirs.length
    };
  });
  res.json({ ...getMergeStatus(), conflicts, count: conflicts.length });
});

/* حل ملف واحد بنسخة محلية أو بعيدة */
app.post('/api/git/resolve', (req, res) => {
  const { execSync } = require('child_process');
  const { file, strategy } = req.body || {};
  if (!file || !['ours', 'theirs'].includes(strategy))
    return res.status(400).json({ error: "file و strategy ('ours' أو 'theirs') مطلوبان" });
  try {
    /* استخدم نسخة الجانب المختار + أضف للـ stage */
    execSync(`git checkout --${strategy} -- "${file}"`, { cwd: ROOT });
    execSync(`git add -- "${file}"`,                     { cwd: ROOT });
    res.json({ ok: true, file, strategy });
  } catch (e) { res.status(500).json({ error: e.message.split('\n')[0] }); }
});

/* إكمال الـ rebase/merge بعد حل كل التعارضات */
app.post('/api/git/continue', (_req, res) => {
  const { execSync } = require('child_process');
  const status = getMergeStatus();
  try {
    if (status.inRebase) {
      execSync('git -c core.editor=true rebase --continue', {
        cwd: ROOT, env: { ...process.env, GIT_EDITOR: 'true' }
      });
    } else if (status.inMerge) {
      execSync('git -c core.editor=true commit --no-edit', { cwd: ROOT });
    }
    /* تحقق من تعارضات جديدة (rebase متعدد commits قد يكشف أخرى) */
    const newStatus  = getMergeStatus();
    const conflicts  = getConflictedFiles();
    if ((newStatus.inRebase || newStatus.inMerge) && conflicts.length > 0) {
      return res.json({ ok: false, hasMore: true, conflicts, ...newStatus });
    }
    res.json({ ok: true, done: true });
  } catch (e) {
    /* قد يكون هناك تعارض جديد بعد continue */
    const conflicts = getConflictedFiles();
    if (conflicts.length > 0) {
      return res.json({ ok: false, hasMore: true, conflicts, ...getMergeStatus() });
    }
    res.status(500).json({ error: e.message.split('\n').slice(0, 2).join(' | ') });
  }
});

/* إلغاء rebase/merge والعودة لحالة ما قبل المحاولة */
app.post('/api/git/abort', (_req, res) => {
  const { execSync } = require('child_process');
  const status = getMergeStatus();
  try {
    if (status.inRebase)     execSync('git rebase --abort', { cwd: ROOT });
    else if (status.inMerge) execSync('git merge --abort',  { cwd: ROOT });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Git push — single remote */
app.post('/api/git/push', (req, res) => {
  const { execSync } = require('child_process');
  const msg    = (req.body.message || 'update: via admin panel').replace(/"/g, "'");
  const remote = req.body.remote || 'origin';
  const branch = req.body.branch || 'main';
  try {
    execSync('git add .', { cwd: ROOT });
    try { execSync(`git commit -m "${msg}"`, { cwd: ROOT }); } catch (_) {}
    execSync(`git push ${remote} ${branch}`, { cwd: ROOT });
    res.json({ ok: true, remote, branch });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Git push — all selected remotes */
app.post('/api/git/push-all', (req, res) => {
  const { execSync } = require('child_process');
  const msg     = (req.body.message || 'update: via admin panel').replace(/"/g, "'");
  const remotes = req.body.remotes || ['origin'];
  const branch  = req.body.branch  || 'main';
  try {
    execSync('git add .', { cwd: ROOT });
    try { execSync(`git commit -m "${msg}"`, { cwd: ROOT }); } catch (_) {}
  } catch (_) {}
  const results = remotes.map(r => {
    try { execSync(`git push ${r} ${branch}`, { cwd: ROOT }); return { remote:r, ok:true }; }
    catch (e) { return { remote:r, ok:false, error:e.message.split('\n')[0] }; }
  });
  res.json({ results });
});

/* Remotes list */
app.get('/api/remotes', (_req, res) => {
  const { execSync } = require('child_process');
  const remotes = [];
  try {
    const out = execSync('git remote -v', { cwd: ROOT, encoding: 'utf8' });
    const seen = new Set();
    out.trim().split('\n').forEach(line => {
      const m = line.match(/^(\S+)\s+(\S+)\s+\(push\)/);
      if (m && !seen.has(m[1])) { remotes.push({ name: m[1], url: m[2] }); seen.add(m[1]); }
    });
  } catch (_) {}
  res.json({ remotes });
});

/* Add / update remote */
app.post('/api/remotes', (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'name and url required' });
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) return res.status(400).json({ error: 'Invalid remote name' });
  const { execSync } = require('child_process');
  try {
    const existing = execSync('git remote', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n');
    if (existing.includes(name)) execSync(`git remote set-url ${name} "${url}"`, { cwd: ROOT });
    else                         execSync(`git remote add ${name} "${url}"`,     { cwd: ROOT });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Remove remote */
app.delete('/api/remotes/:name', (req, res) => {
  const { execSync } = require('child_process');
  try { execSync(`git remote remove ${req.params.name}`, { cwd: ROOT }); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

/* Auth — status */
app.get('/api/auth/status', (_req, res) => {
  res.json({ hasPassword: !!getPassHash() });
});

/* Auth — login */
app.post('/api/auth/login', (req, res) => {
  const hash = getPassHash();
  if (!hash) return res.json({ ok: true, token: null });   // no password
  if (hashPwd(req.body.password || '') !== hash)
    return res.status(401).json({ error: 'كلمة مرور خاطئة' });
  res.json({ ok: true, token: makeToken(hash) });
});

/* Auth — set / change password */
app.post('/api/auth/set-password', (req, res) => {
  const { password, current } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  const hash = getPassHash();
  if (hash && hashPwd(current || '') !== hash)
    return res.status(401).json({ error: 'كلمة المرور الحالية خاطئة' });
  fs.writeFileSync(PASSWORD_FILE, hashPwd(password), 'utf8');
  res.json({ ok: true, token: makeToken(hashPwd(password)) });
});

/* Auth — remove password */
app.delete('/api/auth/password', (req, res) => {
  const hash = getPassHash();
  if (hash && hashPwd(req.body.current || '') !== hash)
    return res.status(401).json({ error: 'كلمة المرور الحالية خاطئة' });
  if (fs.existsSync(PASSWORD_FILE)) fs.unlinkSync(PASSWORD_FILE);
  res.json({ ok: true });
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  const locked = !!getPassHash();
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   GT-NEWSTECH Admin Panel            ║`);
  console.log(`  ║   http://localhost:${PORT}              ║`);
  console.log(`  ║   ${locked ? '🔒 محمية بكلمة مرور' : '🔓 بدون كلمة مرور    '}           ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
