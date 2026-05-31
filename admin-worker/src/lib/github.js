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

// ════════════════════════════════════════════════════════════
//   الكتابة (المرحلة 2) — يحتاج PAT بصلاحية Contents: Read+Write
// ════════════════════════════════════════════════════════════

// ترميز نص → base64 آمن لـ UTF-8
function toB64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

// ترميز Uint8Array → base64 (للصور)
function bytesToB64(bytes) {
  let bin = '';
  const chunk = 32768;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

// إنشاء أو تحديث ملف نصي.
// opts: { path, content (نص), message, sha? (مطلوب للتحديث), branch?, author? }
// يُرجع { sha, commit } عند النجاح.
export async function putFile(env, opts) {
  const { path, content, message, sha, branch, author } = opts;
  const url = `${API}/repos/${env.GITHUB_REPO}/contents/${encodeURI(path)}`;
  const body = {
    message: message || `update ${path}`,
    content: toB64(content),
    branch: branch || env.GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;
  if (author) {
    body.author = author;
    body.committer = author;
  }
  const r = await fetch(url, {
    method: 'PUT',
    headers: headers(env, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    const err = new Error(`GitHub ${r.status}: ${txt}`);
    err.status = r.status;
    err.body = txt;
    throw err;
  }
  const j = await r.json();
  return { sha: j.content?.sha, commit: j.commit };
}

// إنشاء أو تحديث ملف ثنائي (صورة).
// opts: { path, bytes (Uint8Array), message, sha?, branch?, author? }
export async function putBinaryFile(env, opts) {
  const { path, bytes, message, sha, branch, author } = opts;
  const url = `${API}/repos/${env.GITHUB_REPO}/contents/${encodeURI(path)}`;
  const body = {
    message: message || `add ${path}`,
    content: bytesToB64(bytes),
    branch: branch || env.GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;
  if (author) {
    body.author = author;
    body.committer = author;
  }
  const r = await fetch(url, {
    method: 'PUT',
    headers: headers(env, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    const err = new Error(`GitHub ${r.status}: ${txt}`);
    err.status = r.status;
    err.body = txt;
    throw err;
  }
  const j = await r.json();
  return { sha: j.content?.sha, commit: j.commit };
}

// commit ذرّي بعدة ملفات دفعة واحدة (Git Trees API)
// files: [{ path, content, encoding?: 'utf-8'|'base64' }]
// يُرجع { commit: { sha, ... } }
export async function commitFiles(env, files, message, author) {
  const branch = env.GITHUB_BRANCH;
  const repo = env.GITHUB_REPO;
  const baseHeaders = headers(env, { 'Content-Type': 'application/json' });

  // 1) الحصول على SHA الـ HEAD الحالي
  const refR = await fetch(`${API}/repos/${repo}/git/ref/heads/${branch}`, { headers: baseHeaders });
  if (!refR.ok) throw new Error(`ref: ${await refR.text()}`);
  const refJ = await refR.json();
  const headSha = refJ.object.sha;

  // 2) احصل على base tree
  const commitR = await fetch(`${API}/repos/${repo}/git/commits/${headSha}`, { headers: baseHeaders });
  if (!commitR.ok) throw new Error(`commit: ${await commitR.text()}`);
  const baseTree = (await commitR.json()).tree.sha;

  // 3) أنشئ blob لكل ملف
  const treeItems = [];
  for (const f of files) {
    const encoded = f.encoding === 'base64'
      ? f.content
      : btoa(unescape(encodeURIComponent(f.content))); // UTF-8 → base64
    const blobR = await fetch(`${API}/repos/${repo}/git/blobs`, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify({ content: encoded, encoding: 'base64' }),
    });
    if (!blobR.ok) throw new Error(`blob ${f.path}: ${await blobR.text()}`);
    const blobJ = await blobR.json();
    treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blobJ.sha });
  }

  // 4) أنشئ tree جديد
  const treeR = await fetch(`${API}/repos/${repo}/git/trees`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ base_tree: baseTree, tree: treeItems }),
  });
  if (!treeR.ok) throw new Error(`tree: ${await treeR.text()}`);
  const newTreeSha = (await treeR.json()).sha;

  // 5) أنشئ commit جديد
  const cBody = {
    message,
    tree: newTreeSha,
    parents: [headSha],
  };
  if (author) {
    cBody.author = author;
    cBody.committer = author;
  }
  const newCommitR = await fetch(`${API}/repos/${repo}/git/commits`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify(cBody),
  });
  if (!newCommitR.ok) throw new Error(`new commit: ${await newCommitR.text()}`);
  const newCommit = await newCommitR.json();

  // 6) حدّث الـ ref
  const updateR = await fetch(`${API}/repos/${repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    headers: baseHeaders,
    body: JSON.stringify({ sha: newCommit.sha }),
  });
  if (!updateR.ok) throw new Error(`update ref: ${await updateR.text()}`);

  return { commit: newCommit };
}

// حذف ملف. يحتاج sha (للقفل التفاؤلي).
// opts: { path, message, sha, branch?, author? }
export async function deleteFile(env, opts) {
  const { path, message, sha, branch, author } = opts;
  if (!sha) throw new Error('sha مطلوب للحذف (قفل تفاؤلي)');
  const url = `${API}/repos/${env.GITHUB_REPO}/contents/${encodeURI(path)}`;
  const body = {
    message: message || `delete ${path}`,
    sha,
    branch: branch || env.GITHUB_BRANCH,
  };
  if (author) {
    body.author = author;
    body.committer = author;
  }
  const r = await fetch(url, {
    method: 'DELETE',
    headers: headers(env, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    const err = new Error(`GitHub ${r.status}: ${txt}`);
    err.status = r.status;
    err.body = txt;
    throw err;
  }
  return await r.json();
}
