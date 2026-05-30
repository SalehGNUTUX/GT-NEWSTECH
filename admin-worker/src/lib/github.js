// GitHub Contents API wrapper مبسَّط — للقراءة فقط في المرحلة 1.
// كل دالة تستعمل GITHUB_TOKEN من البيئة.

const API = 'https://api.github.com';

function headers(env, extra = {}) {
  return {
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'gt-newstech-admin-worker',
    ...extra,
  };
}

// قراءة محتوى ملف نصي. يُرجع { content, sha, size } أو null لو 404.
export async function getFile(env, path, ref) {
  const url = `${API}/repos/${env.GITHUB_REPO}/contents/${encodeURI(path)}?ref=${ref || env.GITHUB_BRANCH}`;
  const r = await fetch(url, { headers: headers(env) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
  const j = await r.json();
  // base64 → نص
  const content = j.encoding === 'base64'
    ? new TextDecoder().decode(Uint8Array.from(atob(j.content.replace(/\n/g, '')), c => c.charCodeAt(0)))
    : j.content;
  return { content, sha: j.sha, size: j.size, name: j.name, path: j.path };
}

// قراءة محتوى ملف ثنائي (صورة). يُرجع { bytes, sha, mediaType } أو null لو 404.
export async function getBinary(env, path, ref) {
  const url = `${API}/repos/${env.GITHUB_REPO}/contents/${encodeURI(path)}?ref=${ref || env.GITHUB_BRANCH}`;
  const r = await fetch(url, { headers: headers(env) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const bin = Uint8Array.from(atob(j.content.replace(/\n/g, '')), c => c.charCodeAt(0));
  return { bytes: bin, sha: j.sha, size: j.size, name: j.name };
}

// قائمة محتويات مجلد. يُرجع مصفوفة [{ name, path, type, size, sha }] أو [] لو 404.
export async function listDir(env, path, ref) {
  const url = `${API}/repos/${env.GITHUB_REPO}/contents/${encodeURI(path)}?ref=${ref || env.GITHUB_BRANCH}`;
  const r = await fetch(url, { headers: headers(env) });
  if (r.status === 404) return [];
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
  const arr = await r.json();
  if (!Array.isArray(arr)) return [];
  return arr.map(x => ({ name: x.name, path: x.path, type: x.type, size: x.size, sha: x.sha }));
}

// قراءة شجرة مجلد بكامل ملفاته دفعة واحدة (Git Trees API — أكفأ من listDir المتكرر).
// path: مسار جذر داخل المستودع، يقبل '' للجذر.
// يُرجع كل blobs تحت ذلك المسار. يستعمل recursive=1.
export async function getTree(env, ref) {
  const url = `${API}/repos/${env.GITHUB_REPO}/git/trees/${ref || env.GITHUB_BRANCH}?recursive=1`;
  const r = await fetch(url, { headers: headers(env) });
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return { sha: j.sha, truncated: !!j.truncated, tree: j.tree || [] };
}

// قراءة blob بـ sha مباشرة (للمحتوى الكبير).
export async function getBlob(env, sha) {
  const url = `${API}/repos/${env.GITHUB_REPO}/git/blobs/${sha}`;
  const r = await fetch(url, { headers: headers(env) });
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const content = j.encoding === 'base64'
    ? new TextDecoder().decode(Uint8Array.from(atob(j.content.replace(/\n/g, '')), c => c.charCodeAt(0)))
    : j.content;
  return { content, size: j.size };
}
