// محلِّل YAML بسيط جداً — يكفي لـ _data/categories.yml و front matter بسيط.
// لا يدعم anchors/aliases/multiline strings المعقدة. كافٍ لاحتياجاتنا.

export function parseYaml(text) {
  const lines = text.split('\n');
  return parseBlock(lines, 0, 0).value;
}

function parseBlock(lines, start, indent) {
  // نحاول اكتشاف هل القائمة الجذرية مصفوفة أم كائن
  let i = start;
  while (i < lines.length && (lines[i].trim() === '' || lines[i].trim().startsWith('#'))) i++;
  if (i >= lines.length) return { value: null, next: i };

  const firstReal = lines[i];
  const firstIndent = leadingSpaces(firstReal);
  if (firstIndent < indent) return { value: null, next: i };

  if (firstReal.trim().startsWith('- ')) {
    return parseArray(lines, i, firstIndent);
  }
  return parseObject(lines, i, firstIndent);
}

function parseObject(lines, start, indent) {
  const obj = {};
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) { i++; continue; }
    const curIndent = leadingSpaces(line);
    if (curIndent < indent) break;
    if (curIndent > indent) { i++; continue; } // ينبغي أن يلتقطه parseBlock أعلاه
    const m = trimmed.match(/^([^:]+):\s*(.*)$/);
    if (!m) { i++; continue; }
    const key = m[1].trim();
    const rest = m[2];
    // دعم block scalars: >, >-, >+, |, |-, |+
    if (/^[>|][+-]?\s*(#.*)?$/.test(rest)) {
      const folded = rest.startsWith('>'); // > = folded (newline → space), | = literal
      const chomp = rest.includes('-') ? 'strip' : rest.includes('+') ? 'keep' : 'clip';
      const block = readBlockScalar(lines, i + 1, indent + 1, folded);
      obj[key] = chomp === 'strip' ? block.text.replace(/\n+$/, '')
                : chomp === 'clip' ? block.text.replace(/\n+$/, '\n')
                : block.text;
      // إزالة أي مسافة بادئة ناتجة + قطع النيوسطر في الـ folded mode
      if (folded) obj[key] = obj[key].replace(/\n+$/, '');
      i = block.next;
    } else if (rest === '') {
      // قيمة كتلة (object أو array) أسفل
      const sub = parseBlock(lines, i + 1, indent + 2);
      obj[key] = sub.value;
      i = sub.next;
    } else {
      obj[key] = parseScalar(rest);
      i++;
    }
  }
  return { value: obj, next: i };
}

// يقرأ block scalar (محتوى مُحاذى) ابتداءً من السطر start بـ indent على الأقل
function readBlockScalar(lines, start, minIndent, folded) {
  const collected = [];
  let i = start;
  let baseIndent = -1;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { collected.push(''); i++; continue; }
    const ind = leadingSpaces(line);
    if (ind < minIndent) break;
    if (baseIndent < 0) baseIndent = ind;
    collected.push(line.slice(Math.min(baseIndent, ind)));
    i++;
  }
  // أزل الأسطر الفارغة الزائدة في النهاية
  while (collected.length && collected[collected.length - 1] === '') collected.pop();
  let text;
  if (folded) {
    // اطوِ الأسطر المتجاورة إلى فراغ واحد، احفظ الأسطر الفارغة كـ paragraph break
    text = '';
    for (let k = 0; k < collected.length; k++) {
      const l = collected[k];
      if (l === '') text += '\n';
      else text += (k > 0 && collected[k - 1] !== '' ? ' ' : '') + l;
    }
  } else {
    text = collected.join('\n');
  }
  return { text, next: i };
}

function parseArray(lines, start, indent) {
  const arr = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) { i++; continue; }
    const curIndent = leadingSpaces(line);
    if (curIndent < indent) break;
    if (curIndent === indent && trimmed.startsWith('- ')) {
      // عنصر جديد
      const rest = trimmed.slice(2);
      if (rest.includes(':')) {
        // كائن inline أول مفتاح
        const m = rest.match(/^([^:]+):\s*(.*)$/);
        const firstKey = m[1].trim();
        const firstVal = m[2];
        const item = { [firstKey]: firstVal === '' ? null : parseScalar(firstVal) };
        // باقي مفاتيح الكائن في الأسطر التالية بـ indent+2
        i++;
        while (i < lines.length) {
          const l = lines[i];
          const t = l.trim();
          if (t === '' || t.startsWith('#')) { i++; continue; }
          const ci = leadingSpaces(l);
          if (ci <= indent) break;
          if (t.startsWith('- ')) break;
          const mm = t.match(/^([^:]+):\s*(.*)$/);
          if (!mm) { i++; continue; }
          item[mm[1].trim()] = parseScalar(mm[2]);
          i++;
        }
        arr.push(item);
      } else {
        arr.push(parseScalar(rest));
        i++;
      }
    } else {
      break;
    }
  }
  return { value: arr, next: i };
}

function parseScalar(v) {
  v = v.trim();
  // إزالة تعليق نهاية السطر إن لم يكن داخل علامة اقتباس
  if (!v.startsWith('"') && !v.startsWith("'")) {
    const hashIdx = v.indexOf(' #');
    if (hashIdx >= 0) v = v.slice(0, hashIdx).trim();
  }
  if (v === '' || v === '~' || v === 'null') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  // مصفوفة inline
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map(x => parseScalar(x));
  }
  // نص بعلامات اقتباس
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  // رقم
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}

function leadingSpaces(line) {
  let n = 0;
  while (n < line.length && line[n] === ' ') n++;
  return n;
}

// استخراج front matter من ملف Markdown. يُرجع { data, body } أو { data: {}, body: text } لو لا يوجد.
export function parseFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  try {
    return { data: parseYaml(m[1]) || {}, body: m[2] };
  } catch {
    return { data: {}, body: m[2] };
  }
}

// كتابة قيمة كقيمة YAML آمنة (مقتبسة عند الحاجة فقط)
function yamlValue(v, depth = 0) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return v.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' +0000');
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    // مصفوفة بسيطة inline
    const items = v.map(x => yamlScalarInline(x));
    return `[${items.join(', ')}]`;
  }
  if (typeof v === 'string') return yamlScalarInline(v);
  return String(v);
}

// YAML timestamp: 2026-05-31 OR 2026-05-31 14:00:00 OR with timezone — لا حاجة لاقتباس
const YAML_TS_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?(\s*[+-]\d{2}:?\d{2}|\sZ|Z)?)?$/;

function yamlScalarInline(s) {
  s = String(s);
  if (s === '') return '""';
  // YAML timestamp — اتركه غير مقتبس (Jekyll يفضّله للمقارنة الزمنية)
  if (YAML_TS_RE.test(s)) return s;
  // إن احتوى محارف خاصة، نقتبسه
  if (/^[\d\-+.]/.test(s) || /[:#\[\]{}&*!|>'"%@`,]/.test(s) || /^\s|\s$/.test(s) ||
      /^(true|false|null|yes|no|on|off)$/i.test(s) || s.includes('\n')) {
    return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  return s;
}

// بناء front matter من كائن — مرتّب حسب الحقول الشائعة في GT-NEWSTECH
export function buildFrontMatter(data) {
  // ترتيب الحقول كما في النسخة المحلية (matter.stringify يستعمل مفاتيح الإدخال)
  const order = ['layout', 'title', 'date', 'category', 'lang', 'slug', 'author',
                 'tags', 'excerpt', 'image', 'also_in', 'affiliate'];
  const lines = ['---'];
  const seen = new Set();
  for (const k of order) {
    if (k in data && data[k] !== undefined) {
      lines.push(`${k}: ${yamlValue(data[k])}`);
      seen.add(k);
    }
  }
  // أي مفاتيح أخرى لم تُذكر في الترتيب
  for (const k of Object.keys(data)) {
    if (seen.has(k)) continue;
    if (k.startsWith('_')) continue; // حقول داخلية
    if (data[k] === undefined) continue;
    lines.push(`${k}: ${yamlValue(data[k])}`);
  }
  lines.push('---');
  return lines.join('\n');
}

// ضمّ front matter + body لإنشاء ملف md كامل
export function buildMarkdown(fm, body) {
  return buildFrontMatter(fm) + '\n' + (body || '') + (body && !body.endsWith('\n') ? '\n' : '');
}

// تسلسل لقائمة الأقسام (مصفوفة كائنات) — مطابق لشكل _data/categories.yml
export function serializeCategories(cats) {
  const lines = [];
  for (const c of cats) {
    const keys = ['id', 'name_ar', 'name_en', 'icon', 'color'];
    let first = true;
    for (const k of keys) {
      if (c[k] === undefined) continue;
      const prefix = first ? '- ' : '  ';
      lines.push(`${prefix}${k}: ${yamlValueForCat(c[k])}`);
      first = false;
    }
    // أي مفاتيح إضافية
    for (const k of Object.keys(c)) {
      if (keys.includes(k)) continue;
      if (c[k] === undefined) continue;
      lines.push(`  ${k}: ${yamlValueForCat(c[k])}`);
    }
  }
  return lines.join('\n') + '\n';
}

function yamlValueForCat(v) {
  if (typeof v === 'string') {
    // اقتبس النصوص في categories.yml دائماً (يحوي عربية + رموز Font Awesome)
    return '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  return yamlValue(v);
}
