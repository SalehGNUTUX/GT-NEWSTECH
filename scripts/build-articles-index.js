#!/usr/bin/env node
// build-articles-index.js — يولّد _data/articles-index.json من _ar/**/*.md و _en/**/*.md
// الاستخدام: node scripts/build-articles-index.js
// يُشغَّل تلقائياً عبر GitHub Action عند كل push يمسّ مقالاً.

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LANGS = ['ar', 'en'];
const OUT = join(ROOT, '_data', 'articles-index.json');

async function walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return []; }
  const out = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function safeISO(d) {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString();
  // gray-matter يُحوّل التواريخ غير المقتبسة إلى Date
  // المقتبسة تأتي كنص — حاول التحويل
  const parsed = new Date(String(d));
  return isNaN(parsed.getTime()) ? String(d) : parsed.toISOString();
}

async function build() {
  const all = [];
  for (const lang of LANGS) {
    const langDir = join(ROOT, `_${lang}`);
    const files = await walk(langDir);
    for (const fp of files) {
      try {
        const rel = relative(ROOT, fp);  // _ar/foss/2026-05-10-something.md
        const parts = rel.split('/');
        if (parts.length !== 3) continue;
        const _cat = parts[1];
        const _file = parts[2];
        const raw = await readFile(fp, 'utf8');
        const { data, content } = matter(raw);

        all.push({
          title: data.title || '',
          slug: data.slug || '',
          date: safeISO(data.date),
          category: data.category || _cat,
          also_in: data.also_in || [],
          author: data.author || '',
          excerpt: data.excerpt || '',
          image: data.image || '',
          tags: data.tags || [],
          layout: data.layout || 'post',
          affiliate: data.affiliate !== undefined ? data.affiliate : null,
          _file,
          _lang: lang,
          _cat,
          // لا نُخزّن content هنا — كبير جداً ولا حاجة له في القائمة
          // الـ Worker يجلبه عبر /api/article عند الحاجة
        });
      } catch (e) {
        console.error(`⚠ تخطّي ${fp}:`, e.message);
      }
    }
  }

  // ترتيب تنازلي بالتاريخ
  all.sort((a, b) => {
    const da = new Date(a.date || 0).getTime();
    const db = new Date(b.date || 0).getTime();
    return db - da;
  });

  const output = {
    generated_at: new Date().toISOString(),
    count: all.length,
    by_lang: { ar: all.filter(a => a._lang === 'ar').length, en: all.filter(a => a._lang === 'en').length },
    articles: all,
  };

  await writeFile(OUT, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`✓ ${OUT}`);
  console.log(`  ${all.length} مقال (AR=${output.by_lang.ar}, EN=${output.by_lang.en})`);
}

build().catch(e => { console.error(e); process.exit(1); });
