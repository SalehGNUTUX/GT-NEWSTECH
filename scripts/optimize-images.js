#!/usr/bin/env node
/**
 * optimize-images.js — ضغط دفعة واحدة لكل الصور الموجودة
 *
 * الاستخدام:
 *   node scripts/optimize-images.js          # ضغط مع نسخ احتياطية
 *   node scripts/optimize-images.js --new    # فقط الصور بدون .webp companion
 *   node scripts/optimize-images.js --dry    # محاكاة بدون كتابة
 *
 * يفعل:
 *  1. نسخ احتياطية إلى assets/images/_originals/<lang>/<name> (gitignored)
 *  2. تكبير إلى max 1600px width
 *  3. JPEG: quality 85 + mozjpeg، PNG: ضغط أقصى، WebP: quality 82
 *  4. حذف EXIF metadata
 *  5. توليد <name>.webp companion لكل JPG/PNG
 */
import { readdir, readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LANGS = ['ar', 'en'];
const BACKUP_DIR = join(ROOT, 'assets', 'images', '_originals');
const MAX_WIDTH = 1600;
const EXTS = /\.(jpg|jpeg|png|webp|avif)$/i;

const args = process.argv.slice(2);
const NEW_ONLY = args.includes('--new');
const DRY = args.includes('--dry');
// --avif: يولّد مرافق .avif إضافةً إلى .webp لكل صورة jpg/jpeg/png.
// القوالب تفضّله على webp تلقائياً حين يوجد (انظر responsive-image.html).
const WITH_AVIF = args.includes('--avif');

// الصيغ التي نُولّد لها مرافقات. AVIF و WebP هما بالفعل الصيغتان
// الأكفأ — الملف المرفوع بإحداهما لا يحتاج مرافقاً.
const MASTER_EXTS = ['.jpg', '.jpeg', '.png'];

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(2)} MB`;
}

async function processImage(srcPath, lang, name) {
  const ext = extname(name).toLowerCase();
  const base = basename(name, ext);
  const dir = join(ROOT, 'assets', 'images', lang);

  // SVG/GIF — تخطّي
  if (ext === '.svg' || ext === '.gif') return null;

  const isMaster = MASTER_EXTS.includes(ext);

  // ── فحص --new ───────────────────────────────────────────────
  // كان الشرط «تخطَّ لو وُجد base.webp» فقط. الصور المرفوعة بصيغة
  // avif/webp لا يُولَّد لها مرافق webp أبداً، فكان الشرط لا يتحقّق لها
  // مطلقاً: كل تشغيل لـ--new (وهو يعمل في CI عند كل رفع صورة) يُعيد
  // ترميزها بفقدٍ من جديد — تدهور تراكمي في جودتها.
  // الصيغ المضغوطة أصلاً لا شيء يُولَّد لها، فتُتخطّى في وضع --new.
  if (NEW_ONLY) {
    if (!isMaster) return null;
    const webpDone = existsSync(join(dir, `${base}.webp`));
    const avifDone = !WITH_AVIF || existsSync(join(dir, `${base}.avif`));
    if (webpDone && avifDone) return null;
  }

  const buffer = await readFile(srcPath);
  const beforeSize = buffer.length;

  // نسخ احتياطية
  if (!DRY) {
    const backupPath = join(BACKUP_DIR, lang, name);
    await mkdir(dirname(backupPath), { recursive: true });
    if (!existsSync(backupPath)) await copyFile(srcPath, backupPath);
  }

  // ضغط main
  let pipeline = sharp(buffer, { failOn: 'none' });
  const meta = await pipeline.metadata();
  const willResize = meta.width > MAX_WIDTH;
  if (willResize) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  pipeline = pipeline.withMetadata({ orientation: undefined });

  let mainBuffer;
  if (ext === '.jpg' || ext === '.jpeg') {
    mainBuffer = await pipeline.jpeg({ quality: 85, mozjpeg: true, progressive: true }).toBuffer();
  } else if (ext === '.png') {
    mainBuffer = await pipeline.png({ compressionLevel: 9, palette: meta.channels < 4 }).toBuffer();
  } else if (ext === '.webp') {
    mainBuffer = await pipeline.webp({ quality: 82 }).toBuffer();
  } else if (ext === '.avif') {
    mainBuffer = await pipeline.avif({ quality: 70 }).toBuffer();
  }

  // مرافقات WebP (و AVIF مع --avif) لصور jpg/jpeg/png
  let webpBuffer = null;
  let avifBuffer = null;
  if (isMaster) {
    let webpPipe = sharp(buffer, { failOn: 'none' });
    if (willResize) webpPipe = webpPipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    webpBuffer = await webpPipe.webp({ quality: 82 }).toBuffer();

    if (WITH_AVIF) {
      let avifPipe = sharp(buffer, { failOn: 'none' });
      if (willResize) avifPipe = avifPipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      // effort:4 توازن معقول بين الحجم وزمن الترميز (AVIF بطيء)
      avifBuffer = await avifPipe.avif({ quality: 60, effort: 4 }).toBuffer();
      // لا فائدة من مرافق أكبر من الـwebp — المتصفح يفضّله لأنه أول
      // <source> في القالب، فنتخلّص منه إن لم يكن أصغر فعلاً
      if (avifBuffer.length >= webpBuffer.length) avifBuffer = null;
    }
  }

  // فقط حفظ لو الجديد أصغر (تجنّب توسيع صور صغيرة بالفعل)
  const savedMain = mainBuffer.length < beforeSize;
  if (!DRY && savedMain) await writeFile(srcPath, mainBuffer);
  if (!DRY && webpBuffer) await writeFile(join(dir, `${base}.webp`), webpBuffer);
  if (!DRY && avifBuffer) await writeFile(join(dir, `${base}.avif`), avifBuffer);

  return {
    name,
    before: beforeSize,
    after: savedMain ? mainBuffer.length : beforeSize,
    webp: webpBuffer ? webpBuffer.length : 0,
    avif: avifBuffer ? avifBuffer.length : 0,
    saved: savedMain,
    resized: willResize,
  };
}

async function run() {
  console.log(DRY ? '🧪 وضع المحاكاة (لا كتابة)\n' : '🚀 ضغط الصور...\n');
  let totalBefore = 0, totalAfter = 0, totalWebp = 0, totalAvif = 0, processed = 0, skipped = 0;

  for (const lang of LANGS) {
    const dir = join(ROOT, 'assets', 'images', lang);
    if (!existsSync(dir)) continue;
    const files = (await readdir(dir)).filter(f => EXTS.test(f));
    console.log(`📁 ${lang}/ — ${files.length} ملف`);

    for (const f of files) {
      try {
        const result = await processImage(join(dir, f), lang, f);
        if (!result) { skipped++; continue; }
        const diff = result.before - result.after;
        const pct = result.saved ? Math.round((diff / result.before) * 100) : 0;
        const marker = result.saved ? `−${pct}%` : '⚪';
        const resz = result.resized ? ' [resized]' : '';
        const avifNote = result.avif ? ` +${fmt(result.avif)} avif` : '';
        console.log(`  ${marker.padEnd(5)} ${f.padEnd(40)} ${fmt(result.before)} → ${fmt(result.after)} (+${fmt(result.webp)} webp${avifNote})${resz}`);
        totalBefore += result.before;
        totalAfter += result.after;
        totalWebp += result.webp;
        totalAvif += result.avif;
        processed++;
      } catch (e) {
        console.error(`  ❌ ${f}: ${e.message}`);
      }
    }
    console.log('');
  }

  const totalSaved = totalBefore - totalAfter;
  const pctSaved = totalBefore ? Math.round((totalSaved / totalBefore) * 100) : 0;
  console.log('════════════════════════════════════════════');
  console.log(`  مُعالَجة: ${processed} | متخطّاة: ${skipped}`);
  console.log(`  قبل:  ${fmt(totalBefore)}`);
  console.log(`  بعد:  ${fmt(totalAfter)} (وفر ${pctSaved}%)`);
  console.log(`  WebP: ${fmt(totalWebp)} (companions)`);
  if (WITH_AVIF) console.log(`  AVIF: ${fmt(totalAvif)} (companions)`);
  console.log(`  المجموع الجديد: ${fmt(totalAfter + totalWebp + totalAvif)}`);
  console.log('════════════════════════════════════════════');
  if (!DRY && processed > 0) {
    console.log(`  نسخ احتياطية: ${BACKUP_DIR}`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
