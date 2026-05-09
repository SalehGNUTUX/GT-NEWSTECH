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
const IMG_EXTS   = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i;

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve Jekyll project images/icons for preview
app.use('/site-images', express.static(path.join(ROOT, 'assets', 'images')));
app.use('/site-icons',  express.static(path.join(ROOT, 'assets', 'icons')));

// ── Multer — memory storage (نحوّل الصورة بعد الرفع) ──────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },   // 20MB
  fileFilter(_req, file, cb) {
    if (IMG_EXTS.test(file.originalname)) return cb(null, true);
    cb(new Error('صيغة غير مدعومة: ' + file.originalname));
  }
});

// معالج أخطاء Multer
function handleUpload(req, res, next) {
  upload.array('files', 20)(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}

// ── Image helpers ──────────────────────────────────────────────
const JPEG_EXTS = /\.(jpg|jpeg)$/i;

/** تعقيم اسم الملف وإزالة الامتداد */
function sanitizeBasename(original) {
  const ext  = path.extname(original).toLowerCase();
  const base = path.basename(original, ext);
  return base
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'image';
}

/**
 * يحوّل buffer أي صورة إلى JPEG ويحفظها
 */
async function saveAsJpeg(buffer, mimeType, baseName, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const filename = baseName + '.jpg';
  const dest     = path.join(destDir, filename);

  const isSvg  = mimeType === 'image/svg+xml';
  const opts   = isSvg ? { density: 150 } : {};

  try {
    await sharp(buffer, opts)
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(dest);
  } catch (e) {
    /* fallback: بدون mozjpeg */
    await sharp(buffer, opts)
      .jpeg({ quality: 88 })
      .toFile(dest);
  }

  return filename;
}

/**
 * يحوّل ملف مسار إلى JPEG ويحفظه
 */
async function fileToJpeg(sourcePath, baseName, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const filename = baseName + '.jpg';
  const dest     = path.join(destDir, filename);

  if (JPEG_EXTS.test(sourcePath)) {
    fs.copyFileSync(sourcePath, dest);
  } else {
    const isSvg = sourcePath.toLowerCase().endsWith('.svg');
    const opts  = isSvg ? { density: 150 } : {};
    try {
      await sharp(sourcePath, opts).jpeg({ quality: 88, mozjpeg: true }).toFile(dest);
    } catch (e) {
      await sharp(sourcePath, opts).jpeg({ quality: 88 }).toFile(dest);
    }
  }

  return filename;
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

/* Upload image — تحويل تلقائي إلى JPEG */
app.post('/api/images/:lang', handleUpload, async (req, res) => {
  const lang     = req.params.lang;
  const uploaded = [];

  for (const file of req.files || []) {
    try {
      const baseName  = sanitizeBasename(file.originalname);
      const destDir   = path.join(ROOT, 'assets', 'images', lang);
      const wasJpeg   = JPEG_EXTS.test(file.originalname);
      const filename  = await saveAsJpeg(file.buffer, file.mimetype, baseName, destDir);
      const size      = fs.statSync(path.join(destDir, filename)).size;
      uploaded.push({
        name: filename, lang,
        url: `/site-images/${lang}/${filename}`,
        size,
        converted: !wasJpeg
      });
    } catch (err) {
      console.error('[Upload Error]', file.originalname, err.message);
      return res.status(500).json({
        error: `فشل معالجة "${file.originalname}": ${err.message}`
      });
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

/* Import image from filesystem path — تحويل تلقائي إلى JPEG */
app.post('/api/images/import', async (req, res) => {
  const { sourcePath, langs } = req.body;
  if (!sourcePath || !langs) return res.status(400).json({ error: 'sourcePath and langs required' });
  if (!fs.existsSync(sourcePath)) return res.status(404).json({ error: 'Source file not found: ' + sourcePath });
  if (!IMG_EXTS.test(sourcePath)) return res.status(400).json({ error: 'صيغة غير مدعومة' });

  const baseName = sanitizeBasename(path.basename(sourcePath));
  const wasJpeg  = JPEG_EXTS.test(sourcePath);
  const targets  = langs === 'both' ? ['ar', 'en'] : [langs];
  const copied   = [];

  try {
    for (const lang of targets) {
      const destDir  = path.join(ROOT, 'assets', 'images', lang);
      const filename = await fileToJpeg(sourcePath, baseName, destDir);
      copied.push({ lang, filename, url: `/site-images/${lang}/${filename}` });
    }
  } catch (err) {
    return res.status(500).json({ error: 'فشل التحويل: ' + err.message });
  }

  const filename  = copied[0]?.filename;
  res.json({ ok: true, filename, copied, converted: !wasJpeg });
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
