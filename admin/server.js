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
const SECURITY_FILE = path.join(__dirname, '.admin-security.json'); // gitignored
const GITHUB_TOKEN_FILE = path.join(__dirname, '.github-token'); // gitignored
const TRASH_DIR     = path.join(__dirname, '.trash');           // legacy، تُحفظ مؤقتاً لكن لا تُستعمل
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

/* Token مع ختم زمني للجلسة (sliding session) */
function makeToken(h) {
  const ts = Date.now();
  const sig = crypto.createHmac('sha256', h).update(`gnt-v2-${ts}`).digest('hex');
  return `${ts}.${sig}`;
}

function verifyToken(token, hash) {
  if (!token || !hash) return false;
  const idx = token.indexOf('.');
  if (idx < 0) return false;
  const ts  = parseInt(token.slice(0, idx), 10);
  const sig = token.slice(idx + 1);
  if (!ts || isNaN(ts)) return false;

  /* تحقّق من انتهاء الجلسة */
  const cfg = readSecCfg();
  const ttlMs = (cfg.sessionMinutes || 1440) * 60 * 1000;  // افتراضي 24 ساعة
  if (Date.now() - ts > ttlMs) return false;

  /* تحقّق من التوقيع */
  const expected = crypto.createHmac('sha256', hash).update(`gnt-v2-${ts}`).digest('hex');
  return sig === expected;
}

/* إعدادات الأمان (تأكيد كلمة المرور للإجراءات + مدة الجلسة) */
function readSecCfg() {
  let cfg = {
    sessionMinutes: 1440,  // 24 ساعة
    confirmFor: { create_article: false, edit_article: false, delete_article: false, push: false }
  };
  if (fs.existsSync(SECURITY_FILE)) {
    try {
      const stored = JSON.parse(fs.readFileSync(SECURITY_FILE, 'utf8'));
      cfg.sessionMinutes = stored.sessionMinutes ?? cfg.sessionMinutes;
      cfg.confirmFor = { ...cfg.confirmFor, ...(stored.confirmFor || {}) };
      /* ترحيل المفتاح القديم save_article → كلا create + edit */
      if (stored.confirmFor && 'save_article' in stored.confirmFor) {
        const old = stored.confirmFor.save_article;
        cfg.confirmFor.create_article = cfg.confirmFor.create_article || old;
        cfg.confirmFor.edit_article   = cfg.confirmFor.edit_article   || old;
        delete cfg.confirmFor.save_article;
      }
    } catch (_) {}
  }
  return cfg;
}
function writeSecCfg(cfg) { fs.writeFileSync(SECURITY_FILE, JSON.stringify(cfg, null, 2)); }

/* Middleware: يتطلّب تأكيد كلمة المرور
   - actionKey:    اسم الإجراء (للعرض في الـ modal)
   - alwaysRequire: إذا true → يُطلب التأكيد دائماً (لا يقرأ من الإعدادات) */
function confirmRequired(actionKey, alwaysRequire = false) {
  return (req, res, next) => {
    const hash = getPassHash();
    if (!hash) return next();                       // لا كلمة مرور → ممرّ مفتوح
    if (!alwaysRequire) {
      const cfg = readSecCfg();
      if (!cfg.confirmFor?.[actionKey]) return next(); // غير محمي حسب الإعدادات
    }

    const ct = req.headers['x-admin-confirm'];
    if (!ct) return res.status(401).json({ needsConfirm: true, action: actionKey });

    const idx = ct.indexOf('.');
    if (idx < 0) return res.status(401).json({ needsConfirm: true, action: actionKey });
    const exp = parseInt(ct.slice(0, idx), 10);
    const sig = ct.slice(idx + 1);
    if (!exp || Date.now() > exp) {
      return res.status(401).json({ needsConfirm: true, action: actionKey, expired: true });
    }
    const expected = crypto.createHmac('sha256', hash).update(`confirm-${exp}`).digest('hex');
    if (sig !== expected) return res.status(401).json({ needsConfirm: true, action: actionKey });
    next();
  };
}

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
  if (verifyToken(tok, hash)) return next();
  res.status(401).json({ error: 'Unauthorized', sessionExpired: true });
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
  const stat    = fs.statSync(fp);
  return { ...parsed.data, content: parsed.content.trim(),
           _file: file, _lang: lang, _cat: cat,
           _mtime: stat.mtimeMs }; // للكشف عن تعارض الحفظ
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
      return { name: f, lang, url: `/site-images/${lang}/${f}`, size: stat.size, mtime: stat.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime); // الأحدث أولاً
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
/* ── تحديث cms/config.yml تلقائياً عند إضافة قسم ─────────────────
   يضيف القسم لجميع كتل options: في AR و EN (category + also_in)
   مع الحفاظ على التعليقات والبنية (line-based، ليس YAML round-trip) */
function updateCmsConfig(id, nameAr, nameEn) {
  const cmsPath = path.join(ROOT, 'cms', 'config.yml');
  if (!fs.existsSync(cmsPath)) return { skipped: 'cms/config.yml غير موجود' };

  try {
    const original = fs.readFileSync(cmsPath, 'utf8');
    /* تجنّب الإضافة المكررة */
    if (original.includes(`value: ${id} }`)) {
      return { skipped: 'القسم موجود مسبقاً في cms/config.yml' };
    }

    const lines = original.split('\n');
    const out = [];
    let inCol  = null;           // 'ar' / 'en' / null
    let inOpts = false;          // داخل options:؟
    let lastOptIdx = -1;         // فهرس آخر سطر option في out
    let optIndent = '';

    const flush = () => {
      if (inOpts && lastOptIdx >= 0 && inCol) {
        const label = inCol === 'en' ? nameEn : nameAr;
        out.splice(lastOptIdx + 1, 0,
          `${optIndent}- { label: "${label}", value: ${id} }`);
        lastOptIdx = -1;
      }
      inOpts = false;
    };

    for (const line of lines) {
      const tr = line.trim();

      if (tr.startsWith('- name: ar_articles'))      { flush(); inCol = 'ar'; }
      else if (tr.startsWith('- name: en_articles')) { flush(); inCol = 'en'; }

      if (tr === 'options:') {
        flush();                                 /* أنهِ كتلة سابقة إن وُجدت */
        inOpts = true;
        lastOptIdx = -1;
      } else if (inOpts && /^\s+- \{ label:/.test(line)) {
        out.push(line);
        lastOptIdx = out.length - 1;
        optIndent  = line.match(/^(\s*)/)[1];
        continue;
      } else if (inOpts && tr !== '' && !/^\s+#/.test(line)) {
        flush();                                 /* انتهت الكتلة بسطر آخر */
      }
      out.push(line);
    }
    flush();                                     /* لو الكتلة بنهاية الملف */

    fs.writeFileSync(cmsPath, out.join('\n'));
    return { ok: true };
  } catch (err) {
    return { error: err.message };
  }
}

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

  // الإضافة إلى cms/config.yml (Decap CMS)
  const cmsSync = updateCmsConfig(id, name_ar, name_en);

  res.json({ ok: true, category: newCat, cmsSync });
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
app.post('/api/article', confirmRequired('create_article'), (req, res) => {
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
app.put('/api/article', confirmRequired('edit_article'), (req, res) => {
  const { lang, cat, file } = req.query;
  if (!lang || !cat || !file) return res.status(400).json({ error: 'Missing params' });
  const fp = path.join(ROOT, `_${lang}`, cat, file);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  const { content, ...fm } = req.body;
  saveArticle(lang, cat, file, fm, content || '');
  res.json({ ok: true });
});

/* Delete article → ينقل إلى المهملات */
/* ── Trash unified: _trash/ + _data/trash-index.json (نفس contract Worker)
   لتظهر السلة في كلتا اللوحتين (محلية + بعيدة). ── */
const TRASH_ROOT   = path.join(ROOT, '_trash');
const TRASH_INDEX  = path.join(ROOT, '_data', 'trash-index.json');

function makeTrashId() {
  const ts  = Math.floor(Date.now() / 1000).toString(36);
  const rnd = Math.floor(Math.random() * 0xffff).toString(36).padStart(4, '0');
  return `${ts}-${rnd}`;
}

function readTrashIndex() {
  if (!fs.existsSync(TRASH_INDEX)) return { entries: [] };
  try { return JSON.parse(fs.readFileSync(TRASH_INDEX, 'utf8')); }
  catch (_) { return { entries: [] }; }
}

function writeTrashIndex(idx) {
  fs.mkdirSync(path.dirname(TRASH_INDEX), { recursive: true });
  fs.writeFileSync(TRASH_INDEX, JSON.stringify({ entries: idx.entries || [] }, null, 2) + '\n');
}

app.delete('/api/article', confirmRequired('delete_article'), (req, res) => {
  const { lang, cat, file } = req.query;
  if (!lang || !cat || !file) return res.status(400).json({ error: 'Missing params' });
  const originalPath = path.join(ROOT, `_${lang}`, cat, file);
  if (!fs.existsSync(originalPath)) return res.status(404).json({ error: 'Not found' });

  const content = fs.readFileSync(originalPath, 'utf8');
  const parsed = matter(content);
  const id = makeTrashId();
  const trashRelPath = `_trash/${id}.md`;
  const trashFp = path.join(ROOT, trashRelPath);

  /* انقل الملف لـ _trash/ + سجّل في الفهرس */
  fs.mkdirSync(TRASH_ROOT, { recursive: true });
  fs.writeFileSync(trashFp, content, 'utf8');

  const idx = readTrashIndex();
  idx.entries.unshift({
    id,
    originalPath: `_${lang}/${cat}/${file}`,
    trashPath: trashRelPath,
    deletedAt: new Date().toISOString(),
    title: parsed.data.title || '',
    slug: parsed.data.slug || '',
    lang, cat, file,
  });
  writeTrashIndex(idx);

  fs.unlinkSync(originalPath);
  res.json({ ok: true, trashId: id });
});

/* ── Trash API (unified) ──────────────────────────────────────── */

/* قائمة المهملات — يُرجع نفس شكل اللوحة البعيدة (مصفوفة من entries) */
app.get('/api/trash', (_req, res) => {
  const idx = readTrashIndex();
  res.json(idx.entries);
});

/* استرجاع من المهملات */
app.post('/api/trash/:id/restore', (req, res) => {
  const id = req.params.id;
  const idx = readTrashIndex();
  const entry = idx.entries.find(e => e.id === id);
  if (!entry) return res.status(404).json({ error: 'Not found' });

  const trashFp = path.join(ROOT, entry.trashPath);
  if (!fs.existsSync(trashFp)) return res.status(404).json({ error: 'Trash file missing' });

  const destFp = path.join(ROOT, entry.originalPath);
  /* إذا الملف موجود أضف timestamp للاسم لتفادي الكتابة فوقه */
  const finalFp = fs.existsSync(destFp)
    ? path.join(path.dirname(destFp), `restored_${Date.now()}_${path.basename(destFp)}`)
    : destFp;

  fs.mkdirSync(path.dirname(finalFp), { recursive: true });
  fs.copyFileSync(trashFp, finalFp);
  fs.unlinkSync(trashFp);

  idx.entries = idx.entries.filter(e => e.id !== id);
  writeTrashIndex(idx);
  res.json({ ok: true, file: path.basename(finalFp) });
});

/* حذف نهائي من المهملات */
app.delete('/api/trash/:id', (req, res) => {
  const id = req.params.id;
  const idx = readTrashIndex();
  const entry = idx.entries.find(e => e.id === id);
  if (!entry) return res.status(404).json({ error: 'Not found' });

  const trashFp = path.join(ROOT, entry.trashPath);
  if (fs.existsSync(trashFp)) fs.unlinkSync(trashFp);
  idx.entries = idx.entries.filter(e => e.id !== id);
  writeTrashIndex(idx);
  res.json({ ok: true });
});

/* تفريغ المهملات */
app.delete('/api/trash', (_req, res) => {
  const idx = readTrashIndex();
  let removed = 0;
  for (const entry of idx.entries) {
    const trashFp = path.join(ROOT, entry.trashPath);
    if (fs.existsSync(trashFp)) { fs.unlinkSync(trashFp); removed++; }
  }
  writeTrashIndex({ entries: [] });
  res.json({ ok: true, removed });
});

/* Images list */
app.get('/api/images', (req, res) => {
  const lang = req.query.lang;
  if (lang) return res.json(getImages(lang));
  res.json([...getImages('ar'), ...getImages('en')]);
});

/* ── ⚠️ ترتيب المسارات مهم: المسارات المخصصة قبل :lang ────── */

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

/* Import image from internet URL — يُنزِّل ويحفظ في مجلد لغة محدد */
app.post('/api/images/from-url', async (req, res) => {
  const { url, lang, filename: customName } = req.body || {};
  if (!url || !lang) return res.status(400).json({ error: 'url و lang مطلوبان' });
  if (!['ar', 'en'].includes(lang)) return res.status(400).json({ error: 'lang يجب أن يكون ar أو en' });

  try {
    const r = await fetch(url, { redirect: 'follow' });
    if (!r.ok) return res.status(400).json({ error: `الخادم البعيد رفض الطلب: ${r.status}` });

    const contentType = r.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'الرابط لا يشير إلى صورة (' + contentType + ')' });
    }

    let name = customName;
    if (!name) {
      const u = new URL(url);
      const last = path.basename(u.pathname).split('?')[0];
      name = last && /\.\w+$/.test(last) ? last : `from-url-${Date.now()}.jpg`;
    }
    name = name.replace(/[^\w.-]/g, '_');

    const buffer  = Buffer.from(await r.arrayBuffer());
    const destDir = path.join(ROOT, 'assets', 'images', lang);
    fs.mkdirSync(destDir, { recursive: true });

    const result = await saveImage(buffer, name, destDir);
    res.json({
      ok: true,
      filename: result.filename,
      converted: result.converted,
      url: `/site-images/${lang}/${result.filename}`
    });
  } catch (err) {
    res.status(500).json({ error: 'فشل التنزيل: ' + err.message });
  }
});

/* Delete image */
app.delete('/api/images/:lang/:name', (req, res) => {
  const fp = path.join(ROOT, 'assets', 'images', req.params.lang, req.params.name);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(fp);
  res.json({ ok: true });
});

/* Upload images — يجب أن يكون آخر POST لـ /api/images/* لأن :lang يلتقط أي قيمة */
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
app.post('/api/git/push', confirmRequired('push'), (req, res) => {
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
app.post('/api/git/push-all', confirmRequired('push'), (req, res) => {
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
/* إزالة الحماية — يتطلّب تأكيد كلمة المرور عبر confirmRequired
   ثم يحذف ملفَّي كلمة المرور والإعدادات (يُنسى كلياً) */
app.delete('/api/auth/password', confirmRequired('remove_password', true), (_req, res) => {
  if (fs.existsSync(PASSWORD_FILE)) fs.unlinkSync(PASSWORD_FILE);
  if (fs.existsSync(SECURITY_FILE)) fs.unlinkSync(SECURITY_FILE);  // ننسى إعدادات الأمان أيضاً
  res.json({ ok: true });
});

/* إعدادات الأمان */
app.get('/api/auth/security', (_req, res) => {
  res.json(readSecCfg());
});

/* أي تفعيل/إلغاء لخاصية أمان يتطلّب تأكيد كلمة المرور */
app.put('/api/auth/security', confirmRequired('manage_security', true), (req, res) => {
  const cur  = readSecCfg();
  const body = req.body || {};
  const next = {
    sessionMinutes: typeof body.sessionMinutes === 'number' ? body.sessionMinutes : cur.sessionMinutes,
    confirmFor: { ...cur.confirmFor, ...(body.confirmFor || {}) }
  };
  writeSecCfg(next);
  res.json({ ok: true, ...next });
});

/* تأكيد كلمة المرور لإجراء حساس → يُرجع confirmToken صالحاً 30 ثانية */
app.post('/api/auth/confirm', (req, res) => {
  const hash = getPassHash();
  if (!hash) return res.json({ ok: true, confirmToken: 'none' });
  if (hashPwd(req.body.password || '') !== hash)
    return res.status(401).json({ error: 'كلمة مرور خاطئة' });
  const exp = Date.now() + 30000;  // 30 ثانية
  const sig = crypto.createHmac('sha256', hash).update(`confirm-${exp}`).digest('hex');
  res.json({ ok: true, confirmToken: `${exp}.${sig}` });
});

/* ═══════════════════════════════════════════════════════════════
   إدارة التعليقات عبر GitHub Discussions API (GraphQL)
   ═══════════════════════════════════════════════════════════════ */

function getGitHubToken() {
  return fs.existsSync(GITHUB_TOKEN_FILE) ? fs.readFileSync(GITHUB_TOKEN_FILE, 'utf8').trim() : null;
}

async function githubGraphQL(query, variables = {}) {
  const token = getGitHubToken();
  if (!token) throw new Error('NO_TOKEN');
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GT-NEWSTECH-Admin'
    },
    body: JSON.stringify({ query, variables })
  });
  const data = await r.json();
  if (data.errors) throw new Error(data.errors.map(e => e.message).join(' | '));
  if (!data.data) throw new Error('Empty response');
  return data.data;
}

/* حالة الـ Token */
app.get('/api/github-token/status', (_req, res) => {
  res.json({ hasToken: !!getGitHubToken() });
});

/* حفظ Token (يتطلب تأكيد كلمة المرور دائماً) */
app.post('/api/github-token', confirmRequired('manage_security', true), (req, res) => {
  const { token } = req.body || {};
  if (!token || typeof token !== 'string' || token.length < 20) {
    return res.status(400).json({ error: 'token غير صالح' });
  }
  fs.writeFileSync(GITHUB_TOKEN_FILE, token.trim(), { mode: 0o600 });
  res.json({ ok: true });
});

/* حذف Token */
app.delete('/api/github-token', confirmRequired('manage_security', true), (_req, res) => {
  if (fs.existsSync(GITHUB_TOKEN_FILE)) fs.unlinkSync(GITHUB_TOKEN_FILE);
  res.json({ ok: true });
});

/* جلب كل النقاشات والتعليقات */
app.get('/api/comments', async (_req, res) => {
  if (!getGitHubToken()) return res.status(400).json({ error: 'No token configured', needsToken: true });
  try {
    const data = await githubGraphQL(`
      query {
        repository(owner: "SalehGNUTUX", name: "GT-NEWSTECH") {
          discussions(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
            totalCount
            nodes {
              id title url createdAt updatedAt locked
              author { login avatarUrl url }
              comments(first: 50) {
                totalCount
                nodes {
                  id body bodyHTML createdAt
                  isAnswer isMinimized minimizedReason
                  author { login avatarUrl url }
                  authorAssociation
                  reactions(first: 20) {
                    totalCount
                    nodes { content user { login } }
                  }
                  replies(first: 20) {
                    totalCount
                    nodes {
                      id body bodyHTML createdAt
                      isMinimized minimizedReason
                      author { login avatarUrl url }
                      authorAssociation
                    }
                  }
                }
              }
              reactionGroups {
                content
                users(first: 0) { totalCount }
              }
            }
          }
        }
      }
    `);
    res.json(data.repository);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* الرد على نقاش أو تعليق */
app.post('/api/comments/reply', async (req, res) => {
  const { discussionId, replyToId, body } = req.body || {};
  if (!discussionId || !body) return res.status(400).json({ error: 'discussionId و body مطلوبان' });
  try {
    const input = { discussionId, body };
    if (replyToId) input.replyToId = replyToId;
    const data = await githubGraphQL(`
      mutation($input: AddDiscussionCommentInput!) {
        addDiscussionComment(input: $input) {
          comment { id body createdAt }
        }
      }
    `, { input });
    res.json({ ok: true, comment: data.addDiscussionComment.comment });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* إخفاء تعليق (minimize) — يحتاج classifier */
app.post('/api/comments/:id/hide', async (req, res) => {
  const validClassifiers = ['OFF_TOPIC', 'SPAM', 'ABUSE', 'OUTDATED', 'DUPLICATE', 'RESOLVED'];
  const classifier = (req.body && req.body.reason) || 'OFF_TOPIC';
  if (!validClassifiers.includes(classifier)) {
    return res.status(400).json({ error: 'reason غير صالح' });
  }
  try {
    const data = await githubGraphQL(`
      mutation($input: MinimizeCommentInput!) {
        minimizeComment(input: $input) {
          minimizedComment { isMinimized minimizedReason }
        }
      }
    `, { input: { subjectId: req.params.id, classifier } });
    res.json({ ok: true, ...data.minimizeComment.minimizedComment });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* إظهار تعليق مخفي (unminimize) */
app.post('/api/comments/:id/unhide', async (req, res) => {
  try {
    const data = await githubGraphQL(`
      mutation($id: ID!) {
        unminimizeComment(input: { subjectId: $id }) {
          unminimizedComment { ... on DiscussionComment { isMinimized } }
        }
      }
    `, { id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* حذف تعليق نهائياً */
app.delete('/api/comments/:id', async (req, res) => {
  try {
    await githubGraphQL(`
      mutation($id: ID!) {
        deleteDiscussionComment(input: { id: $id }) {
          comment { id }
        }
      }
    `, { id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* قفل نقاش */
app.post('/api/comments/discussion/:id/lock', async (req, res) => {
  try {
    await githubGraphQL(`
      mutation($id: ID!) {
        lockLockable(input: { lockableId: $id, lockReason: SPAM }) {
          lockedRecord { ... on Discussion { locked } }
        }
      }
    `, { id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* فك قفل نقاش */
app.post('/api/comments/discussion/:id/unlock', async (req, res) => {
  try {
    await githubGraphQL(`
      mutation($id: ID!) {
        unlockLockable(input: { lockableId: $id }) {
          unlockedRecord { ... on Discussion { locked } }
        }
      }
    `, { id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
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
