'use strict';

const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const matter   = require('gray-matter');
const multer   = require('multer');
const sharp    = require('sharp');

const app  = express();
const PORT = 4001;

// ── Paths ──────────────────────────────────────────────────────
const ROOT       = path.join(__dirname, '..');
const CATS       = ['gnutux-projects', 'foss', 'gnulinux', 'tech-news', 'ai'];
const LANGS      = ['ar', 'en'];
const IMG_EXTS   = /\.(jpg|jpeg|png|gif|webp|svg|avif|webp)$/i;

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
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
    for (const cat of CATS) {
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
  const all  = getAllArticles();
  const byLang = { ar: 0, en: 0 };
  const byCat  = {};
  CATS.forEach(c => { byCat[c] = 0; });
  all.forEach(a => {
    byLang[a._lang] = (byLang[a._lang] || 0) + 1;
    byCat[a._cat]   = (byCat[a._cat]   || 0) + 1;
  });
  res.json({ total: all.length, byLang, byCat, recent: all.slice(0, 6) });
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

/* Delete article */
app.delete('/api/article', (req, res) => {
  const { lang, cat, file } = req.query;
  if (!lang || !cat || !file) return res.status(400).json({ error: 'Missing params' });
  const fp = path.join(ROOT, `_${lang}`, cat, file);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(fp);
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

/* Git status */
app.get('/api/git/status', (_req, res) => {
  const { execSync } = require('child_process');
  try {
    const status = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' });
    const log    = execSync('git log --oneline -5', { cwd: ROOT, encoding: 'utf8' });
    res.json({ status, log });
  } catch (e) { res.json({ status: 'Git error', log: '' }); }
});

/* Git push */
app.post('/api/git/push', (req, res) => {
  const { execSync } = require('child_process');
  const msg = (req.body.message || 'update: via admin panel').replace(/"/g, "'");
  try {
    execSync('git add .', { cwd: ROOT });
    execSync(`git commit -m "${msg}"`, { cwd: ROOT });
    execSync('git push origin main', { cwd: ROOT });
    res.json({ ok: true, message: 'Pushed successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   GT-NEWSTECH Admin Panel            ║`);
  console.log(`  ║   http://localhost:${PORT}              ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
