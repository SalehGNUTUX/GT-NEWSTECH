#!/usr/bin/env node
// build-images-index.js — يولّد _data/images-index.json
// لكل صورة في assets/images/{ar,en}/ يستخرج آخر تاريخ commit عبر git log،
// إضافة إلى أبعادها (width/height) عبر sharp.
// يُشغَّل تلقائياً عبر GitHub Action عند أي تغيير في الصور.
//
// لماذا الأبعاد؟ القوالب تكتبها في وسمَي width/height على <img>، فيحجز
// المتصفح المساحة الصحيحة قبل تحميل الصورة (يمنع قفزات التخطيط/CLS)
// ويعرف نسبة الصورة فيعرضها كاملة دون قص.

import { readdir, writeFile, stat } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LANGS = ['ar', 'en'];
const OUT = join(ROOT, '_data', 'images-index.json');
const IMG_EXTS = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i;

/** أبعاد الصورة. SVG بلا أبعاد ثابتة، والملفات التالفة تُعاد بصفر. */
async function dimensions(filePath) {
  if (/\.svg$/i.test(filePath)) return { width: 0, height: 0 };
  try {
    const m = await sharp(filePath, { failOn: 'none' }).metadata();
    // AVIF/HEIF المدوَّرة عبر EXIF: sharp يبلّغ الأبعاد قبل التدوير
    const swap = m.orientation && m.orientation >= 5 && m.orientation <= 8;
    return {
      width:  (swap ? m.height : m.width)  || 0,
      height: (swap ? m.width  : m.height) || 0,
    };
  } catch {
    return { width: 0, height: 0 };
  }
}

function gitLastCommitTs(filePath) {
  // unix timestamp لآخر commit يمسّ الملف. 0 لو غير معروف.
  try {
    const ts = execSync(`git log -1 --format=%at -- "${filePath}"`, {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    return ts ? parseInt(ts, 10) : 0;
  } catch {
    return 0;
  }
}

async function buildForLang(lang) {
  const dir = join(ROOT, 'assets', 'images', lang);
  let entries;
  try { entries = await readdir(dir); }
  catch { return []; }
  const out = [];
  for (const name of entries) {
    if (!IMG_EXTS.test(name)) continue;
    const fp = join(dir, name);
    try {
      const st = await stat(fp);
      if (!st.isFile()) continue;
      const rel = relative(ROOT, fp);
      const ts = gitLastCommitTs(rel);
      const { width, height } = await dimensions(fp);
      out.push({
        name,
        size: st.size,
        width,
        height,
        last_modified_ts: ts,
        path: rel.split('\\').join('/'), // Windows-safe
      });
    } catch (e) {
      console.error(`⚠ تخطّي ${fp}: ${e.message}`);
    }
  }
  // الأحدث أولاً
  out.sort((a, b) => b.last_modified_ts - a.last_modified_ts);
  return out;
}

/**
 * خريطة name → {w,h} لكل لغة.
 * القوالب تحتاج جوابين عن كل صورة: أبعادها، وهل يوجد لها مرافق
 * .avif/.webp. البحث في المصفوفة عبر Liquid `where` مسحٌ خطّي يتكرّر
 * لكل بطاقة في كل صفحة (ضاعف زمن البناء). القاموس يجعلها O(1).
 */
function nameMap(list) {
  const map = {};
  for (const it of list) map[it.name] = { w: it.width, h: it.height };
  return map;
}

async function build() {
  const result = {
    generated_at: new Date().toISOString(),
    ar: await buildForLang('ar'),
    en: await buildForLang('en'),
  };
  result.ar_map = nameMap(result.ar);
  result.en_map = nameMap(result.en);
  result.count_ar = result.ar.length;
  result.count_en = result.en.length;
  await writeFile(OUT, JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(`✓ ${OUT}`);
  console.log(`  ${result.count_ar} صورة AR | ${result.count_en} صورة EN`);
}

build().catch(e => { console.error(e); process.exit(1); });
